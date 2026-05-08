// ============================================================
// Clock Crew — Next.js Configuration
// ============================================================
// Bootstraps secrets from Vault (or .env fallback) at startup
// and injects them into process.env for the app.
// ============================================================

import { createVaultClient } from "@rodrigo-barraza/utilities-library/node";

// ── Bootstrap secrets at build/dev time ────────────────────────
const vault = createVaultClient({
  localEnvFile: "./.env",
  fallbackEnvFile: "../vault-service/.env",
});

const secrets = await vault.fetch();

// Inject into process.env so secrets.js can read them
Object.assign(process.env, secrets);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    TOOLS_SERVICE_URL: secrets.TOOLS_SERVICE_URL,
    LUPOS_URL: secrets.LUPOS_URL,
  
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
