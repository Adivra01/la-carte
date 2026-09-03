import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { addDish, getAdminMenu, updateDish } from "@/lib/menu.functions";

type AdminData = Awaited<ReturnType<typeof getAdminMenu>>;

export const Route = createFileRoute("/admin/$token")({
  head: () => ({
    meta: [
      { title: "Gérer mon menu — MenuAI" },
      {
        name: "description",
        content: "Modifie tes plats, tes prix et leur disponibilité depuis ton lien privé MenuAI.",
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

function AdminPage() {
  const { token } = Route.useParams();
  const load = useServerFn(getAdminMenu);
  const save = useServerFn(updateDish);
  const create = useServerFn(addDish);

  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDish, setNewDish] = useState<Record<string, string>>({});

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

  async function handleAdd(categoryId: string) {
    const name = (newDish[categoryId] ?? "").trim();
    if (!name) return;
    try {
      const { id } = await create({ data: { categoryId, token, name, description: "", price: null } });
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
        <Link to="/m/$slug" params={{ slug: data.restaurant.slug }}>
          Voir la page publique
        </Link>
      </Button>

      {data.categories.map((category) => (
        <section key={category.id} className="mt-10">
          <h2 className="text-lg font-bold">{category.name}</h2>
          <div className="mt-3 space-y-3">
            {data.dishes
              .filter((d) => d.category_id === category.id)
              .map((dish) => (
                <div key={dish.id} className="rounded-2xl border border-border/70 bg-card p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      className="flex-1 min-w-40"
                      value={dish.name}
                      onChange={(e) => patchLocal(dish.id, { name: e.target.value })}
                      onBlur={(e) => void persist(dish.id, { name: e.target.value })}
                    />
                    <Input
                      className="w-32"
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
                    <Switch
                      checked={dish.available}
                      onCheckedChange={(v) => {
                        patchLocal(dish.id, { available: v });
                        void persist(dish.id, { available: v });
                      }}
                    />
                  </div>
                  <Input
                    className="mt-3"
                    placeholder="Description"
                    value={dish.description ?? ""}
                    onChange={(e) => patchLocal(dish.id, { description: e.target.value })}
                    onBlur={(e) => void persist(dish.id, { description: e.target.value || null })}
                  />
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
