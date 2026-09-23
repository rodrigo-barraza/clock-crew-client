// ============================================================
// Clock Crew — Discord Members API Proxy
// ============================================================
// Live member/presence data from Lupos. A 503 means Lupos's Discord
// client is still starting, so it is retried with backoff.
// ============================================================

import { retry } from "@rodrigo-barraza/utilities-library";
import { discordConfig } from "../discord-config";

const MAX_RETRIES = 3;

/** Thrown inside the retry action to signal a retryable upstream status. */
class RetryableStatusError extends Error {
  readonly response: Response;
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
  return Response.json(await response.json());
}

export async function GET() {
  try {
    // Network errors and 503s are retried with 1 s, 2 s, 4 s backoff.
    return await retry(
      async () => {
        const response = await fetch(
          `${discordConfig.luposUrl}/guild/members?guildId=${discordConfig.guildId}`,
          {
            cache: "no-store",
          },
        );
        if (response.status === 503) throw new RetryableStatusError(response);
        return respondFromUpstream(response);
      },
      { retries: MAX_RETRIES, delay: 1000, backoff: 2 },
    );
  } catch (error) {
    // Retries exhausted on 503 — answer from the last upstream response.
    if (error instanceof RetryableStatusError)
      return respondFromUpstream(error.response);
    console.error("[discord/members] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
