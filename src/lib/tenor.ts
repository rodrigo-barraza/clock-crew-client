// ── Tenor link helpers (the /api/tenor/oembed route) ──

/** A tenor.com page URL, or null. `includes("tenor.com")` also let "evil.com/?tenor.com" through. */
export function parseTenorUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" ||
      (host !== "tenor.com" && !host.endsWith(".tenor.com"))
    )
      return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function thumbnailToGif(
  thumbnailUrl: string | undefined,
): string | null {
  if (!thumbnailUrl) return null;
  // https://media.tenor.com/{hash}AAAAN/{slug}.png → https://media.tenor.com/{hash}AAAAC/{slug}.gif
  return thumbnailUrl.replace(/AAAAN\//, "AAAAC/").replace(/\.png$/, ".gif");
}
