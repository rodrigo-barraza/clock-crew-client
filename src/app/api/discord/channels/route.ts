// ============================================================
// Clock Crew — Discord Channels API Proxy
// ============================================================
// Proxies requests to Lupos for live Discord channel data.
// Falls back to tools-service message metadata when Lupos guild
// routes are unavailable.
// Guild is hardcoded for security.
// ============================================================

import { GUILD_ID, LUPOS_BOT_URL, TOOLS_SERVICE_URL } from "../discord-config";

// Whitelisted channel IDs — must match DiscordChatComponent
const CHANNEL_IDS = ["671089694397956116", "676318241689436170"];

export async function GET() {
  // ── Try Lupos first (live Discord.js cache) ──────────────────
  try {
    const url = `${LUPOS_BOT_URL}/guild/channels?guildId=${GUILD_ID}`;
    const res = await fetch(url, { cache: "no-store" });

    if (res.ok) {
      const data = await res.json();
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
        const res = await fetch(url);
        if (!res.ok) return { channelId, name: channelId };
        const data = await res.json();
        const msg = data.messages?.[0];
        return {
          channelId,
          name: msg?.channelName || msg?.channel || channelId,
          parentName: msg?.parentName || null,
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
        const msg = guildData.messages?.[0];
        guildName = msg?.guildName || null;
        // Build CDN URLs from stored icon/banner/splash hashes
        if (msg?.guildIcon) {
          const ext = msg.guildIcon.startsWith("a_") ? "gif" : "png";
          guildIcon = `https://cdn.discordapp.com/icons/${GUILD_ID}/${msg.guildIcon}.${ext}?size=128`;
        }
        if (msg?.guildBanner) {
          guildBanner = `https://cdn.discordapp.com/banners/${GUILD_ID}/${msg.guildBanner}.png?size=480`;
        }
        if (msg?.guildSplash) {
          guildSplash = `https://cdn.discordapp.com/splashes/${GUILD_ID}/${msg.guildSplash}.png?size=480`;
        }
      }
    } catch {
      // non-critical
    }

    const channels = results
      .filter((r: any) => r.status === "fulfilled")
      .map((r: any) => ({
        id: r.value.channelId,
        name: r.value.name,
        topic: null,
        parentId: null,
        parentName: r.value.parentName,
        position: CHANNEL_IDS.indexOf(r.value.channelId),
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
    console.error("[discord/channels] Fallback error:", (error as any).message);
    return Response.json(
      { error: "Service unavailable" },
      { status: 503 },
    );
  }
}
