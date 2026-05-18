// ============================================================
// Clock Crew — Newgrounds Profile Card API Proxy
// ============================================================
// Proxies enriched profile card requests to clockcrew-api.
// ============================================================

import { CLOCK_CREW_SERVICE_URL } from "@/config";

export async function GET(request: any, { params }: any) {
  const { username } = await params;

  try {
    const url = `${CLOCK_CREW_SERVICE_URL}/newgrounds/portal/${encodeURIComponent(username)}/card`;
    const response = await fetch(url, { next: { revalidate: 600 } });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch card data" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[newgrounds/card] Proxy error:", (error as any).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
