import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { PRICING } from "@/lib/menu.functions";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Menu as MenuIcon,
  MessageCircle,
  QrCode,
  Sparkles,
  Smartphone,
  Upload,
  X,
} from "lucide-react";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const navLinks = [
  { href: "#etapes", label: "Comment ça marche" },
  { href: "#avant-apres", label: "Avant / Après" },
  { href: "#tarifs", label: "Tarifs" },
];

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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="text-lg font-bold tracking-tight">
            Menu<span className="text-primary">AI</span>
          </span>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/creer">Créer mon menu</Link>
            </Button>
            <button
              type="button"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground md:hidden"
            >
              {open ? <MenuIcon className="size-4 hidden" /> : null}
              {open ? <X className="size-4" /> : <MenuIcon className="size-4" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-border/60 transition-[max-height,opacity] duration-300 md:hidden",
            open ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {l.label}
              </a>
            ))}
            <Button asChild size="sm" className="mt-2">
              <Link to="/creer" onClick={() => setOpen(false)}>
                Créer mon menu
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl float-slow"
          />
          <div className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-20">
            <Reveal>
              <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground glow-pulse">
                Bamako · Dakar · Abidjan
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-6xl">
                Transforme ton menu
                <br />
                en <span className="text-primary">vitrine digitale</span>.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Ton menu papier ou ton PDF devient une page web professionnelle, avec photos, prix,
                QR code et commande WhatsApp. En moins de 5 minutes, sans site web à payer 300 000
                FCFA.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-12 px-6 text-base transition-transform hover:-translate-y-0.5"
                >
                  <Link to="/creer">
                    Créer mon menu gratuitement <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Aperçu gratuit, paiement après.
                </span>
              </div>
            </Reveal>

            <div id="etapes" className="mt-14 grid scroll-mt-24 gap-4 sm:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 120}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
                    <s.icon className="size-6 text-primary" />
                    <h2 className="mt-4 text-base font-semibold">{s.title}</h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <BeforeAfter />

        <section className="bg-ink py-16 text-ink-foreground">
          <div className="mx-auto max-w-5xl px-5">
            <Reveal>
              <h2 className="text-3xl font-bold">Le menu WhatsApp, c'est fini.</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-white/10 p-6">
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
              </Reveal>
              <Reveal delay={120}>
                <div className="h-full rounded-2xl border border-primary/40 bg-primary/10 p-6">
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
              </Reveal>
            </div>
          </div>
        </section>

        <section id="tarifs" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold">Des tarifs simples</h2>
            <p className="mt-2 text-muted-foreground">
              Paiement par Wave, Orange Money ou Moov Money. Pas de compte bancaire nécessaire.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Reveal>
              <PriceCard
                title="Aperçu"
                price="0 FCFA"
                points={["Page générée par l'IA", "2 plats visibles", "Lien valable 72 h"]}
              />
            </Reveal>
            <Reveal delay={120}>
              <PriceCard
                title="Menu débloqué"
                price={`${PRICING.oneshot.amount.toLocaleString("fr-FR")} FCFA`}
                points={["Menu complet en ligne", "PDF haute qualité", "Paiement unique"]}
                highlight
              />
            </Reveal>
            <Reveal delay={240}>
              <PriceCard
                title="Hébergement"
                price={`${PRICING.subscription.amount.toLocaleString("fr-FR")} FCFA/mois`}
                points={["Lien permanent + QR code", "Modifications illimitées", "Bouton WhatsApp"]}
              />
            </Reveal>
          </div>
          <Reveal>
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-base transition-transform hover:-translate-y-0.5"
              >
                <Link to="/creer">
                  Commencer maintenant <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
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

const demoDishes = [
  { name: "Poulet yassa", desc: "Oignons confits, citron vert, riz parfumé", price: "3 500" },
  { name: "Thiéboudienne", desc: "Riz rouge, poisson farci, légumes du marché", price: "4 000" },
  { name: "Jus de bissap", desc: "Hibiscus frais, menthe, servi bien glacé", price: "1 000" },
];

function BeforeAfter() {
  const [pos, setPos] = useState(50);

  return (
    <section id="avant-apres" className="scroll-mt-24 border-y border-border bg-sand/40 py-16">
      <div className="mx-auto max-w-5xl px-5">
        <Reveal>
          <h2 className="text-3xl font-bold">Avant / Après</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Fais glisser le curseur : à gauche le menu envoyé sur WhatsApp, à droite la page MenuAI
            que voient tes clients.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative select-none">
              <AfterPanel />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pos}%` }}
                aria-hidden
              >
                <div className="w-[calc(100vw-2.5rem)] max-w-[calc(64rem-2.5rem)]">
                  <BeforePanel />
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-primary"
                style={{ left: `${pos}%` }}
              >
                <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <ArrowRight className="size-4" />
                </span>
              </div>

              <input
                type="range"
                min={5}
                max={95}
                value={pos}
                aria-label="Comparer avant et après"
                onChange={(e) => setPos(Number(e.target.value))}
                className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
              />
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide">
              <span className="text-muted-foreground">Avant · photo WhatsApp</span>
              <span className="text-primary">Après · page MenuAI</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BeforePanel() {
  return (
    <div className="min-h-[26rem] bg-ink/90 p-6 text-ink-foreground sm:min-h-[24rem]">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
        Menu — envoyé sur WhatsApp
      </p>
      <div className="mt-5 max-w-sm rotate-[-1.5deg] rounded-lg bg-[oklch(0.86_0.02_95)] p-5 shadow-xl">
        <p className="text-center font-bold uppercase tracking-widest text-[oklch(0.25_0.02_60)] blur-[1.2px]">
          Restaurant Chez Fatou
        </p>
        <div className="mt-4 space-y-2 blur-[1.6px]">
          {demoDishes.map((d) => (
            <div
              key={d.name}
              className="flex justify-between text-sm text-[oklch(0.3_0.02_60)]"
              style={{ fontFamily: "ui-monospace, monospace" }}
            >
              <span>{d.name.toUpperCase()}</span>
              <span>{d.price}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-[oklch(0.3_0.02_60)]">
            <span>...........................</span>
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm text-white/50">
        Photo floue, prix illisibles, aucun lien à partager.
      </p>
    </div>
  );
}

function AfterPanel() {
  return (
    <div className="min-h-[26rem] bg-background p-6 sm:min-h-[24rem]">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Page MenuAI — chezfatou.menuai
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {demoDishes.map((d, i) => (
          <div
            key={d.name}
            className="rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <div className="flex h-20 items-center justify-center rounded-xl bg-accent text-3xl">
              {["🍗", "🐟", "🥤"][i]}
            </div>
            <h3 className="mt-3 text-sm font-semibold">{d.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{d.desc}</p>
            <p className="mt-2 text-sm font-bold text-primary">{d.price} FCFA</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-ink-foreground">
              <MessageCircle className="size-3" /> Commander
            </span>
          </div>
        ))}
      </div>
      <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <QrCode className="size-4 text-primary" /> Un QR code sur les tables, un lien à partager.
      </p>
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
      className={`h-full rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${
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
