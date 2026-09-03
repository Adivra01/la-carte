import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getShareAssets } from "@/lib/menu.functions";

export const Route = createFileRoute("/succes/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    admin: typeof search["admin"] === "string" ? (search["admin"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu publié — MenuAI" },
      {
        name: "description",
        content: "Ton menu est en ligne : récupère ton QR code, ton lien court et ton PDF.",
      },
      { property: "og:title", content: "Menu publié — MenuAI" },
      {
        property: "og:description",
        content: "QR code, lien permanent et PDF de ton menu digital.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SuccesPage,
});

function SuccesPage() {
  const { slug } = Route.useParams();
  const { admin } = Route.useSearch();
  const share = useServerFn(getShareAssets);
  const [assets, setAssets] = useState<{ url: string; png: string; svg: string } | null>(null);

  useEffect(() => {
    void share({ data: { slug, origin: window.location.origin } })
      .then(setAssets)
      .catch(() => toast.error("Impossible de générer le QR code."));
  }, [share, slug]);

  function copyLink() {
    if (!assets) return;
    void navigator.clipboard.writeText(assets.url);
    toast.success("Lien copié !");
  }

  function downloadSvg() {
    if (!assets) return;
    const blob = new Blob([assets.svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-14 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Check className="size-7 text-primary" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Ton menu est en ligne</h1>
      <p className="mt-2 text-muted-foreground">
        Partage ce lien, colle le QR code sur tes tables, imprime ton PDF.
      </p>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6">
        {assets ? (
          <>
            <img
              src={assets.png}
              alt={`QR code du menu ${slug}`}
              className="mx-auto size-52 rounded-xl"
            />
            <p className="mt-4 break-all text-sm text-muted-foreground">{assets.url}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="mr-1 size-4" /> Copier le lien
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={assets.png} download={`qr-${slug}.png`}>
                  <Download className="mr-1 size-4" /> QR PNG
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={downloadSvg}>
                <Download className="mr-1 size-4" /> QR SVG
              </Button>
            </div>
          </>
        ) : (
          <div className="h-52 animate-pulse rounded-xl bg-muted" />
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <Button asChild size="lg">
          <Link to="/m/$slug" params={{ slug }} search={{ admin }}>
            Voir mon menu
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href={`/api/public/pdf/${slug}`}>
            <Download className="mr-1 size-4" /> Télécharger le PDF
          </a>
        </Button>
        {admin && (
          <Button asChild variant="ghost">
            <Link to="/admin/$token" params={{ token: admin }}>
              Gérer mes plats
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
