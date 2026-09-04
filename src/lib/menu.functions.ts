import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const PRICING = {
  oneshot: { label: "Téléchargement PDF", amount: 12000 },
  subscription: { label: "Hébergement + QR code", amount: 5000 },
} as const;

export type PlanKey = keyof typeof PRICING;

export type PublicDish = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imagePath: string | null;
  available: boolean;
  locked: boolean;
};

export type PublicMenu = {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    whatsapp: string | null;
    plan: string;
    previewExpiresAt: string;
    expired: boolean;
    unlocked: boolean;
  };
  categories: { id: string; name: string; dishes: PublicDish[] }[];
};

const FREE_VISIBLE_DISHES = 2;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/* -------------------------------------------------------------------------- */
/* Étape 1 — extraction IA                                                    */
/* -------------------------------------------------------------------------- */

const extractSchema = z.object({
  text: z.string().optional(),
  file: z
    .object({ name: z.string(), mime: z.string(), base64: z.string().min(1) })
    .optional(),
});

export const extractMenuDraft = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => extractSchema.parse(input))
  .handler(async ({ data }) => {
    const { extractMenu } = await import("./menuai.server");
    if (!data.file && !data.text?.trim()) throw new Error("Aucun contenu fourni.");
    return await extractMenu({ ...(data.text ? { text: data.text } : {}), ...(data.file ? { file: data.file } : {}) });
  });

/* -------------------------------------------------------------------------- */
/* Étape 2 — création du restaurant et du menu                                */
/* -------------------------------------------------------------------------- */

const createSchema = z.object({
  restaurantName: z.string().min(2),
  city: z.string().min(1),
  whatsapp: z.string().min(6),
  categories: z
    .array(
      z.object({
        name: z.string().min(1),
        dishes: z
          .array(
            z.object({
              name: z.string().min(1),
              description: z.string().default(""),
              price: z.number().nullable().default(null),
              ingredients: z.array(z.string()).default([]),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export const createMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const base = slugify(data.restaurantName) || "restaurant";

    let slug = base;
    for (let i = 0; i < 20; i++) {
      const { data: existing } = await db
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: restaurant, error } = await db
      .from("restaurants")
      .insert({
        name: data.restaurantName,
        slug,
        city: data.city,
        whatsapp: data.whatsapp,
      })
      .select("id, slug, admin_token")
      .single();
    if (error || !restaurant) throw new Error(error?.message ?? "Création impossible");

    const dishes: { id: string; name: string; ingredients: string[] }[] = [];

    for (const [ci, category] of data.categories.entries()) {
      const { data: cat, error: catErr } = await db
        .from("categories")
        .insert({ restaurant_id: restaurant.id, name: category.name, position: ci })
        .select("id")
        .single();
      if (catErr || !cat) throw new Error(catErr?.message ?? "Création impossible");

      const rows = category.dishes.map((d, di) => ({
        restaurant_id: restaurant.id,
        category_id: cat.id,
        name: d.name,
        description: d.description || null,
        price: d.price,
        ingredients: d.ingredients,
        position: di,
      }));
      const { data: inserted, error: dishErr } = await db
        .from("dishes")
        .insert(rows)
        .select("id, name, ingredients");
      if (dishErr) throw new Error(dishErr.message);
      for (const d of inserted ?? []) {
        dishes.push({ id: d.id, name: d.name, ingredients: d.ingredients ?? [] });
      }
    }

    return { slug: restaurant.slug, adminToken: restaurant.admin_token, dishes };
  });

/* -------------------------------------------------------------------------- */
/* Étape 3 — génération d'image, un plat à la fois                            */
/* -------------------------------------------------------------------------- */

export const generateImageForDish = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ dishId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: dish } = await db
      .from("dishes")
      .select("id, name, ingredients, restaurant_id, image_url")
      .eq("id", data.dishId)
      .maybeSingle();
    if (!dish) throw new Error("Plat introuvable");
    if (dish.image_url) return { imagePath: dish.image_url };

    const { generateDishImage, uploadDishImage } = await import("./menuai.server");
    const bytes = await generateDishImage(dish.name, dish.ingredients ?? []);
    if (!bytes) return { imagePath: null };

    const path = `${dish.restaurant_id}/${dish.id}.png`;
    await uploadDishImage(path, bytes);
    await db.from("dishes").update({ image_url: path }).eq("id", dish.id);
    return { imagePath: path };
  });

/* -------------------------------------------------------------------------- */
/* Lecture publique du menu                                                    */
/* -------------------------------------------------------------------------- */

export const getPublicMenu = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }): Promise<PublicMenu | null> => {
    const db = await admin();
    const { data: restaurant } = await db
      .from("restaurants")
      .select("id, name, slug, city, whatsapp, plan, preview_expires_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!restaurant) return null;

    const unlocked = restaurant.plan !== "free";
    const expired = !unlocked && new Date(restaurant.preview_expires_at).getTime() < Date.now();

    const { data: categories } = await db
      .from("categories")
      .select("id, name, position")
      .eq("restaurant_id", restaurant.id)
      .order("position");
    const { data: dishes } = await db
      .from("dishes")
      .select("id, name, description, price, image_url, available, position, category_id")
      .eq("restaurant_id", restaurant.id)
      .order("position");

    let seen = 0;
    const grouped = (categories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      dishes: (dishes ?? [])
        .filter((d) => d.category_id === c.id)
        .map((d) => {
          const locked = !unlocked && seen >= FREE_VISIBLE_DISHES;
          seen += 1;
          return {
            id: d.id,
            name: d.name,
            description: d.description,
            price: d.price,
            imagePath: d.image_url,
            available: d.available,
            locked,
          };
        }),
    }));

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        city: restaurant.city,
        whatsapp: restaurant.whatsapp,
        plan: restaurant.plan,
        previewExpiresAt: restaurant.preview_expires_at,
        expired,
        unlocked,
      },
      categories: grouped,
    };
  });

