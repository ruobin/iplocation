# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

There is no test suite. TypeScript (`tsc --noEmit`) and ESLint are the primary correctness checks.

## Architecture

A Next.js 16 App Router application. No database, no auth, no additional runtime dependencies.

### Data flow

1. A request hits a **Server Component** (`page.tsx`).
2. The server reads `x-forwarded-for` / `x-real-ip` headers to extract the client IP.
3. `getIPInfo()` in `src/lib/ip-info.ts` fires **two fetches in parallel** — ipinfo.io and ip-api.com — then merges the results. Both responses are cached 60 s via the Next.js Data Cache (`next: { revalidate: 60 }`). Private IPs short-circuit without hitting either API.
4. `parseUserAgent()` (pure, no I/O) extracts browser and OS from the `User-Agent` header.
5. The page renders fully on the server. A `"use client"` component (`client-info.tsx`) hydrates afterward to read browser-only APIs (`navigator`, `screen`, `window`).

### Dual-API merge strategy

`getIPInfo` prefers **ipinfo.io** for city/region/coordinates/timezone (more accurate) and **ip-api.com** for the full country name, ISP, and proxy/hosting/mobile flags. If either source fails, the other covers the missing fields. Set `IPINFO_TOKEN` in the environment to authenticate with ipinfo.io for higher rate limits.

### Route map

| Route | File | Type |
|---|---|---|
| `/` | `src/app/page.tsx` | async Server Component — visitor's own IP |
| `/lookup` | `src/app/lookup/page.tsx` | Server Component — search landing |
| `/lookup/[query]` | `src/app/lookup/[query]/page.tsx` | async Server Component — result for any IP or domain |
| `GET /api/lookup?q=` | `src/app/api/lookup/route.ts` | API Route — returns `IPInfo` JSON |

### Key shared files

- **`src/lib/ip-info.ts`** — all types (`IPInfo`, `BrowserInfo`, `DeviceInfo`), `getIPInfo()`, `parseUserAgent()`, `isPrivateIP()`.
- **`src/app/map-embed.tsx`** — shared OpenStreetMap `<iframe>` component used on both `/` and `/lookup/[query]`.
- **`src/app/client-info.tsx`** — `"use client"` component for Device Details and Privacy & Security sections.

## Styling conventions

Tailwind v4 is used (PostCSS-based — there is no `tailwind.config.js`). All theme tokens are CSS custom properties defined in `globals.css` and exposed to Tailwind via `@theme inline`. Always use the CSS variable names (`var(--bg)`, `var(--surface)`, `var(--border)`, `var(--text)`, `var(--text-muted)`, `var(--accent)`, `var(--accent-glow)`) rather than hard-coded colors. Light/dark mode is handled automatically via `prefers-color-scheme: dark` in `globals.css`.

## Local development note

When running locally, the detected IP will be `127.0.0.1` (a private IP), so all geo fields render `—`. Deploy to a public host or pass a real IP through `x-forwarded-for` to see actual geolocation data.
