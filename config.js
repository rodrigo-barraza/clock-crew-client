// ============================================================
// Clock Crew — Runtime Configuration
// ============================================================
// Typed accessor layer over process.env. The Vault service is
// the single source of truth — next.config.mjs hydrates
// process.env from the Vault before any module imports run.
//
// This file contains NO defaults and NO secrets.
// ============================================================

export const PORT = (process.env.NEXT_PUBLIC_CLOCK_CREW_CLIENT_PORT || process.env.CLOCK_CREW_CLIENT_PORT);

export const IS_PRODUCTION =
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".com");

export const IS_LOCALHOST = !IS_PRODUCTION;

// Environment-aware project name — isolates data between dev and prod
export const PROJECT_NAME = "clock-crew";

const IS_BROWSER = typeof window !== "undefined";

const RAW_SERVICE_URL =
  process.env.NEXT_PUBLIC_CLOCK_CREW_SERVICE_URL || process.env.CLOCK_CREW_SERVICE_URL;

const PUBLIC_SERVICE_URL =
  process.env.NEXT_PUBLIC_CLOCK_CREW_SERVICE_PUBLIC_URL || process.env.CLOCK_CREW_SERVICE_PUBLIC_URL;

function resolveServiceUrl() {
  if (!IS_BROWSER) return RAW_SERVICE_URL;
  if (IS_PRODUCTION && PUBLIC_SERVICE_URL) return PUBLIC_SERVICE_URL;
  return RAW_SERVICE_URL;
}

export const CLOCK_CREW_SERVICE_URL = resolveServiceUrl();
export const LUPOS_BOT_URL = process.env.LUPOS_BOT_URL || process.env.LUPOS_URL;
export const TOOLS_SERVICE_URL = process.env.TOOLS_SERVICE_URL;
