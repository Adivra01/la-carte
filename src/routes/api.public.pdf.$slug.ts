import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/pdf/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
        const { getTheme, hexToRgb } = await import("@/lib/menu-themes");
        const { downloadDishImage } = await import("@/lib/menuai.server");

        const { data: restaurant } = await supabaseAdmin
          .from("restaurants")
          .select("id, name, slug, city, whatsapp, plan, theme, accent")
          .eq("slug", params.slug)
          .maybeSingle();
        if (!restaurant) return new Response("Menu introuvable", { status: 404 });
        if (restaurant.plan === "free") {
          return new Response("Menu verrouillé — déverrouille-le pour télécharger la brochure.", {
            status: 402,
          });
        }

        const theme = getTheme(restaurant.theme, restaurant.accent);
        const col = (hex: string) => {
          const [r, g, b] = hexToRgb(hex);
          return rgb(r, g, b);
        };
        const cBg = col(theme.bg);
        const cSurface = col(theme.surface);
        const cText = col(theme.text);
        const cMuted = col(theme.muted);
        const cAccent = col(theme.accent);
        const cAccentText = col(theme.accentText);
        const cBorder = col(theme.border);

        const { data: categories } = await supabaseAdmin
          .from("categories")
          .select("id, name, position")
          .eq("restaurant_id", restaurant.id)
          .order("position");
        const { data: dishes } = await supabaseAdmin
          .from("dishes")
          .select("id, name, description, price, category_id, available, position, image_url")
          .eq("restaurant_id", restaurant.id)
          .eq("available", true)
          .order("position");

        const pdf = await PDFDocument.create();
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const regular = await pdf.embedFont(StandardFonts.Helvetica);

        const W = 595.28;
        const H = 841.89;
        const M = 36;
        const GAP = 14;
        const COLS = 2;
        const CARD_W = (W - M * 2 - GAP * (COLS - 1)) / COLS;
        const IMG_H = CARD_W * 0.62;

        const clean = (s: string) =>
          s
            .replace(/[\u00a0\u202f\u2009\u2007]/g, " ")
            .replace(/[\u2018\u2019\u2032]/g, "'")
            .replace(/[\u201c\u201d]/g, '"')
            .replace(/[\u2013\u2014]/g, "-")
            .replace(/\u2026/g, "...")
            .replace(/[^\x20-\xFF]/g, "");

        // Images des plats (embarquées une seule fois)
        const imageCache = new Map<string, Awaited<ReturnType<typeof pdf.embedPng>> | null>();
        for (const dish of dishes ?? []) {
          if (!dish.image_url || imageCache.has(dish.image_url)) continue;
          try {
            const bytes = await downloadDishImage(dish.image_url);
            imageCache.set(dish.image_url, bytes ? await pdf.embedPng(bytes) : null);
          } catch {
            imageCache.set(dish.image_url, null);
          }
        }

        let page = pdf.addPage([W, H]);
        page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cBg });
        let y = H - M;

        function newPage() {
          page = pdf.addPage([W, H]);
          page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cBg });
          y = H - M;
        }

        function wrap(text: string, size: number, maxWidth: number, font = regular) {
          const words = clean(text).split(/\s+/);
          const lines: string[] = [];
          let line = "";
          for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
              lines.push(line);
              line = word;
            } else line = next;
          }
          if (line) lines.push(line);
          return lines;
        }

        /* ------------------------------- en-tête ------------------------------ */
        const title = clean(restaurant.name).toUpperCase();
        const titleSize = Math.min(34, (W - M * 2) / (title.length * 0.62) || 34);
        page.drawText(title, { x: M, y: y - titleSize, size: titleSize, font: bold, color: cText });
        y -= titleSize + 10;
        const sub = [restaurant.city, restaurant.whatsapp].filter(Boolean).join("  |  ");
        if (sub) {
          page.drawText(clean(sub), { x: M, y, size: 10, font: regular, color: cMuted });
          y -= 14;
        }
        page.drawRectangle({ x: M, y: y - 4, width: W - M * 2, height: 3, color: cAccent });
        y -= 24;

        /* ------------------------------ catégories ---------------------------- */
        for (const category of categories ?? []) {
          const list = (dishes ?? []).filter((d) => d.category_id === category.id);
          if (!list.length) continue;

          if (y < M + 160) newPage();
          const label = clean(category.name).toUpperCase();
          const labelW = bold.widthOfTextAtSize(label, 11) + 20;
          page.drawRectangle({
            x: M,
            y: y - 6,
            width: labelW,
            height: 22,
            color: cAccent,
          });
          page.drawText(label, { x: M + 10, y, size: 11, font: bold, color: cAccentText });
          y -= 30;

          for (let i = 0; i < list.length; i += COLS) {
            const row = list.slice(i, i + COLS);

            // hauteur de la rangée
            let rowH = 0;
            const layouts = row.map((dish) => {
              const hasImage = !!(dish.image_url && imageCache.get(dish.image_url));
              const textW = CARD_W - 20;
              const descLines = dish.description ? wrap(dish.description, 8.5, textW).slice(0, 3) : [];
              const nameLines = wrap(dish.name, 12, textW - 60, bold).slice(0, 2);
              const h =
                (hasImage ? IMG_H : 0) + 14 + nameLines.length * 14 + descLines.length * 11 + 14;
              rowH = Math.max(rowH, h);
              return { dish, hasImage, descLines, nameLines };
            });

            if (y - rowH < M) newPage();

            layouts.forEach((layout, ci) => {
              const x = M + ci * (CARD_W + GAP);
              const top = y;
              page.drawRectangle({
                x,
                y: top - rowH,
                width: CARD_W,
                height: rowH,
                color: cSurface,
                borderColor: cBorder,
                borderWidth: 0.8,
              });

              let cy = top;
              if (layout.hasImage) {
                const img = imageCache.get(layout.dish.image_url!)!;
                page.drawImage(img, {
                  x,
                  y: top - IMG_H,
                  width: CARD_W,
                  height: IMG_H,
                });
                cy = top - IMG_H;
              }

              cy -= 18;
              const priceText = layout.dish.price
                ? clean(`${layout.dish.price.toLocaleString("fr-FR")} F`)
                : "";
              const priceW = priceText ? bold.widthOfTextAtSize(priceText, 11) : 0;
              layout.nameLines.forEach((line, li) => {
                page.drawText(line, {
                  x: x + 10,
                  y: cy - li * 14,
                  size: 12,
                  font: bold,
                  color: cText,
                });
              });
              if (priceText) {
                page.drawText(priceText, {
                  x: x + CARD_W - 10 - priceW,
                  y: cy,
                  size: 11,
                  font: bold,
                  color: cAccent,
                });
              }
              cy -= layout.nameLines.length * 14;

              layout.descLines.forEach((line, li) => {
                page.drawText(line, {
                  x: x + 10,
                  y: cy - li * 11,
                  size: 8.5,
                  font: regular,
                  color: cMuted,
                });
              });
            });

            y -= rowH + GAP;
          }

          y -= 8;
        }

        /* -------------------------------- pied -------------------------------- */
        for (const p of pdf.getPages()) {
          p.drawText("Cree avec MenuAI", {
            x: M,
            y: 20,
            size: 8,
            font: regular,
            color: cMuted,
          });
        }

        const bytes = await pdf.save();
        return new Response(bytes as unknown as BodyInit, {
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="brochure-${restaurant.slug}.pdf"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
