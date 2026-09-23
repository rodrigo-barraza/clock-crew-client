// ============================================================
// Clock Crew — Server Configuration
// ============================================================
// Every key here is listed in next.config.ts's SERVER_ENV_KEYS, so
// the build inlines the vault's value and a standalone server that
// cannot reach the vault still has it. Server-only: none of this is
// ever bundled for the browser.
// ============================================================

import "server-only";

export const SERVER_CONFIG = {
  get clockCrewServiceUrl() {
    return process.env.CLOCK_CREW_SERVICE_URL;
  },
  get toolsServiceUrl() {
    return process.env.TOOLS_SERVICE_URL;
  },
  get luposUrl() {
    return process.env.LUPOS_BOT_URL;
  },
  get minioInternalUrl() {
    return process.env.MINIO_INTERNAL_URL;
  },
  /** The Clock Crew Discord guild — from the vault, never from a request. */
  get guildId() {
    return process.env.CLOCK_CREW_GUILD_ID;
  },
  get sessionsServiceUrl() {
    return process.env.SESSIONS_SERVICE_URL;
  },
  get sessionsServicePublicUrl() {
    return process.env.SESSIONS_SERVICE_PUBLIC_URL;
  },
};
