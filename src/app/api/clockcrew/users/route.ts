// ============================================================
// Clock Crew — User Listing API Proxy
// ============================================================
// Proxies GET requests to clockcrew-api /clockcrew/users.
// Supports ?limit= and ?q= query params.
// ============================================================

import { CLOCK_CREW_SERVICE_URL } from "@/config";

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  const limit = searchParams.get("limit");
  const q = searchParams.get("q");
  if (limit) params.set("limit", limit);
  if (q) params.set("q", q);

  try {
    const url = `${CLOCK_CREW_SERVICE_URL}/clockcrew/users?${params}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch user listing" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[clockcrew/users] Proxy error:", (error as any).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
