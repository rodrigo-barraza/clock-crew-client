// ============================================================
// Clock Crew — Discord Members API Proxy
// ============================================================
// Proxies requests to Lupos for live Discord member/presence data.
// Guild is hardcoded for security.
// Retries on 503 (Discord client not ready) with exponential backoff.
// ============================================================

import { GUILD_ID, LUPOS_BOT_URL } from "../discord-config";
const MAX_RETRIES = 3;

export async function GET() {
  let lastStatus = 503;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const url = `${LUPOS_BOT_URL}/guild/members?guildId=${GUILD_ID}`;
      const response = await fetch(url, { cache: "no-store" });

      // Retry on 503 — Lupos Discord client isn't ready yet
      if (response.status === 503 && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise((r: any) => setTimeout(r, delay));
        lastStatus = 503;
        continue;
      }

      if (!response.ok) {
        return Response.json(
          { error: "Failed to fetch members" },
          { status: response.status },
        );
      }

      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      // Network error — retry if attempts remain
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r: any) => setTimeout(r, delay));
        continue;
      }
      console.error("[discord/members] Proxy error:", (error as any).message);
      return Response.json(
        { error: "Service unavailable" },
        { status: 503 },
      );
    }
  }

  return Response.json(
    { error: "Service unavailable — Discord client not ready" },
    { status: lastStatus },
  );
}

