// ============================================================
// Clock Crew — Discord Messages SSE Stream Proxy
// ============================================================
// Pipes tools-service's live message stream to the browser's
// EventSource. Guild from the vault, channel from the public
// whitelist; private MinIO URLs are rewritten on the fly so no
// visitor gets Chrome's Private Network Access prompt.
// ============================================================

import {
  ALLOWED_CHANNELS,
  discordConfig,
  GENERAL_CHAT_CHANNEL_ID,
  messageLimit,
  rewriteMediaStream,
} from "../discord-config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = messageLimit(searchParams);
  const requested = searchParams.get("channelId") ?? "";
  const channelId = ALLOWED_CHANNELS.has(requested)
    ? requested
    : GENERAL_CHAT_CHANNEL_ID;

  try {
    const upstream = await fetch(
      `${discordConfig.toolsServiceUrl}/discord/messages/stream?guildId=${discordConfig.guildId}&channelId=${channelId}&limit=${limit}&includeBots=true`,
      // The browser disconnecting aborts the upstream connection too.
      { cache: "no-store", signal: request.signal },
    );

    if (!upstream.ok || !upstream.body) {
      return Response.json(
        { error: "Failed to connect to message stream" },
        { status: upstream.ok ? 502 : upstream.status },
      );
    }

    return new Response(rewriteMediaStream(upstream.body), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    // The client disconnecting mid-connect is expected, not an error.
    if ((error as Error).name === "AbortError")
      return new Response(null, { status: 499 });
    console.error("[discord/stream] Proxy error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
