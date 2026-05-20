// ============================================================
// Clock Crew — Discord Messages API Proxy
// ============================================================
// Proxies requests to tools-service's Discord message search endpoint.
// Hardcodes the guild/channel to prevent abuse.
//
// Private MinIO URLs are rewritten to prevent Chrome's
// Private Network Access (PNA) prompt for all visitors.
// ============================================================

import { rewritePrivateUrls } from "../rewritePrivateUrls";
import { GUILD_ID, TOOLS_SERVICE_URL } from "../discord-config";
const CHANNEL_ID = "671089694397956116"; // #general-chat

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 500);

  try {
    const url = `${TOOLS_SERVICE_URL}/discord/messages/search?guildId=${GUILD_ID}&channelId=${CHANNEL_ID}&limit=${limit}&includeBots=true`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch messages" },
        { status: response.status },
      );
    }

    // Sanitize private MinIO URLs before sending to the browser
    const raw = await response.text();
    const sanitized = rewritePrivateUrls(raw);
    return new Response(sanitized, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[discord/messages] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
