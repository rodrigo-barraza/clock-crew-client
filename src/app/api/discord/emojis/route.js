// ============================================================
// Clock Crew — Discord Emoji List API Proxy
// ============================================================
// Proxies requests to Lupos to fetch custom server emojis for
// the emoji picker in DiscordChatComponent.
// Guild is hardcoded for security.
// ============================================================

const LUPOS_BOT_URL = process.env.LUPOS_URL || "http://localhost:1337";
const GUILD_ID = "249010731910037507"; // Clock Crew

export async function GET() {
  try {
    const url = `${LUPOS_BOT_URL}/guild/emojis?guildId=${GUILD_ID}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch emojis" },
        { status: res.status },
      );
    }

    return Response.json(await res.json());
  } catch (error) {
    console.error("[discord/emojis] Proxy error:", error.message);
    return Response.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }
}
