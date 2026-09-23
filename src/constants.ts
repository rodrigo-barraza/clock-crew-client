// ============================================================
// Clock Crew — Public Constants
// ============================================================
// Safe for both server and browser code. Service URLs and
// other runtime configuration live in src/config.ts (server-only).
// ============================================================

export const SITE_URL = "https://clocktopia.com";
export const SITE_NAME = "The Clock Crew";

// Publicly streamed Discord channels — the whitelist shared by the
// chat component and every discord API proxy route.
export const GENERAL_CHAT_CHANNEL_ID = "671089694397956116"; // #general-chat
export const MEMES_CHANNEL_ID = "676318241689436170"; // #memes
export const PUBLIC_CHANNEL_IDS = [GENERAL_CHAT_CHANNEL_ID, MEMES_CHANNEL_ID];
