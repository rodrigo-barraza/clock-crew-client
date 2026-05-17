// ============================================================
// Clock Crew — Media Proxy
// ============================================================
// Proxies requests for archived Discord media from the internal
// MinIO instance to the public web. This prevents Chrome's
// Private Network Access (PNA) prompt by keeping all resource
// loads on the same public origin.
//
// Incoming:  GET /api/media/discord-media/media/<key>
// Proxied:   GET http://<MINIO_HOST>:9000/discord-media/media/<key>
// ============================================================

const MINIO_INTERNAL_URL = process.env.MINIO_INTERNAL_URL;

export async function GET(_request: any,  { params }: any) {
  const segments = (await params).path;
  const objectPath = segments.join("/");

  const upstream = `${MINIO_INTERNAL_URL}/${objectPath}`;

  try {
    const response = await fetch(upstream, { cache: "no-store" });

    if (!response.ok) {
      return new Response(null, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        // Archived media is immutable — cache aggressively
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[media] Proxy error:", (error as any).message);
    return new Response(null, { status: 502 });
  }
}
