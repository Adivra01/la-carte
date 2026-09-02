import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PRICING } from "@/lib/menu.functions";
import { ArrowRight, Check, QrCode, Sparkles, Smartphone, Upload } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuAI — Transforme ton menu en vitrine digitale" },
      {
        name: "description",
        content:
          "Upload ton menu PDF, Word ou photo : l'IA génère une page web premium avec photos, QR code et lien WhatsApp. Bamako, Dakar, Abidjan.",
      },
      { property: "og:title", content: "MenuAI — Transforme ton menu en vitrine digitale" },
      {
        property: "og:description",
        content: "Menu papier ou PDF transformé en vitrine digitale avec QR code, en 5 minutes.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: Upload,
    title: "1. Envoie ton menu",
    text: "PDF, Word, photo du menu papier ou saisie directe. Aucun compte à créer.",
  },
  {
    icon: Sparkles,
    title: "2. L'IA fait le travail",
    text: "Elle lit les plats, les prix, corrige le texte et génère une photo pour chaque plat.",
  },
  {
    icon: QrCode,
    title: "3. Partage ton lien",
    text: "Une page premium, un QR code à imprimer et un bouton commande WhatsApp.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-lg font-bold tracking-tight">
            Menu<span className="text-primary">AI</span>
          </span>
          <Button asChild size="sm">
            <Link to="/creer">Créer mon menu</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Bamako · Dakar · Abidjan
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl">
            Transforme ton menu
            <br />
            en <span className="text-primary">vitrine digitale</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Ton menu papier ou ton PDF devient une page web professionnelle, avec photos, prix,
            QR code et commande WhatsApp. En moins de 5 minutes, sans site web à payer 300 000 FCFA.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link to="/creer">
                Créer mon menu gratuitement <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">Aperçu gratuit, paiement après.</span>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <s.icon className="size-6 text-primary" />
                <h2 className="mt-4 text-base font-semibold">{s.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-ink py-16 text-ink-foreground">
          <div className="mx-auto max-w-5xl px-5">
            <h2 className="text-3xl font-bold">Le menu WhatsApp, c'est fini.</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Aujourd'hui
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/75">
                  <li>Photo de menu floue envoyée sur WhatsApp</li>
                  <li>PDF illisible sur téléphone</li>
                  <li>Aucun lien à partager, aucun QR code</li>
                  <li>Des clients perdus chaque jour</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/40 bg-primary/10 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Avec MenuAI
                </p>
                <ul className="mt-4 space-y-2 text-sm text-white/90">
                  {[
                    "Une page premium optimisée mobile",
                    "Une photo pour chaque plat",
                    "QR code à poser sur les tables",
                    "Commande WhatsApp en un clic",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-3xl font-bold">Des tarifs simples</h2>
          <p className="mt-2 text-muted-foreground">
            Paiement par Wave, Orange Money ou Moov Money. Pas de compte bancaire nécessaire.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <PriceCard
              title="Aperçu"
              price="0 FCFA"
              points={["Page générée par l'IA", "2 plats visibles", "Lien valable 72 h"]}
            />
            <PriceCard
              title="Menu débloqué"
              price={`${PRICING.oneshot.amount.toLocaleString("fr-FR")} FCFA`}
              points={["Menu complet en ligne", "PDF haute qualité", "Paiement unique"]}
              highlight
            />
            <PriceCard
              title="Hébergement"
              price={`${PRICING.subscription.amount.toLocaleString("fr-FR")} FCFA/mois`}
              points={["Lien permanent + QR code", "Modifications illimitées", "Bouton WhatsApp"]}
            />
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link to="/creer">
                Commencer maintenant <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 text-sm text-muted-foreground">
          <span>
            Menu<span className="text-primary">AI</span> — Transforme ton menu en vitrine digitale
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone className="size-4" /> Pensé pour le mobile en 3G
          </span>
        </div>
      </footer>
    </div>
  );
}

function PriceCard({
  title,
  price,
  points,
  highlight,
}: {
  title: string;
  price: string;
  points: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight ? "border-primary bg-accent/60 shadow-sm" : "border-border bg-card"
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold">{price}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
