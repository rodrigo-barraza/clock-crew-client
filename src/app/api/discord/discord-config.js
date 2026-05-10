// ============================================================
// Clock Crew — Discord API Constants
// ============================================================
// Centralized Discord configuration for all API proxy routes.
// Guild ID is hardcoded here for security — never accept it
// from client-side requests.
// ============================================================

export const GUILD_ID = "249010731910037507"; // Clock Crew
export const LUPOS_BOT_URL = process.env.LUPOS_URL || "http://localhost:1337";
export const TOOLS_SERVICE_URL = process.env.TOOLS_SERVICE_URL || "http://localhost:5590";
