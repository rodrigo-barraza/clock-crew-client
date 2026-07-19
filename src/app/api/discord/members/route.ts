// ============================================================
// Clock Crew — Discord Members API Proxy
// ============================================================
// Proxies requests to Lupos for live Discord member/presence data.
// Guild is hardcoded for security.
// Retries on 503 (Discord client not ready) with exponential backoff.
// ============================================================

import { retry } from "@rodrigo-barraza/utilities-library";
import { GUILD_ID, LUPOS_BOT_URL } from "../discord-config";
const MAX_RETRIES = 3;

/** Thrown inside the retry action to signal a retryable upstream status. */
class RetryableStatusError extends Error {
  response: Response;
  constructor(response: Response) {
    super(`Upstream responded ${response.status}`);
    this.response = response;
  }
}

async function respondFromUpstream(response: Response): Promise<Response> {
  if (!response.ok) {
    return Response.json(
      { error: "Failed to fetch members" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return Response.json(data);
}

export async function GET() {
  try {
    // Network errors and 503s (thrown below) are retried with 1s, 2s, 4s
    // backoff; other statuses return normally and are never retried.
    return await retry(
      async () => {
        const url = `${LUPOS_BOT_URL}/guild/members?guildId=${GUILD_ID}`;
        const response = await fetch(url, { cache: "no-store" });

        // Retry on 503 — Lupos Discord client isn't ready yet
        if (response.status === 503) throw new RetryableStatusError(response);

        return respondFromUpstream(response);
      },
      { retries: MAX_RETRIES, delay: 1000, backoff: 2 },
    );
  } catch (error) {
    // Retries exhausted on 503 — respond from the last upstream response,
    // same as any other non-ok status.
    if (error instanceof RetryableStatusError) {
      return respondFromUpstream(error.response);
    }

    console.error("[discord/members] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
