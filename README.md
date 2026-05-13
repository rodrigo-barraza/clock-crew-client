# Clock Crew Client

Community website for [clock-crew.com](https://clock-crew.com) — celebrating the legacy of Flash animation and the iconic Clock Crew characters from Newgrounds.

**Live:** [clock-crew.com](https://clock-crew.com)

## Features

- **Homepage** — Landing page with real-time clock display and animated hero section
- **Discord Chat** — Live message feed from the Clock Crew Discord server
- **Wiki** — Community wiki with member directory, individual profiles, and history timeline
- **Newgrounds Portal** — Browse Clock Crew submissions on Newgrounds, filterable by year
- **Member Cards** — Profile cards with Newgrounds integration
- **SEO** — Dynamic sitemap and robots.txt generation

## Stack

| Dependency | Purpose |
|---|---|
| Next.js 16 | React framework (App Router, standalone output) |
| React 19 | UI library |
| `@rodrigo-barraza/components-library` | Shared component library (DiscordChatComponent) |
| `@rodrigo-barraza/utilities-library` | Shared utility functions |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

## Environment

Secrets are resolved in priority order:

1. `process.env` (manual env vars, Docker `--env`)
2. Local `.env` file
3. Vault service (`VAULT_SERVICE_URL` + `VAULT_SERVICE_TOKEN`)
4. Shared `../vault-service/.env` fallback

| Variable | Description |
|---|---|
| `CLOCK_CREW_PORT` | Dev server port (default `3001`) |
| `VAULT_SERVICE_URL` | Vault service endpoint |
| `LUPOS_URL` | Lupos bot API for Discord data |
| `MINIO_INTERNAL_URL` | MinIO endpoint for media proxying |

## Scripts

```bash
npm run start         # Start production server
npm run dev           # Start dev server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format with Prettier
npm run format:check  # Check formatting
npm test              # Run tests (Vitest)
npm run test:watch    # Run tests in watch mode
npm run deploy        # Deploy to production
npm run deploy:dry    # Validate deployment without deploying
```

## Architecture

```
clock-crew-client/
├── src/
│   ├── app/
│   │   ├── (wiki)/             # Wiki route group
│   │   │   ├── clocks/         # Member directory + individual profiles
│   │   │   └── history/        # History timeline page
│   │   ├── api/                # Next.js API routes
│   │   │   ├── clockcrew/      # Clock Crew user data proxy
│   │   │   ├── discord/        # Discord message/channel/member proxies
│   │   │   ├── media/          # MinIO media proxy
│   │   │   ├── newgrounds/     # Newgrounds portal + card data
│   │   │   └── tenor/          # Tenor GIF embed proxy
│   │   └── components/         # React components
│   │       ├── ClockComponent/
│   │       ├── DiscordChatComponent/
│   │       ├── HistoryTimelineComponent/
│   │       ├── MemberCardComponent/
│   │       ├── MemberProfileComponent/
│   │       ├── NavBarComponent/
│   │       ├── NewgroundsPortalComponent/
│   │       └── WikiSidebarComponent/
├── config.js                   # Runtime configuration
├── secrets.js                  # Secret resolution (gitignored)
├── next.config.mjs             # Next.js + Vault bootstrap
└── deploy.sh                   # Synology NAS deploy script
```

## Related Services

- **clock-crew-service** — Backend API for Clock Crew user data
- **lupos-bot** (`:1337`) — Discord bot providing channel/message/member data
