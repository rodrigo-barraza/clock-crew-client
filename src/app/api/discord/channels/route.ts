// ============================================================
// Clock Crew — Discord Channels API Proxy
// ============================================================
// Live channel data from Lupos; when Lupos is down, channel and
// guild names derived from tools-service's stored messages.
// ============================================================

import {
  discordBannerUrl,
  discordGuildIconUrl,
  discordSplashUrl,
} from "@rodrigo-barraza/utilities-library/discord";
import { discordConfig, PUBLIC_CHANNEL_IDS } from "../discord-config";

interface StoredMessage {
  channelName?: string;
  channel?: string;
  parentName?: string;
  guildName?: string;
  guildIcon?: string;
  guildBanner?: string;
  guildSplash?: string;
}

async function latestStoredMessage(
  query: string,
): Promise<StoredMessage | undefined> {
  const response = await fetch(
    `${discordConfig.toolsServiceUrl}/discord/messages/search?guildId=${discordConfig.guildId}&limit=1&includeBots=true${query}`,
    { cache: "no-store" },
  );
  if (!response.ok) return undefined;
  const data = (await response.json()) as { messages?: StoredMessage[] };
  return data.messages?.[0];
}

export async function GET() {
  try {
    const response = await fetch(
      `${discordConfig.luposUrl}/guild/channels?guildId=${discordConfig.guildId}`,
      {
        cache: "no-store",
      },
    );
    if (response.ok) return Response.json(await response.json());
  } catch {
    // Lupos unavailable — fall back to stored messages below.
  }

  try {
    const [channelMessages, guildMessage] = await Promise.all([
      Promise.all(
        PUBLIC_CHANNEL_IDS.map((channelId) =>
          latestStoredMessage(`&channelId=${channelId}`).catch(() => undefined),
        ),
      ),
      latestStoredMessage("").catch(() => undefined),
    ]);
    const guildId = discordConfig.guildId ?? "";

    return Response.json({
      guildId,
      guildName: guildMessage?.guildName || "Clock Crew",
      guildIcon: discordGuildIconUrl(guildId, guildMessage?.guildIcon),
      guildBanner: discordBannerUrl(guildId, guildMessage?.guildBanner),
      guildSplash: discordSplashUrl(guildId, guildMessage?.guildSplash),
      channels: PUBLIC_CHANNEL_IDS.map((channelId, position) => ({
        id: channelId,
        name:
          channelMessages[position]?.channelName ||
          channelMessages[position]?.channel ||
          channelId,
        topic: null,
        parentId: null,
        parentName: channelMessages[position]?.parentName || null,
        position,
      })),
    });
  } catch (error) {
    console.error(
      "[discord/channels] Fallback error:",
      (error as Error).message,
    );
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
