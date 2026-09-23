# Clock Crew Client

Community website for the Clock Crew — [clocktopia.com](https://clocktopia.com) (also served at clock-crew.com, canonical clocktopia.com) — celebrating the Newgrounds Flash animation collective and its members.

## Features

- **Home** — live Discord chat (`#general-chat`, `#memes`) beside a browsable Newgrounds portal of Clock Crew movies, games, audio and Clock profiles
- **Members** (`/clocks`) — the forum's member directory, server-rendered, with search and sortable views (`?sort=posts|newest|oldest|alpha`)
- **Member pages** (`/clocks/[username]`) — forum account, Newgrounds profile, submissions, posts, reviews and an AI-written bio, server-rendered with a real 404 for unknown names
- **History** (`/history`) — the long-form history article
- **SEO** — per-page metadata and JSON-LD, sitemap of every member page, robots.txt

## Stack

| Dependency                            | Purpose                                              |
| ------------------------------------- | ---------------------------------------------------- |
| Next.js 16 (App Router, standalone)   | Framework                                            |
| React 19                              | UI                                                   |
| `@rodrigo-barraza/components-library` | Shared components (Discord chat, inputs, indicators) |
| `@rodrigo-barraza/utilities-library`  | Shared utilities, vault client, Next.js proxy helper |
| `react-markdown` + `remark-gfm`       | AI bio rendering (no raw HTML)                       |

## Development

```bash
pnpm install
pnpm dev             # next dev -p 3001
pnpm build           # production build (type-checks with tsc 7)
pnpm start           # serve the build on :3001
pnpm typecheck       # tsc --noEmit
pnpm lint            # oxlint
pnpm test            # vitest
pnpm format          # prettier
pnpm deploy          # deploy-kit → Synology NAS (pnpm deploy:dry to validate)
```

## Configuration

`next.config.ts` fills `process.env` from vault-service at dev and build time; a variable you export yourself wins, so `CLOCK_CREW_SERVICE_URL=http://localhost:5593 pnpm dev` points the site at a local service. The server-side keys below are inlined into the build (see `SERVER_ENV_KEYS`) so the standalone server works even if `boot.js` cannot reach the vault at runtime. They are read only through `src/config.ts`, which is server-only.

| Variable                                               | Used for                                   |
| ------------------------------------------------------ | ------------------------------------------ |
| `CLOCK_CREW_SERVICE_URL`                               | clock-crew-service (members, portal)       |
| `TOOLS_SERVICE_URL`                                    | Archived Discord messages + live stream    |
| `LUPOS_BOT_URL`                                        | Live Discord channels, members, reactions  |
| `CLOCK_CREW_GUILD_ID`                                  | The Clock Crew Discord guild               |
| `MINIO_INTERNAL_URL`                                   | Private media URLs rewritten to /api/media |
| `SESSIONS_SERVICE_URL` / `SESSIONS_SERVICE_PUBLIC_URL` | Session tracking proxy                     |

When the vault is unreachable, export these yourself — derive the values from `vault-service/projects.json`.

## Layout

```
src/
├── app/
│   ├── (wiki)/
│   │   ├── clocks/            # directory (page + client MembersDirectory) and [username] pages
│   │   └── history/
│   ├── api/
│   │   ├── discord/           # channels, emojis, members, messages, react, stream (guild from config only)
│   │   ├── media/             # MinIO proxy — the discord-media bucket only
│   │   ├── newgrounds/        # portal, clocks, years, card → clock-crew-service
│   │   ├── sessions/          # sessions-service proxy
│   │   └── tenor/             # Tenor GIF oEmbed
│   └── components/            # Clock, HistoryTimeline, MemberCard, MemberProfile, NavBar,
│                              # NewgroundsPortal (feed hook + modals), WikiSidebar
├── lib/                       # clock-crew-service client, display helpers, media/tenor rules
├── config.ts                  # server-only settings
├── constants.ts               # site URL, public Discord channels
└── types.ts                   # clock-crew-service response shapes
tests/                         # vitest + Testing Library
```

## Related Services

- **clock-crew-service** (`:5593`) — archive API for forum and Newgrounds data
- **tools-service** (`:5590`) — archived Discord messages and their SSE stream
- **lupos-bot** (`:1337`) — live Discord guild data and reactions
- **sessions-service** (`:5580`) — visitor sessions
