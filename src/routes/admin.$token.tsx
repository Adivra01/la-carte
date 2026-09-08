import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ThemePicker } from "@/components/theme-picker";
import {
  addDish,
  deleteDish,
  getAdminMenu,
  regenerateDishImage,
  renameCategory,
  setMenuTheme,
  updateDish,
  updateRestaurant,
  uploadDishPhoto,
} from "@/lib/menu.functions";

type AdminData = NonNullable<Awaited<ReturnType<typeof getAdminMenu>>>;

export const Route = createFileRoute("/admin/$token")({
  head: () => ({
    meta: [
      { title: "Gérer mon menu — MenuAI" },
      {
        name: "description",
        content:
          "Modifie tes plats, tes textes, tes prix et tes photos depuis ton lien privé MenuAI.",
      },
      { property: "og:title", content: "Gérer mon menu — MenuAI" },
      { property: "og:description", content: "Espace de gestion du menu restaurant MenuAI." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.readAsDataURL(file);
  });
}

function AdminPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getAdminMenu);
  const save = useServerFn(updateDish);
  const create = useServerFn(addDish);
  const remove = useServerFn(deleteDish);
  const saveTheme = useServerFn(setMenuTheme);
  const saveRestaurant = useServerFn(updateRestaurant);
  const saveCategory = useServerFn(renameCategory);
  const sendPhoto = useServerFn(uploadDishPhoto);
  const regenPhoto = useServerFn(regenerateDishImage);

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDish, setNewDish] = useState<Record<string, string>>({});
  const [busyImage, setBusyImage] = useState<string | null>(null);

  useEffect(() => {
    void load({ data: { token } })
      .then(setData)
      .catch(() => toast.error("Lien d'administration invalide"))
      .finally(() => setLoading(false));
  }, [load, token]);

  function patchLocal(dishId: string, patch: Record<string, unknown>) {
    setData((prev) =>
      prev
        ? { ...prev, dishes: prev.dishes.map((d) => (d.id === dishId ? { ...d, ...patch } : d)) }
        : prev,
    );
  }

  async function persist(dishId: string, patch: Record<string, unknown>) {
    try {
      await save({ data: { token, dishId, ...patch } });
    } catch {
      toast.error("Enregistrement impossible");
    }
  }

  function patchRestaurant(patch: Record<string, unknown>) {
    setData((prev) => (prev ? { ...prev, restaurant: { ...prev.restaurant, ...patch } } : prev));
  }

  async function persistRestaurant(patch: Record<string, unknown>) {
    try {
      await saveRestaurant({ data: { token, ...patch } });
    } catch {
      toast.error("Enregistrement impossible");
    }
  }

  async function applyTheme(theme: string, accent: string | null) {
    patchRestaurant({ theme, accent });
    try {
      await saveTheme({ data: { token, theme, accent } });
    } catch {
      toast.error("Changement de style impossible");
    }
  }

  async function onPhoto(dishId: string, file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Formats acceptés : JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Photo trop lourde (8 Mo maximum).");
      return;
    }
    setBusyImage(dishId);
    try {
      const base64 = await toBase64(file);
      const { imagePath } = await sendPhoto({
        data: { token, dishId, mime: file.type as "image/png", base64 },
      });
      patchLocal(dishId, { image_url: imagePath });
      toast.success("Photo mise à jour");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Envoi impossible");
    } finally {
      setBusyImage(null);
    }
  }

  async function onRegenerate(dishId: string) {
    setBusyImage(dishId);
    try {
      const { imagePath } = await regenPhoto({ data: { token, dishId } });
      patchLocal(dishId, { image_url: imagePath });
      toast.success("Nouvelle photo générée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Génération impossible");
    } finally {
      setBusyImage(null);
    }
  }

  async function onDelete(dishId: string) {
    setData((prev) =>
      prev ? { ...prev, dishes: prev.dishes.filter((d) => d.id !== dishId) } : prev,
    );
    try {
      await remove({ data: { token, dishId } });
    } catch {
      toast.error("Suppression impossible");
    }
  }

  async function handleAdd(categoryId: string) {
    const name = (newDish[categoryId] ?? "").trim();
    if (!name) return;
    try {
      const { id } = await create({
        data: { categoryId, token, name, description: "", price: null },
      });
      setData((prev) =>
        prev
          ? {
              ...prev,
              dishes: [
                ...prev.dishes,
                {
                  id,
                  name,
                  description: null,
                  price: null,
                  available: true,
                  image_url: null,
                  category_id: categoryId,
                  position: 999,
                },
              ],
            }
          : prev,
      );
      setNewDish((p) => ({ ...p, [categoryId]: "" }));
      toast.success("Plat ajouté");
    } catch {
      toast.error("Ajout impossible");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Lien invalide</h1>
        <p className="mt-2 text-muted-foreground">Ce lien de gestion n'est plus valable.</p>
        <Button asChild className="mt-6">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-3xl font-bold">{data.restaurant.name}</h1>
      <p className="mt-1 text-muted-foreground">Gestion du menu · lien privé</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link to="/m/$slug" params={{ slug: data.restaurant.slug }} search={{ admin: undefined }}>
          Voir la page publique
        </Link>
      </Button>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Informations du restaurant</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rname">Nom</Label>
            <Input
              id="rname"
              className="mt-2"
              value={data.restaurant.name}
              onChange={(e) => patchRestaurant({ name: e.target.value })}
              onBlur={(e) => void persistRestaurant({ name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="rcity">Ville</Label>
            <Input
              id="rcity"
              className="mt-2"
              value={data.restaurant.city ?? ""}
              onChange={(e) => patchRestaurant({ city: e.target.value })}
              onBlur={(e) => void persistRestaurant({ city: e.target.value || null })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="rwa">Numéro WhatsApp</Label>
            <Input
              id="rwa"
              className="mt-2"
              value={data.restaurant.whatsapp ?? ""}
              onChange={(e) => patchRestaurant({ whatsapp: e.target.value })}
              onBlur={(e) => void persistRestaurant({ whatsapp: e.target.value || null })}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Style de la carte</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Change les couleurs quand tu veux : la page publique et la brochure à imprimer suivent.
        </p>
        <ThemePicker
          themeId={data.restaurant.theme ?? "feu"}
          accent={data.restaurant.accent ?? null}
          onThemeChange={(id) => void applyTheme(id, data.restaurant.accent ?? null)}
          onAccentChange={(a) => void applyTheme(data.restaurant.theme ?? "feu", a)}
          {...(data.dishes[0]
            ? { sample: { name: data.dishes[0].name, price: data.dishes[0].price } }
            : {})}
        />
      </section>

      {data.categories.map((category) => (
        <section key={category.id} className="mt-10">
          <Input
            className="h-9 max-w-xs text-base font-bold"
            value={category.name}
            onChange={(e) =>
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      categories: prev.categories.map((c) =>
                        c.id === category.id ? { ...c, name: e.target.value } : c,
                      ),
                    }
                  : prev,
              )
            }
            onBlur={(e) => {
              const name = e.target.value.trim();
              if (name) void saveCategory({ data: { token, categoryId: category.id, name } });
            }}
          />
          <div className="mt-3 space-y-3">
            {data.dishes
              .filter((d) => d.category_id === category.id)
              .map((dish) => (
                <div key={dish.id} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className="relative size-24 overflow-hidden rounded-xl border border-border/70 bg-muted">
                        {dish.image_url ? (
                          <img
                            src={`/api/public/img?path=${encodeURIComponent(dish.image_url)}`}
                            alt={`Photo du plat ${dish.name}`}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <ImagePlus className="size-5" />
                          </div>
                        )}
                        {busyImage === dish.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                            <Loader2 className="size-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-col gap-1">
                        <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary">
                          <ImagePlus className="size-3" /> Ma photo
                          <input
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={busyImage === dish.id}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void onPhoto(dish.id, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          disabled={busyImage === dish.id}
                          onClick={() => void onRegenerate(dish.id)}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:border-primary disabled:opacity-50"
                        >
                          <Sparkles className="size-3" /> Photo IA
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          className="min-w-40 flex-1"
                          value={dish.name}
                          onChange={(e) => patchLocal(dish.id, { name: e.target.value })}
                          onBlur={(e) => void persist(dish.id, { name: e.target.value })}
                        />
                        <Input
                          className="w-28"
                          type="number"
                          placeholder="FCFA"
                          value={dish.price ?? ""}
                          onChange={(e) =>
                            patchLocal(dish.id, {
                              price: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          onBlur={(e) =>
                            void persist(dish.id, {
                              price: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <Textarea
                        className="mt-3 min-h-20"
                        placeholder="Description du plat"
                        value={dish.description ?? ""}
                        onChange={(e) => patchLocal(dish.id, { description: e.target.value })}
                        onBlur={(e) =>
                          void persist(dish.id, { description: e.target.value || null })
                        }
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Switch
                            checked={dish.available}
                            onCheckedChange={(v) => {
                              patchLocal(dish.id, { available: v });
                              void persist(dish.id, { available: v });
                            }}
                          />
                          Disponible
                        </label>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Supprimer ${dish.name}`}
                          onClick={() => void onDelete(dish.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            <div className="flex gap-2">
              <Input
                placeholder="Nouveau plat"
                value={newDish[category.id] ?? ""}
                onChange={(e) => setNewDish((p) => ({ ...p, [category.id]: e.target.value }))}
              />
              <Button variant="outline" onClick={() => void handleAdd(category.id)}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
