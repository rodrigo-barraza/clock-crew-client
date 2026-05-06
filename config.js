// ============================================================
// Clock Crew — Runtime Configuration
// ============================================================
// Typed accessor layer over process.env. The Vault service is
// the single source of truth — next.config.mjs hydrates
// process.env from the Vault before any module imports run.
//
// This file contains NO defaults and NO secrets.
// ============================================================

export const PORT = process.env.CLOCK_CREW_CLIENT_PORT;

export const IS_PRODUCTION =
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".com");

export const IS_LOCALHOST = !IS_PRODUCTION;

// Environment-aware project name — isolates data between dev and prod
export const PROJECT_NAME = "clock-crew";
