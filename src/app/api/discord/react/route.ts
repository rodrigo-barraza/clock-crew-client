// ============================================================
// Clock Crew — Discord Reaction API Proxy
// ============================================================
// Forwards a reaction from the chat component to Lupos, which adds
// it through the Discord API. Guild from the vault; channel limited
// to the public whitelist; ids must be snowflakes.
// ============================================================

import {
  ALLOWED_CHANNELS,
  discordConfig,
  isSnowflake,
} from "../discord-config";

/** A unicode emoji or a custom `name:id` — anything longer is not an emoji. */
const MAX_EMOJI_LENGTH = 64;

export async function POST(request: Request) {
  let body: { channelId?: unknown; messageId?: unknown; emoji?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be JSON" },
      { status: 400 },
    );
  }

  const { channelId, messageId, emoji } = body;
  if (
    !isSnowflake(channelId) ||
    !isSnowflake(messageId) ||
    typeof emoji !== "string" ||
    !emoji ||
    emoji.length > MAX_EMOJI_LENGTH
  ) {
    return Response.json(
      { error: "channelId, messageId and emoji are required" },
      { status: 400 },
    );
  }
  if (!ALLOWED_CHANNELS.has(channelId)) {
    return Response.json({ error: "Channel not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(`${discordConfig.luposUrl}/guild/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guildId: discordConfig.guildId,
        channelId,
        messageId,
        emoji,
      }),
    });
    const data = await response
      .json()
      .catch(() => ({ error: "Invalid upstream response" }));
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("[discord/react] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
