/**
 * Serveur MenuAI : extraction IA du menu, génération d'images, stockage.
 * Ce fichier ne doit jamais être importé côté client.
 */
import { unzipSync, strFromU8 } from "fflate";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Configuration IA manquante");
  return key;
}

export type ExtractedDish = {
  name: string;
  description: string;
  price: number | null;
  ingredients: string[];
};

export type ExtractedCategory = {
  name: string;
  dishes: ExtractedDish[];
};

export type ExtractedMenu = {
  restaurantName: string | null;
  categories: ExtractedCategory[];
};

const SYSTEM_PROMPT = `Tu es un expert en digitalisation de menus de restaurants d'Afrique francophone (Mali, Sénégal, Côte d'Ivoire).
À partir du contenu fourni, extrais le menu complet et renvoie UNIQUEMENT un JSON valide, sans texte autour, au format :
{"restaurantName": string|null, "categories": [{"name": string, "dishes": [{"name": string, "description": string, "price": number|null, "ingredients": [string]}]}]}
Règles :
- Regroupe les plats en catégories cohérentes (Entrées, Plats, Grillades, Desserts, Boissons…). Si aucune catégorie n'est indiquée, déduis-les.
- price est un entier en FCFA, sans espace ni devise. null si le prix est absent.
- description : une phrase courte et appétissante en français, rédige-la si elle manque.
- ingredients : 3 à 6 ingrédients principaux déduits du nom du plat (ex. tiep : riz, poisson, tomate, carotte).
- Corrige l'orthographe française, garde les noms de plats locaux (tiep, mafé, alloco, capitaine, attiéké…).
- N'invente jamais de plat absent du document.`;

/** Extrait le texte brut d'un fichier .docx (pur JS, compatible edge). */
export function textFromDocx(bytes: Uint8Array): string {
  const files = unzipSync(bytes);
  const doc = files["word/document.xml"];
  if (!doc) return "";
  const xml = strFromU8(doc);
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x2019;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type SourceFile = { name: string; mime: string; base64: string };

export async function extractMenu(input: {
  text?: string;
  file?: SourceFile;
}): Promise<ExtractedMenu> {
  const content: Record<string, unknown>[] = [];

  if (input.file) {
    const { mime, base64, name } = input.file;
    if (mime.startsWith("image/")) {
      content.push({ type: "text", text: "Voici la photo du menu à structurer." });
      content.push({ type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } });
    } else if (mime === "application/pdf") {
      content.push({ type: "text", text: "Voici le menu en PDF à structurer." });
      content.push({
        type: "file",
        file: { filename: name, file_data: `data:application/pdf;base64,${base64}` },
      });
    } else {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const text = textFromDocx(bytes);
      if (!text) throw new Error("Impossible de lire ce document.");
      content.push({ type: "text", text: `Voici le menu à structurer :\n\n${text}` });
    }
  } else {
    content.push({ type: "text", text: `Voici le menu à structurer :\n\n${input.text ?? ""}` });
  }

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Trop de demandes en cours. Réessaie dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés. Recharge le compte pour continuer.");
    throw new Error(`L'analyse du menu a échoué (${res.status}). ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("L'IA n'a pas pu structurer ce menu. Essaie un fichier plus lisible.");
  const parsed = JSON.parse(match[0]) as ExtractedMenu;

  parsed.categories = (parsed.categories ?? [])
    .map((c) => ({
      name: c.name?.trim() || "Menu",
      dishes: (c.dishes ?? []).filter((d) => d?.name?.trim()),
    }))
    .filter((c) => c.dishes.length > 0);

  if (parsed.categories.length === 0) throw new Error("Aucun plat détecté dans ce document.");
  return parsed;
}

const CUISINE_PROMPT = (name: string, ingredients: string[]) =>
  `Photographie culinaire professionnelle d'un plat africain nommé "${name}"${
    ingredients.length ? `, préparé avec : ${ingredients.join(", ")}` : ""
  }. Assiette réaliste servie dans un restaurant d'Afrique de l'Ouest, lumière naturelle chaude, fond texturé neutre, vue légèrement en plongée, cadrage carré, très appétissant, rendu photo réaliste, pas de texte.`;

/** Génère une image de plat et renvoie les octets PNG. */
export async function generateDishImage(
  name: string,
  ingredients: string[],
): Promise<Uint8Array | null> {
  const res = await fetch(`${GATEWAY}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-image-2",
      prompt: CUISINE_PROMPT(name, ingredients),
      quality: "low",
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    console.error("Image generation failed", res.status, await res.text().catch(() => ""));
    return null;
  }

  const json = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) return null;
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export async function uploadDishImage(path: string, bytes: Uint8Array): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage
    .from("dish-images")
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (error) throw new Error(error.message);
  return path;
}

export async function downloadDishImage(path: string): Promise<ArrayBuffer | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.storage.from("dish-images").download(path);
  if (error || !data) return null;
  return await data.arrayBuffer();
}
