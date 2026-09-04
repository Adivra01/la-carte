import { MENU_THEMES, getTheme } from "@/lib/menu-themes";
import { cn } from "@/lib/utils";

type Props = {
  themeId: string;
  accent: string | null;
  onThemeChange: (id: string) => void;
  onAccentChange: (accent: string | null) => void;
  /** Exemple de plat affiché dans la miniature */
  sample?: { name: string; price: number | null };
};

export function ThemePicker({ themeId, accent, onThemeChange, onAccentChange, sample }: Props) {
  const dishName = sample?.name ?? "Tiep bou dien";
  const price = sample?.price ?? 3500;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MENU_THEMES.map((base) => {
          const t = getTheme(base.id, base.id === themeId ? accent : null);
          const selected = base.id === themeId;
          return (
            <button
              key={base.id}
              type="button"
              onClick={() => onThemeChange(base.id)}
              aria-pressed={selected}
              className={cn(
                "overflow-hidden rounded-2xl border-2 text-left transition",
                selected ? "border-primary shadow-lg" : "border-border hover:border-primary/50",
              )}
            >
              <div className="p-3" style={{ backgroundColor: t.bg }}>
                <div
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: t.accent }}
                >
                  Plats
                </div>
                <div
                  className="mt-2 flex items-center gap-2 rounded-lg p-2"
                  style={{ backgroundColor: t.surface, border: `1px solid ${t.border}` }}
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs"
                    style={{ backgroundColor: t.accent, color: t.accentText }}
                  >
                    🍲
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[11px] font-semibold"
                      style={{ color: t.text }}
                    >
                      {dishName}
                    </div>
                    <div className="truncate text-[9px]" style={{ color: t.muted }}>
                      Riz, poisson, légumes
                    </div>
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: t.accent }}>
                    {(price ?? 0).toLocaleString("fr-FR")}
                  </div>
                </div>
              </div>
              <div className="bg-card px-3 py-2">
                <p className="text-sm font-semibold">{base.label}</p>
                <p className="text-xs text-muted-foreground">{base.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Couleur d'accent personnalisée</span>
          <input
            type="color"
            value={accent ?? getTheme(themeId).accent}
            onChange={(e) => onAccentChange(e.target.value.toUpperCase())}
            className="size-9 cursor-pointer rounded-md border border-border bg-card p-1"
            aria-label="Choisir la couleur d'accent"
          />
        </label>
        {accent && (
          <button
            type="button"
            onClick={() => onAccentChange(null)}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Revenir à la couleur du thème
          </button>
        )}
      </div>
    </div>
  );
}
