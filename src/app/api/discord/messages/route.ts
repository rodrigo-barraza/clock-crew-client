// ============================================================
// Clock Crew — Discord Messages API Proxy
// ============================================================
// Recent #general-chat messages from tools-service. Private MinIO
// URLs are rewritten so no visitor gets Chrome's Private Network
// Access prompt.
// ============================================================

import {
  discordConfig,
  GENERAL_CHAT_CHANNEL_ID,
  messageLimit,
  rewriteMediaUrls,
} from "../discord-config";

export async function GET(request: Request) {
  const limit = messageLimit(new URL(request.url).searchParams);

  try {
    const response = await fetch(
      `${discordConfig.toolsServiceUrl}/discord/messages/search?guildId=${discordConfig.guildId}&channelId=${GENERAL_CHAT_CHANNEL_ID}&limit=${limit}&includeBots=true`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch messages" },
        { status: response.status },
      );
    }
    return new Response(rewriteMediaUrls(await response.text()), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[discord/messages] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
