// ============================================================
// Clock Crew — Discord API Constants
// ============================================================
// Centralized Discord configuration for all API proxy routes.
// Guild ID is sourced from vault — never accept it from client-side requests.
// ============================================================

export const GUILD_ID = process.env.GUILD_ID; // Clock Crew — from vault
import {
  LUPOS_BOT_URL,
  TOOLS_SERVICE_URL,
  GENERAL_CHAT_CHANNEL_ID,
  PUBLIC_CHANNEL_IDS,
} from "@/config";
export { LUPOS_BOT_URL, TOOLS_SERVICE_URL, GENERAL_CHAT_CHANNEL_ID, PUBLIC_CHANNEL_IDS };
