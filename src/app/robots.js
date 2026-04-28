// ── robots.txt via Next.js App Router ────────────────────────
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://clocktopia.com/sitemap.xml",
  };
}
