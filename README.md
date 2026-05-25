# IP Lookup

A clean, private, ad-free tool that shows visitors their IP address, geolocation, ISP, browser, OS, and device details in one page. No tracking. No logs stored.

## System Design

```
Browser
  │
  ▼
Next.js Server (App Router)
  │
  ├─ page.tsx (async Server Component)
  │     ├─ reads x-forwarded-for / x-real-ip from request headers
  │     ├─ calls getIPInfo() → ip-api.com REST API
  │     ├─ calls parseUserAgent() (pure, no I/O)
  │     └─ renders static sections: Location, Network, Browser & OS
  │
  └─ client-info.tsx (Client Component, hydrated in browser)
        ├─ reads navigator / screen / window APIs
        └─ renders: Device Details, Privacy & Security
```

### Data flow

| Phase | Where | What happens |
|---|---|---|
| Request arrives | Server | `headers()` extracts the client IP from `x-forwarded-for` (proxies/load-balancers) or `x-real-ip`, falling back to `127.0.0.1` |
| IP lookup | Server | `getIPInfo()` fetches `ip-api.com/json/<ip>` with a 60-second Next.js Data Cache TTL. Private IPs bypass the fetch entirely and return empty values. |
| UA parsing | Server | `parseUserAgent()` regex-matches the `User-Agent` header for browser name/version and OS name/version — no external calls |
| Hydration | Client | `ClientInfoSection` runs after React hydration and reads `navigator`, `screen`, and `window` APIs unavailable on the server |

### Why Server + Client split?

The page is a Next.js **async Server Component** by default. IP and UA data are only available at request time on the server. Device hardware metrics (`screen.width`, `navigator.deviceMemory`, `navigator.connection`) only exist in the browser, so they live in a `"use client"` component that hydrates after the initial paint.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, metadata, OG/Twitter tags
│   ├── page.tsx            # Async Server Component — IP/UA render
│   ├── client-info.tsx     # Client Component — device & privacy sections
│   ├── loading.tsx         # Suspense skeleton shown during SSR fetch
│   ├── error.tsx           # Error boundary for API failures
│   ├── robots.ts           # Generates /robots.txt
│   └── globals.css         # CSS custom properties, Tailwind v4 theme
└── lib/
    └── ip-info.ts          # Types + getIPInfo() + parseUserAgent() + isPrivateIP()
```

## Key Functionalities

### IP Geolocation (`src/lib/ip-info.ts`)

- `getIPInfo(ip, acceptLanguage)` — fetches ip-api.com with `fields=66846719` (city, region, country, ISP, org, timezone, lat/lon, proxy, hosting, mobile flags). Response is cached by the Next.js Data Cache for 60 seconds.
- `isPrivateIP(ip)` — detects RFC-1918 ranges (10.x, 172.16–31.x, 192.168.x), loopback (127.x), link-local (169.254.x), and IPv6 loopback/link-local. Private IPs short-circuit `getIPInfo` without hitting the external API.
- `parseUserAgent(ua)` — pure-function regex parser covering Windows, macOS, iOS, iPadOS, Android, ChromeOS, Linux; Edge, Opera, Brave, Chrome, Safari, Firefox.

### Server Component render (`src/app/page.tsx`)

Reads `x-forwarded-for` and `x-real-ip` headers (set by Vercel / nginx / Cloudflare). Renders three static grid sections: Location (6 fields), Network (3 fields), Browser & OS (3 fields).

### Client Component hydration (`src/app/client-info.tsx`)

After hydration, reads browser-only APIs for Device Details (screen resolution, color depth, pixel ratio, CPU cores, RAM, touch, language, cookies, DNT) and Privacy & Security (proxy/VPN flag from server, hosting flag, mobile flag, `navigator.connection` type and speed, raw user-agent string). Warning badges highlight detected proxy or data-center IPs.

### Theming

CSS custom properties in `globals.css` provide a full light/dark palette (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-glow`) that flip automatically via `prefers-color-scheme: dark`. Tailwind v4 binds to these via `@theme inline`.

## Dependencies

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.6 | Framework — App Router, RSC, Data Cache, file conventions |
| `react` / `react-dom` | 19.2.4 | UI rendering |
| `tailwindcss` | ^4 | Utility CSS (v4 — PostCSS-based, no config file) |
| `@tailwindcss/postcss` | ^4 | PostCSS integration for Tailwind v4 |
| `typescript` | ^5 | Type safety |
| `eslint` + `eslint-config-next` | ^9 / 16.2.6 | Linting |
| **External API** | — | [ip-api.com](https://ip-api.com) — free tier, 45 req/min, HTTP only |

No additional runtime dependencies. No database. No auth.

## Production Considerations

### Security headers (configured in `next.config.ts`)

| Header | Value |
|---|---|
| `X-Frame-Options` | `DENY` — prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` — blocks MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables camera, microphone, geolocation |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Powered-By` | Removed (`poweredByHeader: false`) |

### Rate limits

ip-api.com free tier allows **45 requests/minute**. The Next.js Data Cache (`revalidate: 60`) deduplicates identical IP lookups within a 60-second window on the same server instance. For higher traffic, consider upgrading to the ip-api.com Pro plan or adding a Redis-backed cache layer.

### Private/local IPs

When the detected IP is a private range (local dev, internal network), the API call is skipped entirely and all geo fields display `—`. A notice badge is shown to the user.

### Error handling

- `getIPInfo` wraps the fetch in `try/catch` and returns safe empty defaults on any failure.
- `src/app/error.tsx` (Next.js error boundary) catches unhandled errors from the Server Component and renders a "Try again" recovery UI.
- `src/app/loading.tsx` shows an animated skeleton matching the page layout while the server-side fetch is in-flight.

### SEO

- `src/app/robots.ts` generates `/robots.txt` via Next.js file convention.
- `layout.tsx` exports `metadata` with OpenGraph and Twitter card tags.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The IP shown will be `127.0.0.1` (local) — deploy to a public host to see real geolocation data.

## Deployment

Optimized for [Vercel](https://vercel.com). Set `NEXT_PUBLIC_BASE_URL` to your production domain if you add canonical URL metadata. No environment variables are required for basic operation.

```bash
npm run build
npm run start
```

Vercel and most reverse proxies (nginx, Cloudflare) set `x-forwarded-for` automatically, so IP detection works without any extra configuration.
