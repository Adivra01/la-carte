import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRICING, payForMenu, type PlanKey } from "@/lib/menu.functions";

const OPERATORS = [
  { key: "wave", label: "Wave" },
  { key: "orange", label: "Orange Money" },
  { key: "moov", label: "Moov Money" },
] as const;

export const Route = createFileRoute("/paiement/$slug")({
  head: () => ({
    meta: [
      { title: "Déverrouiller mon menu — MenuAI" },
      {
        name: "description",
        content:
          "Choisis ta formule et paie par mobile money (Wave, Orange Money, Moov) pour publier ton menu complet.",
      },
      { property: "og:title", content: "Déverrouiller mon menu — MenuAI" },
      {
        property: "og:description",
        content: "Paiement mobile money pour publier ton menu digital et ton QR code.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaiementPage,
});

function PaiementPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const pay = useServerFn(payForMenu);

  const [plan, setPlan] = useState<PlanKey>("oneshot");
  const [operator, setOperator] = useState<(typeof OPERATORS)[number]["key"]>("wave");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (phone.replace(/\D/g, "").length < 6) {
      toast.error("Indique le numéro mobile money à débiter.");
      return;
    }
    setLoading(true);
    try {
      const result = await pay({ data: { slug, plan, operator, phone: phone.trim() } });
      if (result.status === "paid") {
        toast.success("Paiement confirmé !");
        navigate({
          to: "/succes/$slug",
          params: { slug },
          search: { admin: "adminToken" in result ? result.adminToken : undefined },
        });
      } else {
        toast.info("Valide le paiement sur ton téléphone, puis rafraîchis ton menu.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Le paiement a échoué");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-12">
      <Link to="/m/$slug" params={{ slug }} search={{ admin: undefined }} className="text-sm text-muted-foreground">
        ← Retour au menu
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Déverrouille ton menu</h1>
      <p className="mt-2 text-muted-foreground">
        Menu complet visible, filigrane retiré, QR code et lien permanent.
      </p>

      <div className="mt-8 space-y-3">
        {(Object.keys(PRICING) as PlanKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPlan(key)}
            className={cn(
              "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition",
              plan === key ? "border-primary bg-primary/5" : "border-border bg-card",
            )}
          >
            <span>
              <span className="block font-semibold">{PRICING[key].label}</span>
              <span className="text-sm text-muted-foreground">
                {key === "oneshot" ? "Paiement unique" : "Par mois, résiliable"}
              </span>
            </span>
            <span className="font-bold text-primary">
              {PRICING[key].amount.toLocaleString("fr-FR")} FCFA
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Label>Opérateur</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {OPERATORS.map((op) => (
            <button
              key={op.key}
              type="button"
              onClick={() => setOperator(op.key)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                operator === op.key ? "border-primary bg-primary/5 text-primary" : "border-border",
              )}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Label htmlFor="phone">Numéro mobile money</Label>
        <Input
          id="phone"
          className="mt-2"
          placeholder="+223 70 00 00 00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <Button size="lg" className="mt-8 w-full" disabled={loading} onClick={() => void submit()}>
        {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
        Payer {PRICING[plan].amount.toLocaleString("fr-FR")} FCFA
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Paiement sécurisé. Aucun renouvellement automatique sans ton accord.
      </p>
    </div>
  );
}
