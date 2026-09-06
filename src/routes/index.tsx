import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";
import yassaImage from "@/assets/yassa-hero.jpg";
import thiebImage from "@/assets/thieb-hero.jpg";
import bissapImage from "@/assets/bissap-hero.jpg";
import {
  ArrowRight,
  Check,
  ChevronRight,
  FileImage,
  Menu as MenuIcon,
  Palette,
  QrCode,
  ScanLine,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuAI — Ton menu, créé sur mesure par l’IA" },
      {
        name: "description",
        content:
          "MenuAI transforme ton menu en une expérience digitale unique, pensée selon l’identité et les besoins de ton restaurant.",
      },
      { property: "og:title", content: "MenuAI — Ton menu, créé sur mesure par l’IA" },
      {
        property: "og:description",
        content: "Un menu digital gourmand, personnalisé et prêt à partager en quelques minutes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const navLinks = [
  { href: "#transformation", label: "Avant / Après" },
  { href: "#etapes", label: "Comment ça marche" },
  { href: "#sur-mesure", label: "Sur mesure" },
];

const steps = [
  {
    icon: FileImage,
    number: "01",
    title: "Envoie ton menu",
    text: "Une photo, un PDF, un document Word ou quelques lignes saisies directement.",
    status: "Lecture du menu",
  },
  {
    icon: WandSparkles,
    number: "02",
    title: "Décris ton univers",
    text: "Choisis l’ambiance, les couleurs et le style qui ressemblent vraiment à ton restaurant.",
    status: "Création sur mesure",
  },
  {
    icon: QrCode,
    number: "03",
    title: "Partage et accueille",
    text: "Ton menu est prêt avec ses photos, son lien et son QR code pour tes tables.",
    status: "Menu prêt à partager",
  },
];

const dishes = [
  { name: "Poulet Yassa", desc: "Oignons confits, citron vert, riz parfumé", price: "3 500", image: yassaImage },
  { name: "Thiéboudienne", desc: "Poisson, riz rouge et légumes du marché", price: "4 000", image: thiebImage },
  { name: "Bissap maison", desc: "Hibiscus frais, menthe et glace pilée", price: "1 000", image: bissapImage },
];

function Landing() {
  const [open, setOpen] = useState(false);

  return (
    <div className="landing-dark min-h-screen bg-landing text-landing-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-landing-line bg-landing/80 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="text-xl font-extrabold">
            Menu<span className="text-primary">AI</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-landing-muted transition-colors hover:text-landing-foreground">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to="/creer">Créer mon menu <ArrowRight /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-landing-foreground md:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((value) => !value)}>
              {open ? <X /> : <MenuIcon />}
            </Button>
          </div>
        </div>
        <div className={cn("overflow-hidden border-t border-landing-line transition-[max-height,opacity] duration-300 md:hidden", open ? "max-h-72 opacity-100" : "max-h-0 opacity-0")}>
          <nav className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-2 text-sm text-landing-muted">{link.label}</a>)}
            <Button asChild className="mt-2 rounded-full"><Link to="/creer">Créer mon menu</Link></Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative min-h-[760px] overflow-hidden border-b border-landing-line pt-18 lg:min-h-[850px]">
          <div className="hero-grid absolute inset-0 opacity-40" aria-hidden />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
            <div className="relative z-10">
              <Reveal>
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-landing-line bg-landing-panel px-4 py-2 text-xs font-semibold uppercase text-primary">
                  <span className="size-2 rounded-full bg-primary step-pulse" /> Créé pour chaque restaurant
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] sm:text-7xl lg:text-[5.4rem]">
                  Ton menu mérite de <span className="font-serif italic text-primary">donner faim.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-landing-muted sm:text-xl">
                  MenuAI transforme ta carte en une expérience digitale unique, imaginée selon ton ambiance, tes clients et tes envies.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-fire transition-transform hover:-translate-y-1">
                    <Link to="/creer">Créer mon menu <ArrowRight /></Link>
                  </Button>
                  <a href="#transformation" className="inline-flex h-13 items-center gap-2 px-3 text-sm font-semibold text-landing-foreground">
                    Voir la transformation <ChevronRight className="size-4 text-primary" />
                  </a>
                </div>
              </Reveal>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase text-landing-subtle">
                <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Sans compte</span>
                <span className="inline-flex items-center gap-2"><Check className="size-4 text-primary" /> Entièrement personnalisable</span>
              </div>
            </div>

            <Reveal delay={180} className="relative mx-auto w-full max-w-[31rem]">
              <div className="absolute -inset-5 border border-primary/20 hero-orbit" aria-hidden />
              <div className="menu-phone relative mx-auto overflow-hidden border border-landing-line bg-landing-panel shadow-deep">
                <div className="relative h-56 overflow-hidden sm:h-64">
                  <img src={yassaImage} alt="Poulet yassa présenté dans un menu MenuAI" width={1408} height={1008} className="size-full object-cover" />
                  <div className="image-shade absolute inset-0" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-semibold uppercase text-primary">Chez Awa · Bamako</p>
                    <p className="mt-1 font-serif text-3xl font-bold">Cuisine généreuse</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 text-xs"><span className="rounded-full bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Nos favoris</span><span className="rounded-full border border-landing-line px-3 py-1.5 text-landing-muted">Boissons</span></div>
                  <div className="mt-5 space-y-4">
                    {dishes.slice(0, 2).map((dish) => (
                      <div key={dish.name} className="flex items-center gap-3 border-b border-landing-line pb-4">
                        <img src={dish.image} alt="" width={1200} height={912} className="size-16 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1"><p className="font-semibold">{dish.name}</p><p className="truncate text-xs text-landing-muted">{dish.desc}</p></div>
                        <p className="text-sm font-bold text-primary">{dish.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 top-20 rounded-lg border border-landing-line bg-landing-panel p-3 shadow-deep sm:-right-12">
                <Sparkles className="size-5 text-primary" /><p className="mt-2 text-xs font-semibold">Créé pour toi</p>
              </div>
            </Reveal>
          </div>
        </section>

        <BeforeAfter />
        <AnimatedSteps />

        <section id="sur-mesure" className="border-y border-landing-line bg-landing-soft py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal><p className="section-kicker">Pas de modèle imposé</p><h2 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-6xl">Une identité qui ressemble à <span className="font-serif italic text-primary">ton restaurant.</span></h2></Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                { name: "Maquis solaire", note: "Chaleureux · populaire · direct", className: "style-sun" },
                { name: "Table prestige", note: "Élégant · feutré · gastronomique", className: "style-gold" },
                { name: "Fraîcheur urbaine", note: "Vif · moderne · décontracté", className: "style-fresh" },
              ].map((style, index) => (
                <Reveal key={style.name} delay={index * 100}>
                  <div className={cn("style-card relative h-72 overflow-hidden border border-landing-line p-6", style.className)}>
                    <Palette className="size-6" /><div className="absolute inset-x-6 bottom-6"><p className="font-serif text-3xl font-bold">{style.name}</p><p className="mt-2 text-sm opacity-70">{style.note}</p></div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal><p className="mt-8 max-w-2xl text-landing-muted">Couleurs, ambiance, ton et présentation : chaque carte est adaptée à tes choix. Tu peux ensuite la modifier quand tu veux.</p></Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-28 text-center">
          <div className="hero-grid absolute inset-0 opacity-30" aria-hidden />
          <Reveal className="relative z-10 mx-auto max-w-3xl">
            <ScanLine className="mx-auto size-8 text-primary" />
            <h2 className="mt-6 text-4xl font-extrabold sm:text-6xl">Ta cuisine a une histoire.<br /><span className="font-serif italic text-primary">Fais-la voir.</span></h2>
            <p className="mx-auto mt-5 max-w-xl text-landing-muted">Envoie ton menu et donne-nous tes envies. MenuAI s’occupe de créer une carte qui ne ressemble qu’à toi.</p>
            <Button asChild size="lg" className="mt-8 h-13 rounded-full px-8 text-base shadow-fire"><Link to="/creer">Commencer maintenant <ArrowRight /></Link></Button>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-landing-line py-8"><div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-5 text-sm text-landing-muted"><span className="font-bold text-landing-foreground">Menu<span className="text-primary">AI</span></span><span>Bamako · Dakar · Abidjan</span></div></footer>
    </div>
  );
}

function BeforeAfter() {
  const [position, setPosition] = useState(46);
  return (
    <section id="transformation" className="scroll-mt-20 bg-landing-soft py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[.8fr_1.2fr]">
        <Reveal>
          <p className="section-kicker">Avant / Après</p>
          <h2 className="mt-4 text-4xl font-extrabold sm:text-5xl">D’une simple feuille à une <span className="font-serif italic text-primary">expérience gourmande.</span></h2>
          <p className="mt-6 text-landing-muted">Le contenu reste le tien. MenuAI lui donne une structure claire, de belles images et une identité pensée pour tes clients.</p>
          <div className="mt-8 space-y-4 text-sm">
            <p className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-landing-subtle" /> Avant : difficile à lire et sans émotion.</p>
            <p className="flex gap-3"><span className="mt-1 size-2 shrink-0 rounded-full bg-primary" /> Après : clair, appétissant et immédiatement partageable.</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="overflow-hidden rounded-xl border border-landing-line bg-landing-panel shadow-deep">
            <div className="relative aspect-[4/3] select-none overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {dishes.map((dish) => <article key={dish.name} className="overflow-hidden rounded-lg border border-landing-line bg-landing"><img src={dish.image} alt={dish.name} loading="lazy" width={1200} height={912} className="h-32 w-full object-cover sm:h-44" /><div className="p-3"><div className="flex justify-between gap-2 text-sm font-bold"><span>{dish.name}</span><span className="text-primary">{dish.price}</span></div><p className="mt-2 text-xs text-landing-muted">{dish.desc}</p></div></article>)}
              </div>
              <div className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-primary bg-paper" style={{ width: `${position}%` }}>
                <div className="h-full w-[min(90vw,42rem)] p-7 text-paper-ink sm:p-10">
                  <p className="border-b border-paper-line pb-3 text-center font-serif text-xl font-bold uppercase">Restaurant Chez Awa</p>
                  <div className="mt-8 space-y-5 font-mono text-sm opacity-70">{dishes.map((dish) => <div key={dish.name} className="flex justify-between border-b border-dotted border-paper-line pb-1"><span>{dish.name}</span><span>{dish.price}</span></div>)}</div>
                  <p className="mt-10 text-xs opacity-50">Photo envoyée dans une conversation</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${position}%` }}><span className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fire"><ChevronRight /></span></div>
              <input type="range" min={8} max={92} value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label="Comparer le menu avant et après" className="absolute inset-0 size-full cursor-ew-resize opacity-0" />
            </div>
            <div className="flex justify-between border-t border-landing-line px-5 py-3 text-xs font-bold uppercase"><span className="text-landing-muted">Avant · ton document</span><span className="text-primary">Après · ton expérience</span></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AnimatedSteps() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => setActive((value) => (value + 1) % steps.length), 2600);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <section id="etapes" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="text-center"><p className="section-kicker">Simple du début à la fin</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">Trois étapes. <span className="font-serif italic text-primary">Ton univers prend vie.</span></h2></Reveal>
        <div className="relative mt-16 grid gap-5 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-12 hidden h-px bg-landing-line md:block"><span className="step-line block h-full bg-primary" /></div>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return <button key={step.title} type="button" onClick={() => setActive(index)} className={cn("step-card relative z-10 min-h-72 border p-7 text-left transition-all duration-500", active === index ? "border-primary bg-landing-panel shadow-fire" : "border-landing-line bg-landing hover:border-primary/50")}>
              <div className={cn("flex size-16 items-center justify-center rounded-xl border transition-all duration-500", active === index ? "rotate-3 border-primary bg-primary text-primary-foreground" : "border-landing-line bg-landing-panel text-landing-muted")}><Icon className="size-7" /></div>
              <p className="mt-7 text-xs font-bold text-primary">{step.number}</p><h3 className="mt-2 text-2xl font-bold">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-landing-muted">{step.text}</p>
              <div className={cn("mt-6 flex items-center gap-2 text-xs font-semibold transition-opacity", active === index ? "opacity-100" : "opacity-0")}><span className="size-2 rounded-full bg-primary step-pulse" /> {step.status}</div>
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}