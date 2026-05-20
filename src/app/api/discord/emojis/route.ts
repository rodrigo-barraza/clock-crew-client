// ============================================================
// Clock Crew — Discord Emoji List API Proxy
// ============================================================
// Proxies requests to Lupos to fetch custom server emojis for
// the emoji picker in DiscordChatComponent.
// Guild is hardcoded for security.
// ============================================================

import { GUILD_ID, LUPOS_BOT_URL } from "../discord-config";

export async function GET() {
  try {
    const url = `${LUPOS_BOT_URL}/guild/emojis?guildId=${GUILD_ID}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch emojis" },
        { status: response.status },
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("[discord/emojis] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
