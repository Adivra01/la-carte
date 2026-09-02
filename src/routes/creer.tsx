import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  createMenu,
  extractMenuDraft,
  generateImageForDish,
  type PlanKey,
} from "@/lib/menu.functions";
import { ArrowLeft, FileUp, Loader2, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/creer")({
  head: () => ({
    meta: [
      { title: "Créer mon menu digital — MenuAI" },
      {
        name: "description",
        content:
          "Envoie ton menu en PDF, Word ou photo et obtiens en quelques minutes une page web premium avec QR code.",
      },
      { property: "og:title", content: "Créer mon menu digital — MenuAI" },
      {
        property: "og:description",
        content: "Envoie ton menu, l'IA génère ta vitrine digitale avec photos et QR code.",
      },
    ],
  }),
  component: CreatePage,
});

type Dish = { name: string; description: string; price: number | null; ingredients: string[] };
type Category = { name: string; dishes: Dish[] };

const CITIES = ["Bamako", "Dakar", "Abidjan", "Autre"];

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

function CreatePage() {
  const navigate = useNavigate();
  const extract = useServerFn(extractMenuDraft);
  const create = useServerFn(createMenu);
  const genImage = useServerFn(generateImageForDish);

  const [step, setStep] = useState<"upload" | "review" | "building">("upload");
  const [busy, setBusy] = useState(false);
  const [manualText, setManualText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("Bamako");
  const [whatsapp, setWhatsapp] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  async function runExtraction(payload: {
    text?: string;
    file?: { name: string; mime: string; base64: string };
  }) {
    setBusy(true);
    try {
      const result = await extract({ data: payload });
      setCategories(
        result.categories.map((c) => ({
          name: c.name,
          dishes: c.dishes.map((d) => ({
            name: d.name,
            description: d.description ?? "",
            price: d.price ?? null,
            ingredients: d.ingredients ?? [],
          })),
        })),
      );
      if (result.restaurantName && !name) setName(result.restaurantName);
      setStep("review");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "L'analyse a échoué");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File) {
    if (file.size > 12 * 1024 * 1024) {
      toast.error("Fichier trop lourd (12 Mo maximum).");
      return;
    }
    setFileName(file.name);
    const base64 = await toBase64(file);
    const mime =
      file.type ||
      (file.name.endsWith(".docx")
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "application/octet-stream");
    await runExtraction({ file: { name: file.name, mime, base64 } });
  }

  async function publish() {
    if (name.trim().length < 2) return toast.error("Indique le nom du restaurant.");
    if (whatsapp.trim().length < 6) return toast.error("Indique un numéro WhatsApp.");

    setStep("building");
    setProgress(5);
    setProgressLabel("Création de ta vitrine…");
    try {
      const created = await create({
        data: { restaurantName: name.trim(), city, whatsapp: whatsapp.trim(), categories },
      });

      const total = created.dishes.length;
      for (let i = 0; i < total; i++) {
        const dish = created.dishes[i]!;
        setProgressLabel(`Photo de « ${dish.name} » (${i + 1}/${total})`);
        setProgress(5 + Math.round(((i + 1) / total) * 90));
        try {
          await genImage({ data: { dishId: dish.id } });
        } catch {
          /* mode dégradé : on garde le placeholder */
        }
      }

      setProgress(100);
      setProgressLabel("C'est prêt !");
      navigate({
        to: "/m/$slug",
        params: { slug: created.slug },
        search: { admin: created.adminToken },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La création a échoué");
      setStep("review");
    }
  }

  const dishCount = categories.reduce((n, c) => n + c.dishes.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Menu<span className="text-primary">AI</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        {step === "upload" && (
          <div>
            <h1 className="text-3xl font-bold">Envoie ton menu</h1>
            <p className="mt-2 text-muted-foreground">
              PDF, Word ou photo du menu papier. L'IA lit les plats et les prix.
            </p>

            <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card px-6 py-12 text-center transition-colors hover:border-primary">
              <FileUp className="size-8 text-primary" />
              <span className="mt-3 font-medium">
                {fileName ?? "Choisir un fichier (PDF, Word, JPG, PNG)"}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">12 Mo maximum</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,image/*"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
            </label>

            <div className="mt-8">
              <Label htmlFor="manual">Ou saisis ton menu à la main</Label>
              <Textarea
                id="manual"
                className="mt-2 min-h-40"
                placeholder={"Entrées\nSalade avocat — 2500\n\nPlats\nTiep bou dien — 3500\nMafé — 3000"}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <Button
                className="mt-3"
                disabled={busy || manualText.trim().length < 10}
                onClick={() => void runExtraction({ text: manualText })}
              >
                {busy ? <Loader2 className="mr-1 size-4 animate-spin" /> : null}
                Analyser ce menu
              </Button>
            </div>

            {busy && (
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> L'IA lit ton menu…
              </p>
            )}
          </div>
        )}

        {step === "review" && (
          <div>
            <h1 className="text-3xl font-bold">Vérifie ton menu</h1>
            <p className="mt-2 text-muted-foreground">
              {dishCount} plats détectés. Corrige ce qui est nécessaire avant la génération.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nom du restaurant</Label>
                <Input
                  id="name"
                  className="mt-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chez Fatou"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                <Input
                  id="whatsapp"
                  className="mt-2"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+223 70 00 00 00"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Ville</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCity(c)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                        city === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {categories.map((cat, ci) => (
                <div key={ci} className="rounded-2xl border border-border bg-card p-4">
                  <Input
                    value={cat.name}
                    className="h-9 max-w-xs font-semibold"
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c, i) => (i === ci ? { ...c, name: e.target.value } : c)),
                      )
                    }
                  />
                  <div className="mt-3 space-y-2">
                    {cat.dishes.map((dish, di) => (
                      <div key={di} className="flex flex-wrap items-center gap-2">
                        <Input
                          className="h-9 min-w-40 flex-1"
                          value={dish.name}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((c, i) =>
                                i === ci
                                  ? {
                                      ...c,
                                      dishes: c.dishes.map((d, j) =>
                                        j === di ? { ...d, name: e.target.value } : d,
                                      ),
                                    }
                                  : c,
                              ),
                            )
                          }
                        />
                        <Input
                          className="h-9 w-28"
                          inputMode="numeric"
                          placeholder="Prix"
                          value={dish.price ?? ""}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setCategories((prev) =>
                              prev.map((c, i) =>
                                i === ci
                                  ? {
                                      ...c,
                                      dishes: c.dishes.map((d, j) =>
                                        j === di ? { ...d, price: v ? Number(v) : null } : d,
                                      ),
                                    }
                                  : c,
                              ),
                            );
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 shrink-0"
                          aria-label={`Supprimer ${dish.name}`}
                          onClick={() =>
                            setCategories((prev) =>
                              prev
                                .map((c, i) =>
                                  i === ci
                                    ? { ...c, dishes: c.dishes.filter((_, j) => j !== di) }
                                    : c,
                                )
                                .filter((c) => c.dishes.length > 0),
                            )
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => void publish()}>
                <Sparkles className="mr-1 size-4" /> Générer ma vitrine
              </Button>
              <Button variant="outline" size="lg" onClick={() => setStep("upload")}>
                Changer de fichier
              </Button>
            </div>
          </div>
        )}

        {step === "building" && (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <h1 className="mt-6 text-2xl font-bold">On prépare ta vitrine</h1>
            <p className="mt-2 text-muted-foreground">{progressLabel}</p>
            <Progress value={progress} className="mx-auto mt-6 max-w-md" />
            <p className="mt-4 text-sm text-muted-foreground">
              Ne ferme pas cette page, la génération des photos prend quelques minutes.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export type { PlanKey };
