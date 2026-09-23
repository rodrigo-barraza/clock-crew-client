// ── Media proxy path rules (the /api/media route) ──

const MEDIA_BUCKET = "discord-media";

/** The object path under the media bucket, or null when the request is outside it. */
export function mediaObjectPath(segments: string[]): string | null {
  if (segments[0] !== MEDIA_BUCKET || segments.length < 2) return null;
  if (
    segments.some(
      (segment) =>
        segment === "" ||
        segment === "." ||
        segment === ".." ||
        segment.includes("\\"),
    )
  ) {
    return null;
  }
  return segments.map(encodeURIComponent).join("/");
}
