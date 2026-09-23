// ============================================================
// Clock Crew — Next.js Configuration
// ============================================================
// Fills process.env from the vault at dev/build time. A variable
// already set in the environment wins, so a local run can point a
// service URL somewhere else.
// ============================================================

import { createVaultClient } from "@rodrigo-barraza/utilities-library/node";
import type { NextConfig } from "next";

for (const [key, value] of Object.entries(createVaultClient().fetchSync())) {
  if (process.env[key] === undefined || process.env[key] === "")
    process.env[key] = value;
}

/**
 * Server-side settings, inlined into the server build. The standalone
 * server's boot.js is meant to supply them again at runtime, but a
 * value it cannot supply would otherwise be undefined in production —
 * which is how the live chat lost its guild, Lupos and MinIO settings.
 * Only src/config.ts reads them, and it is server-only.
 */
const SERVER_ENV_KEYS = [
  "CLOCK_CREW_SERVICE_URL",
  "TOOLS_SERVICE_URL",
  "LUPOS_BOT_URL",
  "MINIO_INTERNAL_URL",
  "CLOCK_CREW_GUILD_ID",
  "SESSIONS_SERVICE_URL",
  "SESSIONS_SERVICE_PUBLIC_URL",
] as const;

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["clocktopia.com"],
  transpilePackages: [
    "@rodrigo-barraza/components-library",
    "@rodrigo-barraza/utilities-library",
  ],
  turbopack: {},

  env: Object.fromEntries(
    SERVER_ENV_KEYS.flatMap((key) =>
      process.env[key] ? [[key, process.env[key]]] : [],
    ),
  ),

  images: {
    remotePatterns: [
      // Discord avatars and attachments
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "media.discordapp.net" },
      // Newgrounds + ClockCrew.net
      { protocol: "https", hostname: "picon.ngfiles.com" },
      { protocol: "https", hostname: "img.ngfiles.com" },
      { protocol: "https", hostname: "clockcrew.net" },
    ],
  },

  // 301 www → bare domain (canonical URL)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.clocktopia.com" }],
        destination: "https://clocktopia.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
