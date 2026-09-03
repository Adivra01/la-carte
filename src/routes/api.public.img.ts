import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/img")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("path");
        if (!path || path.includes("..")) return new Response("Bad request", { status: 400 });

        const { downloadDishImage } = await import("@/lib/menuai.server");
        const bytes = await downloadDishImage(path);
        if (!bytes) return new Response("Not found", { status: 404 });

        return new Response(bytes, {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
