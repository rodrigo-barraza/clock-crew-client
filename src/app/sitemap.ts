// ── sitemap.xml via Next.js App Router ───────────────────────
// Static pages plus every /clocks/[username] member page in the
// directory.
// ──────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants";
import { fetchService } from "@/lib/clockCrewService";
import type { DirectoryUser } from "@/types";

export const revalidate = 86_400; // 1 day — must be a literal for Next.js static analysis

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    { url: `${SITE_URL}/clocks`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/history`, changeFrequency: "monthly", priority: 0.8 },
  ];

  try {
    const { users } = await fetchService<{ users: DirectoryUser[] }>(
      "/clockcrew/users?limit=5000",
      {
        next: { revalidate },
      },
    );
    // No lastModified: the archive does not know when a profile last changed,
    // and a registration date passed off as one would be wrong.
    const memberPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${SITE_URL}/clocks/${encodeURIComponent(user.username)}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticPages, ...memberPages];
  } catch (error) {
    // Static pages only while the service is unavailable.
    console.error(
      "[sitemap] Failed to fetch members:",
      (error as Error).message,
    );
    return staticPages;
  }
}
