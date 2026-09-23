// ============================================================
// Clock Crew — Tenor oEmbed Proxy
// ============================================================
// Resolves a tenor.com link to its animated GIF. The oEmbed
// thumbnail is the "AAAAN" (nano PNG) variant; "AAAAC" is the GIF.
//
// GET /api/tenor/oembed?url=https://tenor.com/view/...
// → { gifUrl, thumbnailUrl, width, height, title }
// ============================================================

import { parseTenorUrl, thumbnailToGif } from "@/lib/tenor";

const ONE_DAY_SECONDS = 86_400;
const CACHE_TTL_MS = ONE_DAY_SECONDS * 1000;
const CACHE_MAX_ENTRIES = 500;

interface TenorGif {
  gifUrl: string | null;
  thumbnailUrl: string | null;
  width: number;
  height: number;
  title: string;
}

/** Insertion-ordered, so the first key is always the oldest entry. */
const cache = new Map<string, { data: TenorGif; storedAt: number }>();

function remember(key: string, data: TenorGif) {
  cache.delete(key);
  cache.set(key, { data, storedAt: Date.now() });
  while (cache.size > CACHE_MAX_ENTRIES)
    cache.delete(cache.keys().next().value!);
}

const CACHE_HEADERS = { "Cache-Control": `public, max-age=${ONE_DAY_SECONDS}` };

export async function GET(request: Request) {
  const tenorUrl = parseTenorUrl(new URL(request.url).searchParams.get("url"));
  if (!tenorUrl) {
    return Response.json(
      { error: "Missing or invalid Tenor URL" },
      { status: 400 },
    );
  }

  const cached = cache.get(tenorUrl);
  if (cached && Date.now() - cached.storedAt < CACHE_TTL_MS) {
    return Response.json(cached.data, { headers: CACHE_HEADERS });
  }

  try {
    const response = await fetch(
      `https://tenor.com/oembed?url=${encodeURIComponent(tenorUrl)}`,
      {
        next: { revalidate: ONE_DAY_SECONDS },
      },
    );
    if (!response.ok) {
      return Response.json(
        { error: "Tenor oEmbed request failed" },
        { status: response.status },
      );
    }

    const oembed = (await response.json()) as {
      thumbnail_url?: string;
      thumbnail_width?: number;
      thumbnail_height?: number;
      width?: number;
      height?: number;
      author_name?: string;
    };
    const data: TenorGif = {
      gifUrl: thumbnailToGif(oembed.thumbnail_url),
      thumbnailUrl: oembed.thumbnail_url ?? null,
      width: oembed.thumbnail_width || oembed.width || 400,
      height: oembed.thumbnail_height || oembed.height || 300,
      title: oembed.author_name || "Tenor GIF",
    };
    remember(tenorUrl, data);
    return Response.json(data, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("[tenor/oembed] Proxy error:", (error as Error).message);
    return Response.json(
      { error: "Failed to fetch Tenor data" },
      { status: 502 },
    );
  }
}
