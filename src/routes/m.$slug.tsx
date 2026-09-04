import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { Download, Lock, MessageCircle, QrCode, Timer } from "lucide-react";
import { getTheme } from "@/lib/menu-themes";
import { Button } from "@/components/ui/button";
import { getPublicMenu } from "@/lib/menu.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/m/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    admin: typeof search["admin"] === "string" ? (search["admin"] as string) : undefined,
  }),
  loader: async ({ params }) => {
    const menu = await getPublicMenu({ data: { slug: params.slug } });
    if (!menu) throw notFound();
    return menu;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Menu introuvable — MenuAI" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.restaurant.name} — Menu en ligne`;
    const description = `Découvre le menu de ${loaderData.restaurant.name}${
      loaderData.restaurant.city ? ` à ${loaderData.restaurant.city}` : ""
    } et commande directement sur WhatsApp.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: MenuPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Ce menu n'existe pas</h1>
      <p className="mt-2 text-muted-foreground">Vérifie le lien ou crée ton propre menu.</p>
      <Button asChild className="mt-6">
        <Link to="/creer">Créer mon menu</Link>
      </Button>
    </div>
  ),
});

function dishImage(path: string | null) {
  return path ? `/api/public/img?path=${encodeURIComponent(path)}` : null;
}

function MenuPage() {
  const menu = Route.useLoaderData();
  const { admin } = Route.useSearch();
  const { restaurant, categories } = menu;
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const theme = getTheme(restaurant.theme, restaurant.accent);
  const themeVars = {
    "--background": theme.bg,
    "--foreground": theme.text,
    "--card": theme.surface,
    "--card-foreground": theme.text,
    "--muted": theme.border,
    "--muted-foreground": theme.muted,
    "--primary": theme.accent,
    "--primary-foreground": theme.accentText,
    "--secondary": theme.surface,
    "--secondary-foreground": theme.text,
    "--border": theme.border,
    "--input": theme.border,
    "--ink": theme.text,
    "--ink-foreground": theme.bg,
  } as CSSProperties;

  const hoursLeft = Math.max(
    0,
    Math.round((new Date(restaurant.previewExpiresAt).getTime() - Date.now()) / 3_600_000),
  );

  function whatsappLink(dishName: string) {
    const digits = (restaurant.whatsapp ?? "").replace(/\D/g, "");
    const text = encodeURIComponent(
      `Bonjour ${restaurant.name}, je souhaite commander : ${dishName}`,
    );
    return `https://wa.me/${digits}?text=${text}`;
  }

  return (
    <div
      style={themeVars}
      className={cn(
        "min-h-screen bg-background pb-24 text-foreground",
        !restaurant.unlocked && "watermark-grid",
      )}
    >
      <header className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-3xl px-5 py-8">
          {!restaurant.unlocked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Aperçu MenuAI
            </span>
          )}
          <h1 className="mt-3 text-3xl font-bold">{restaurant.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {[restaurant.city, restaurant.whatsapp].filter(Boolean).join(" · ")}
          </p>
          {!restaurant.unlocked && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
              <Timer className="size-5 text-primary" />
              <p className="flex-1 text-sm">
                {restaurant.expired
                  ? "L'aperçu a expiré. Déverrouille ton menu pour le remettre en ligne."
                  : `Aperçu gratuit : il reste ${hoursLeft} h avant expiration.`}
              </p>
              <Button asChild size="sm">
                <Link to="/paiement/$slug" params={{ slug: restaurant.slug }}>
                  Déverrouiller
                </Link>
              </Button>
            </div>
          )}
          {restaurant.unlocked && (
            <Button asChild variant="outline" size="sm" className="mt-4 mr-2">
              <a href={`/api/public/pdf/${restaurant.slug}`}>
                <Download className="mr-1 size-4" /> Brochure PDF à imprimer
              </a>
            </Button>
          )}
          {admin && (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/admin/$token" params={{ token: admin }}>
                Gérer mon menu
              </Link>
            </Button>
          )}
        </div>
      </header>

      <nav className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-5 py-3">
          {categories.map((c) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              onClick={() => setActive(c.id)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
                active === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c.name}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-5">
        {categories.map((category) => (
          <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-20 pt-10">
            <h2 className="text-xl font-bold">{category.name}</h2>
            <div className="mt-4 space-y-4">
              {category.dishes.map((dish) => {
                const src = dishImage(dish.imagePath);
                return (
                  <article
                    key={dish.id}
                    className="relative flex gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-3"
                  >
                    <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {src ? (
                        <img
                          src={src}
                          alt={`Photo du plat ${dish.name}`}
                          loading="lazy"
                          className={cn(
                            "size-full object-cover",
                            dish.locked && "blur-md scale-110",
                          )}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-2xl">
                          🍲
                        </div>
                      )}
                    </div>

                    <div className={cn("flex-1", dish.locked && "select-none blur-[5px]")}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{dish.name}</h3>
                        {dish.price !== null && (
                          <span className="whitespace-nowrap font-bold text-primary">
                            {dish.price.toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                      </div>
                      {dish.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{dish.description}</p>
                      )}
                      {!dish.available && (
                        <p className="mt-2 text-xs font-medium uppercase text-destructive">
                          Indisponible
                        </p>
                      )}
                      {dish.available && restaurant.whatsapp && !dish.locked && (
                        <a
                          href={whatsappLink(dish.name)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-ink-foreground"
                        >
                          <MessageCircle className="size-3.5" /> Commander sur WhatsApp
                        </a>
                      )}
                    </div>

                    {dish.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                        <Button asChild size="sm" variant="secondary">
                          <Link to="/paiement/$slug" params={{ slug: restaurant.slug }}>
                            <Lock className="mr-1 size-3.5" /> Déverrouiller
                          </Link>
                        </Button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="mt-16 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2">
          <QrCode className="size-4" /> Créé avec{" "}
          <Link to="/" className="font-semibold text-foreground">
            MenuAI
          </Link>
        </p>
      </footer>
    </div>
  );
}
