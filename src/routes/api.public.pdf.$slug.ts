import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/pdf/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

        const { data: restaurant } = await supabaseAdmin
          .from("restaurants")
          .select("id, name, slug, city, whatsapp, plan")
          .eq("slug", params.slug)
          .maybeSingle();
        if (!restaurant) return new Response("Menu introuvable", { status: 404 });
        if (restaurant.plan === "free") {
          return new Response("Menu verrouillé — déverrouille-le pour télécharger le PDF.", {
            status: 402,
          });
        }

        const { data: categories } = await supabaseAdmin
          .from("categories")
          .select("id, name, position")
          .eq("restaurant_id", restaurant.id)
          .order("position");
        const { data: dishes } = await supabaseAdmin
          .from("dishes")
          .select("id, name, description, price, category_id, available, position")
          .eq("restaurant_id", restaurant.id)
          .eq("available", true)
          .order("position");

        const pdf = await PDFDocument.create();
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const regular = await pdf.embedFont(StandardFonts.Helvetica);
        const orange = rgb(1, 0.42, 0.17);
        const ink = rgb(0.05, 0.05, 0.05);
        const grey = rgb(0.42, 0.42, 0.4);

        const W = 595.28;
        const H = 841.89;
        const M = 48;
        let page = pdf.addPage([W, H]);
        let y = H - M;

        const clean = (s: string) => s.replace(/[^\x20-\xFF]/g, "");

        function ensure(space: number) {
          if (y - space < M) {
            page = pdf.addPage([W, H]);
            y = H - M;
          }
        }

        function wrap(text: string, size: number, maxWidth: number) {
          const words = clean(text).split(/\s+/);
          const lines: string[] = [];
          let line = "";
          for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (regular.widthOfTextAtSize(next, size) > maxWidth && line) {
              lines.push(line);
              line = word;
            } else line = next;
          }
          if (line) lines.push(line);
          return lines;
        }

        page.drawText(clean(restaurant.name), { x: M, y: y - 26, size: 26, font: bold, color: ink });
        y -= 44;
        const sub = [restaurant.city, restaurant.whatsapp].filter(Boolean).join(" · ");
        if (sub) {
          page.drawText(clean(sub), { x: M, y, size: 11, font: regular, color: grey });
          y -= 22;
        }
        page.drawRectangle({ x: M, y, width: W - M * 2, height: 2, color: orange });
        y -= 28;

        for (const category of categories ?? []) {
          const list = (dishes ?? []).filter((d) => d.category_id === category.id);
          if (!list.length) continue;
          ensure(60);
          page.drawText(clean(category.name).toUpperCase(), {
            x: M,
            y,
            size: 13,
            font: bold,
            color: orange,
          });
          y -= 20;

          for (const dish of list) {
            const priceText = dish.price ? `${dish.price.toLocaleString("fr-FR")} FCFA` : "";
            const priceWidth = priceText ? bold.widthOfTextAtSize(priceText, 11) : 0;
            const nameWidth = W - M * 2 - priceWidth - 12;
            const descLines = dish.description ? wrap(dish.description, 9.5, nameWidth) : [];
            ensure(20 + descLines.length * 12);

            page.drawText(clean(dish.name), { x: M, y, size: 11.5, font: bold, color: ink });
            if (priceText) {
              page.drawText(priceText, {
                x: W - M - priceWidth,
                y,
                size: 11,
                font: bold,
                color: ink,
              });
            }
            y -= 14;
            for (const line of descLines) {
              page.drawText(line, { x: M, y, size: 9.5, font: regular, color: grey });
              y -= 12;
            }
            y -= 6;
          }
          y -= 10;
        }

        ensure(30);
        page.drawText("Cree avec MenuAI", { x: M, y: M - 24, size: 9, font: regular, color: grey });

        const bytes = await pdf.save();
        return new Response(bytes as unknown as BodyInit, {
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="menu-${restaurant.slug}.pdf"`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
