// ============================================================
// Clock Crew — Newgrounds Portal Years API Proxy
// ============================================================
// Proxies year dropdown data requests to clockcrew-api /newgrounds/portal/years.
// ============================================================

import { CLOCK_CREW_SERVICE_URL } from "../../../../../../config";

export async function GET() {
  try {
    const url = `${CLOCK_CREW_SERVICE_URL}/newgrounds/portal/years`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch years data" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[newgrounds/portal/years] Proxy error:", (error as any).message);
    return Response.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }
}
