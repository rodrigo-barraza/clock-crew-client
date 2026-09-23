// ============================================================
// Clock Crew — Media Proxy
// ============================================================
// Serves archived Discord media from the internal MinIO on the
// public origin, so no visitor gets Chrome's Private Network
// Access prompt.
//
//   GET /api/media/discord-media/<key>  →  <MINIO>/discord-media/<key>
//
// Only the archived-media bucket is reachable; anything else, and
// any path that tries to climb out of it, is a 404.
// ============================================================

import { SERVER_CONFIG } from "@/config";
import { mediaObjectPath } from "@/lib/media";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const objectPath = mediaObjectPath((await params).path ?? []);
  const baseUrl = SERVER_CONFIG.minioInternalUrl;
  if (!objectPath || !baseUrl) return new Response(null, { status: 404 });

  try {
    const response = await fetch(`${baseUrl}/${objectPath}`, {
      cache: "no-store",
    });
    if (!response.ok)
      return new Response(null, {
        status: response.status === 403 ? 404 : response.status,
      });

    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        ...(response.headers.get("Content-Length") && {
          "Content-Length": response.headers.get("Content-Length")!,
        }),
        // Archived media is immutable — cache aggressively
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[media] Proxy error:", (error as Error).message);
    return new Response(null, { status: 502 });
  }
}
