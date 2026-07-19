// ============================================================
// Clock Crew — Discord Channels API Proxy
// ============================================================
// Proxies requests to Lupos for live Discord channel data.
// Falls back to tools-service message metadata when Lupos guild
// routes are unavailable.
// Guild is hardcoded for security.
// ============================================================

import {
  discordBannerUrl,
  discordGuildIconUrl,
  discordSplashUrl,
} from "@rodrigo-barraza/utilities-library/discord";

import { GUILD_ID, LUPOS_BOT_URL, TOOLS_SERVICE_URL } from "../discord-config";

// Whitelisted channel IDs — must match DiscordChatComponent
const CHANNEL_IDS = ["671089694397956116", "676318241689436170"];

export async function GET() {
  // ── Try Lupos first (live Discord.js cache) ──────────────────
  try {
    const url = `${LUPOS_BOT_URL}/guild/channels?guildId=${GUILD_ID}`;
    const response = await fetch(url, { cache: "no-store" });

    if (response.ok) {
      const data = await response.json();
      return Response.json(data);
    }
  } catch {
    // Lupos unavailable — fall through to tools-service fallback
  }

  // ── Fallback: derive channel names from tools-service messages ───
  // Fetch one message per whitelisted channel to extract the
  // channel.name and guild.name from the stored MongoDB data.
  try {
    const results = await Promise.allSettled(
      CHANNEL_IDS.map(async (channelId) => {
        const url = `${TOOLS_SERVICE_URL}/discord/messages/search?guildId=${GUILD_ID}&channelId=${channelId}&limit=1&includeBots=true`;
        const response = await fetch(url);
        if (!response.ok) return { channelId, name: channelId };
        const data = await response.json();
        const message = data.messages?.[0];
        return {
          channelId,
          name: message?.channelName || message?.channel || channelId,
          parentName: message?.parentName || null,
        };
      }),
    );

    // Also grab guild name + icon/banner from a full-mode message
    let guildName = null;
    let guildIcon = null;
    let guildBanner = null;
    let guildSplash = null;
    try {
      const guildRes = await fetch(
        `${TOOLS_SERVICE_URL}/discord/messages/search?guildId=${GUILD_ID}&limit=1&includeBots=true`,
      );
      if (guildRes.ok) {
        const guildData = await guildRes.json();
        const message = guildData.messages?.[0];
        guildName = message?.guildName || null;
        // Build CDN URLs from stored icon/banner/splash hashes
        guildIcon = discordGuildIconUrl(GUILD_ID, message?.guildIcon);
        guildBanner = discordBannerUrl(GUILD_ID, message?.guildBanner);
        guildSplash = discordSplashUrl(GUILD_ID, message?.guildSplash);
      }
    } catch {
      // non-critical
    }

    const channels = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => ({
        id: result.value.channelId,
        name: result.value.name,
        topic: null,
        parentId: null,
        parentName: result.value.parentName,
        position: CHANNEL_IDS.indexOf(result.value.channelId),
      }));

    return Response.json({
      guildId: GUILD_ID,
      guildName: guildName || "Clock Crew",
      guildIcon,
      guildBanner,
      guildSplash,
      channels,
    });
  } catch (error) {
    console.error("[discord/channels] Fallback error:", (error as Error).message);
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
}
