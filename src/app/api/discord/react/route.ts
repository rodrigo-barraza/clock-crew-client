// ============================================================
// Clock Crew — Discord Reaction API Proxy
// ============================================================
// Forwards reaction requests from the DiscordChatComponent to
// the Lupos bot, which adds the reaction via the Discord API.
// Guild is hardcoded for security; channel is validated against
// the whitelist.
// ============================================================

import { GUILD_ID, LUPOS_BOT_URL } from "../discord-config";

// Whitelist of allowed channel IDs (must match stream/route.js)
const ALLOWED_CHANNELS = new Set([
  "671089694397956116", // #general-chat
  "676318241689436170", // #memes
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channelId, messageId, emoji } = body;

    if (!channelId || !messageId || !emoji) {
      return Response.json(
        { error: "channelId, messageId, and emoji are required" },
        { status: 400 },
      );
    }

    // Validate channel against whitelist
    if (!ALLOWED_CHANNELS.has(channelId)) {
      return Response.json({ error: "Channel not allowed" }, { status: 403 });
    }

    const response = await fetch(`${LUPOS_BOT_URL}/guild/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guildId: GUILD_ID, channelId, messageId, emoji }),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("[discord/react] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
