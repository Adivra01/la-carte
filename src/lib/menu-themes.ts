/** Thèmes visuels MenuAI — utilisables côté client et côté serveur (PDF). */

export type MenuTheme = {
  id: string;
  label: string;
  hint: string;
  /** Fond de page */
  bg: string;
  /** Fond des cartes / blocs */
  surface: string;
  /** Texte principal */
  text: string;
  /** Texte secondaire */
  muted: string;
  /** Couleur d'accent (prix, titres de catégorie) */
  accent: string;
  /** Texte lisible posé sur l'accent */
  accentText: string;
  /** Bordures */
  border: string;
};

export const MENU_THEMES: MenuTheme[] = [
  {
    id: "feu",
    label: "Feu",
    hint: "Orange chaleureux sur blanc — lisible, moderne",
    bg: "#F5F5F2",
    surface: "#FFFFFF",
    text: "#0D0D0D",
    muted: "#6B6B66",
    accent: "#FF6B2B",
    accentText: "#FFFFFF",
    border: "#E4E2DC",
  },
  {
    id: "foret",
    label: "Forêt",
    hint: "Vert profond et or — élégant, façon restaurant",
    bg: "#0F3D33",
    surface: "#14483C",
    text: "#F4F1EA",
    muted: "#B7CCC3",
    accent: "#E3B23C",
    accentText: "#0F3D33",
    border: "#1E5D4E",
  },
  {
    id: "nuit",
    label: "Nuit",
    hint: "Noir et or — chic, soirée, lounge",
    bg: "#0D0D0D",
    surface: "#1A1A1A",
    text: "#F5F5F2",
    muted: "#A3A39E",
    accent: "#C9A84C",
    accentText: "#0D0D0D",
    border: "#2C2C2C",
  },
  {
    id: "sable",
    label: "Sable",
    hint: "Crème et terracotta — doux, maquis et café",
    bg: "#FAF5EC",
    surface: "#FFFFFF",
    text: "#3B2A20",
    muted: "#8A7768",
    accent: "#B85042",
    accentText: "#FFFFFF",
    border: "#EADFCD",
  },
];

export const DEFAULT_THEME_ID = "feu";

export function getTheme(id: string | null | undefined, accentOverride?: string | null): MenuTheme {
  const base = MENU_THEMES.find((t) => t.id === id) ?? MENU_THEMES[0]!;
  if (accentOverride && /^#[0-9a-fA-F]{6}$/.test(accentOverride)) {
    return { ...base, accent: accentOverride, accentText: readableOn(accentOverride) };
  }
  return base;
}

/** Noir ou blanc selon la luminosité du fond. */
export function readableOn(hex: string): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#0D0D0D" : "#FFFFFF";
}

/** Convertit #RRGGBB en triplet 0-1 pour pdf-lib. */
export function hexToRgb(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  ];
}