/* -------------------------------------------------------------------------- */
/* Paiement mobile money                                                       */
/* -------------------------------------------------------------------------- */

const paySchema = z.object({
  slug: z.string(),
  plan: z.enum(["oneshot", "subscription"]),
  operator: z.enum(["wave", "orange", "moov"]),
  phone: z.string().min(6),
});

export const payForMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => paySchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: restaurant } = await db
      .from("restaurants")
      .select("id, slug, admin_token")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!restaurant) throw new Error("Restaurant introuvable");

    const amount = PRICING[data.plan].amount;
    const reference = `MENUAI-${Date.now().toString(36).toUpperCase()}`;

    const { data: order, error } = await db
      .from("orders")
      .insert({
        restaurant_id: restaurant.id,
        plan: data.plan,
        amount,
        operator: data.operator,
        phone: data.phone,
        reference,
        status: "pending",
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Paiement impossible");

    // Mode simulation : tant que les clés marchand FedaPay/CinetPay ne sont pas
    // configurées, le paiement est validé immédiatement pour tester le tunnel.
    const simulated = !process.env["FEDAPAY_SECRET_KEY"];
    if (!simulated) {
      // Intégration réelle : le webhook /api/public/paiement confirmera la commande.
      return { status: "pending" as const, reference, simulated };
    }

    await db.from("orders").update({ status: "paid" }).eq("id", order.id);
    await db.from("restaurants").update({ plan: data.plan }).eq("id", restaurant.id);

    return {
      status: "paid" as const,
      reference,
      simulated,
      adminToken: restaurant.admin_token,
    };
  });

/* -------------------------------------------------------------------------- */
/* QR code et partage                                                          */
/* -------------------------------------------------------------------------- */

export const getShareAssets = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string(), origin: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const QRCode = await import("qrcode");
    const url = `${data.origin}/m/${data.slug}`;
    const png = await QRCode.toDataURL(url, {
      width: 1024,
      margin: 2,
      color: { dark: "#0D0D0D", light: "#FFFFFF" },
    });
    const svg = await QRCode.toString(url, {
      type: "svg",
      margin: 2,
      color: { dark: "#0D0D0D", light: "#FFFFFF" },
    });
    return { url, png, svg };
  });

/* -------------------------------------------------------------------------- */
/* Administration par lien magique                                             */
/* -------------------------------------------------------------------------- */

export const getAdminMenu = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ token: z.string().min(10) }).parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: restaurant } = await db
      .from("restaurants")
      .select("id, name, slug, city, whatsapp, plan")
      .eq("admin_token", data.token)
      .maybeSingle();
    if (!restaurant) return null;

    const { data: categories } = await db
      .from("categories")
      .select("id, name, position")
      .eq("restaurant_id", restaurant.id)
      .order("position");
    const { data: dishes } = await db
      .from("dishes")
      .select("id, name, description, price, available, image_url, category_id, position")
      .eq("restaurant_id", restaurant.id)
      .order("position");

    return { restaurant, categories: categories ?? [], dishes: dishes ?? [] };
  });

const updateDishSchema = z.object({
  token: z.string().min(10),
  dishId: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  available: z.boolean().optional(),
});

export const updateDish = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateDishSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: restaurant } = await db
      .from("restaurants")
      .select("id")
      .eq("admin_token", data.token)
      .maybeSingle();
    if (!restaurant) throw new Error("Lien d'administration invalide");

    const patch: Record<string, string | number | boolean | null> = {};
    if (data.name !== undefined) patch["name"] = data.name;
    if (data.description !== undefined) patch["description"] = data.description;
    if (data.price !== undefined) patch["price"] = data.price;
    if (data.available !== undefined) patch["available"] = data.available;

    const { error } = await db
      .from("dishes")
      .update(patch)
      .eq("id", data.dishId)
      .eq("restaurant_id", restaurant.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const addDishSchema = z.object({
  token: z.string().min(10),
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().default(""),
  price: z.number().nullable().default(null),
});

export const addDish = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => addDishSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: restaurant } = await db
      .from("restaurants")
      .select("id")
      .eq("admin_token", data.token)
      .maybeSingle();
    if (!restaurant) throw new Error("Lien d'administration invalide");

    const { data: dish, error } = await db
      .from("dishes")
      .insert({
        restaurant_id: restaurant.id,
        category_id: data.categoryId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        position: 999,
      })
      .select("id")
      .single();
    if (error || !dish) throw new Error(error?.message ?? "Ajout impossible");
    return { id: dish.id };
  });
