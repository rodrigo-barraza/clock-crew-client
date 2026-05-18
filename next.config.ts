// ============================================================
// Clock Crew — Next.js Configuration
// ============================================================
// Bootstraps secrets from Vault at startup
// and injects them into process.env for the app.
// ============================================================

import { createVaultClient } from "@rodrigo-barraza/utilities-library/node";
import type { NextConfig } from "next";

// ── Bootstrap secrets at build/dev time ────────────────────────
const vault = createVaultClient();

const secrets = vault.fetchSync();

// Inject into process.env so secrets.js can read them
Object.assign(process.env, secrets);

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["clocktopia.com"],
  transpilePackages: ["@rodrigo-barraza/components-library", "@rodrigo-barraza/utilities-library"],
  turbopack: {},

  // Discord avatar and attachment images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "media.discordapp.net",
      },
      {
        protocol: "https",
        hostname: "picon.ngfiles.com",
      },
      {
        protocol: "https",
        hostname: "img.ngfiles.com",
      },
      {
        protocol: "https",
        hostname: "clockcrew.net",
      },
    ],
  },

  env: {
    CLOCK_CREW_CLIENT_PORT: secrets.CLOCK_CREW_CLIENT_PORT,
    CLOCK_CREW_SERVICE_URL: secrets.CLOCK_CREW_SERVICE_URL,
    GUILD_ID: secrets.GUILD_ID,
    TOOLS_SERVICE_URL: secrets.TOOLS_SERVICE_URL,
    LUPOS_URL: secrets.LUPOS_URL,
    MINIO_INTERNAL_URL: secrets.MINIO_INTERNAL_URL,
    SESSIONS_SERVICE_URL: secrets.SESSIONS_SERVICE_URL,
    SESSIONS_SERVICE_PUBLIC_URL: secrets.SESSIONS_SERVICE_PUBLIC_URL,
  
    // Explicit NEXT_PUBLIC_ variables for Turbopack client-side injection
    NEXT_PUBLIC_CLOCK_CREW_CLIENT_PORT: secrets.CLOCK_CREW_CLIENT_PORT,
    NEXT_PUBLIC_CLOCK_CREW_SERVICE_URL: secrets.CLOCK_CREW_SERVICE_URL,
    NEXT_PUBLIC_TOOLS_SERVICE_URL: secrets.TOOLS_SERVICE_URL,
  },

  // 301 redirect www → bare domain (canonical URL)
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
