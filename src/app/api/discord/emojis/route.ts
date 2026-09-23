// Clock Crew — the guild's custom emojis (from Lupos) for the chat's emoji picker.

import { discordConfig } from "../discord-config";

export async function GET() {
  try {
    const response = await fetch(
      `${discordConfig.luposUrl}/guild/emojis?guildId=${discordConfig.guildId}`,
      {
        cache: "no-store",
      },
    );
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
