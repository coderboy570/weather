# Skyline — a professional full-stack weather app

Skyline is a production-grade weather application. It shows current conditions,
an hourly outlook, and a 7-day forecast for any place on Earth, with every time
displayed in the **location's own time zone**. The browser never talks to the
weather provider directly — a small Node/Express backend proxies it — so **no
API key is ever shipped to the client**.

> **Data integrity:** every value you see comes from the real weather API or a
> clearly-defined transformation of it (unit conversion, rounding, compass
> bearing). The app never invents or fakes weather data.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Why Open-Meteo](#why-open-meteo)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start (STEP 1–10)](#quick-start-step-110)
- [Environment variables](#environment-variables)
- [Do I need an API key?](#do-i-need-an-api-key)
- [NPM scripts](#npm-scripts)
- [Testing](#testing)
- [How the security model works](#how-the-security-model-works)
- [Deployment](#deployment)
- [Switching provider (OpenWeather)](#switching-provider-openweather)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Worldwide location search** with autocomplete — city, state/region, country, and flag, debounced and keyboard-navigable.
- **"Use my location"** via the browser Geolocation API, with friendly permission-denied handling.
- **Current conditions:** temperature, feels-like, condition + icon, humidity, wind speed & direction, gusts, pressure, visibility, UV index (with category), dew point, cloud cover, precipitation, sunrise & sunset.
- **Hourly forecast** for the next 24 hours with precipitation probability, horizontally scrollable.
- **7-day forecast** with high/low range bars and precipitation probability.
- **°C / °F toggle** — persisted, and instant (no re-fetch; raw metric is converted at display time).
- **Dark mode** — follows your system by default, remembers your explicit choice, and paints before first render (no flash).
- **Favorites and recent searches** — persisted in `localStorage`.
- **Subtle weather-aware background** that shifts with the current condition and the location's day/night, while the theme always governs contrast so text stays legible.
- **Timezone-correct throughout** — a live clock shows the selected location's local time, not your computer's.
- **Accessible:** semantic HTML, ARIA combobox for search, keyboard navigation, visible focus states, labelled controls.
- **Resilient UX:** loading skeletons, empty state, and human-readable error messages (never a raw API error).
- Responsive from **320 px to 1920 px** with no horizontal overflow.

## Tech stack

| Layer     | Technology                                                                 |
| --------- | -------------------------------------------------------------------------- |
| Frontend  | React 18, TypeScript, Vite 5, Tailwind CSS 3, lucide-react icons           |
| Backend   | Node.js, Express 4, TypeScript, Zod (validation), Helmet, CORS, rate-limit |
| Data      | [Open-Meteo](https://open-meteo.com) forecast + geocoding APIs             |
| Tests     | Vitest, React Testing Library, Supertest (all external calls mocked)       |
| Tooling   | npm workspaces (monorepo), `concurrently`, `tsx`                           |

## Why Open-Meteo

The brief asked for the provider with the best combination of free-tier
availability, forecast quality, documentation, and worldwide coverage. After
reviewing current provider docs, **Open-Meteo** was chosen because:

- It is **free for non-commercial use and requires no API key**, which removes an entire class of setup friction and secret-leakage risk.
- Its **free tier includes everything this app needs** in a single call: current conditions, hourly data (incl. precipitation probability and UV), and a 7-day daily forecast — features that are limited or split across paid endpoints on some other free tiers.
- It has an **excellent geocoding API** with names, admin regions, country codes, and population for ranking — ideal for worldwide search.
- Endpoints were **verified against the current documentation** at build time (`/v1/forecast` and the `geocoding-api` host), rather than assuming older endpoints still work.

The backend is written behind a provider-agnostic service boundary, so switching
to OpenWeather (which *does* use a key) is a contained change — see
[Switching provider](#switching-provider-openweather). All the key-handling
infrastructure (env vars, `.env.example`, validation) is already in place.

## Project structure

```
weather/
├─ package.json            # workspace root; dev/build/test scripts for both apps
├─ .gitignore              # ignores every .env (keeps secrets out of git)
├─ client/                 # React + Vite frontend
│  ├─ .env.example         # frontend env template (NO secrets — see file)
│  ├─ index.html           # pre-paint theme script + fonts
│  ├─ vite.config.ts       # dev proxy /api -> backend; Vitest config
│  └─ src/
│     ├─ components/        # UI (search, cards, forecasts, states…)
│     ├─ hooks/             # theme, units, weather, geolocation, search, favorites…
│     ├─ lib/               # pure helpers: format, scenes, places, storage, icons
│     ├─ services/          # weatherApi.ts — talks ONLY to our backend
│     ├─ types/             # shared response contract (mirrors backend)
│     └─ test/              # Vitest setup + shared fixtures
└─ server/                 # Node + Express backend
   ├─ .env.example         # backend env template
   └─ src/
      ├─ app.ts             # Express app factory (helmet, cors, rate limit, routes)
      ├─ server.ts          # starts the listener
      ├─ config/env.ts      # Zod-validated environment
      ├─ routes/            # /api/weather, /api/weather/current, /forecast, /api/geo/search
      ├─ controllers/       # request handlers
      ├─ services/          # openMeteoClient + normalize + weatherService
      ├─ middleware/         # validation, rate limiting, error handling
      ├─ utils/             # cache, AppError, weather-code mapping, logger
      └─ __tests__/          # Supertest + service tests (mocked upstream)
```

## Prerequisites

- **Node.js 18.18+** (Node 20 LTS recommended). Check with `node -v`.
- **npm 9+** (ships with modern Node). Check with `npm -v`.

## Quick start (STEP 1–10)

These steps assume you have this folder open in a terminal. Copy/paste each line.

```bash
# STEP 1 — Go into the project folder
cd weather

# STEP 2 — Install all dependencies for BOTH apps at once (npm workspaces)
npm install

# STEP 3 — Create the backend env file from the template
#   macOS/Linux:
cp server/.env.example server/.env
#   Windows (PowerShell):
#   Copy-Item server/.env.example server/.env

# STEP 4 — (Optional) create the frontend env file. Not required for local dev.
#   cp client/.env.example client/.env

# STEP 5 — Do you need an API key? NO. Open-Meteo needs none, so there is
#          nothing to paste. (If you ever switch to OpenWeather, see below.)

# STEP 6 — Start BOTH the backend and frontend together (hot-reload)
npm run dev

# STEP 7 — Open the app in your browser
#   Frontend:  http://localhost:5173
#   Backend health check: http://localhost:5000/api/health

# STEP 8 — Try it: search a city, click "Use my location", toggle °C/°F and dark mode.

# STEP 9 — Run the automated tests (all external calls are mocked)
npm test

# STEP 10 — Build the production bundles and preview
npm run build
npm start          # serves the built API (and the built client if present) on :5000
```

That's it. If something doesn't work, see [Troubleshooting](#troubleshooting).

## Environment variables

### Backend (`server/.env`) — copy from `server/.env.example`

| Variable                    | Default                                             | Purpose                                             |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `PORT`                      | `5000`                                              | Port the API listens on                             |
| `NODE_ENV`                  | `development`                                        | `development` / `production` / `test`               |
| `ALLOWED_ORIGINS`           | `http://localhost:5173,http://127.0.0.1:5173`        | Comma-separated CORS allow-list                     |
| `WEATHER_CACHE_TTL_SECONDS` | `300`                                               | In-memory cache TTL for weather responses           |
| `GEO_CACHE_TTL_SECONDS`     | `86400`                                             | In-memory cache TTL for geocoding lookups           |
| `RATE_LIMIT_WINDOW_MS`      | `60000`                                             | Rate-limit window                                   |
| `RATE_LIMIT_MAX`            | `120`                                               | Max requests per IP per window                      |
| `UPSTREAM_TIMEOUT_MS`       | `10000`                                             | Timeout for outbound provider calls                 |
| `OPEN_METEO_FORECAST_URL`   | `https://api.open-meteo.com/v1/forecast`            | Forecast endpoint (rarely changed)                  |
| `OPEN_METEO_GEOCODING_URL`  | `https://geocoding-api.open-meteo.com/v1/search`    | Geocoding endpoint (rarely changed)                 |
| `OPENWEATHER_API_KEY`       | *(unset)*                                            | **Only** if you switch to OpenWeather               |

Every variable has a safe default, so the backend boots even with an empty
`.env`.

### Frontend (`client/.env`) — copy from `client/.env.example`

The frontend has **no secrets**. Anything in a Vite env prefixed with `VITE_`
is embedded into the public bundle, so a weather key must never live here.

| Variable             | When you need it                                                                        |
| -------------------- | --------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | Production only — the public URL of your deployed backend (e.g. `https://api.example.com`). Leave empty for local dev (the Vite proxy handles `/api`). |
| `VITE_PROXY_TARGET`  | Optional — override the dev proxy target (defaults to `http://localhost:5000`).          |

## Do I need an API key?

**No.** Skyline uses Open-Meteo, which is free and keyless for non-commercial
use. There is nothing to paste anywhere to run the app.

**If you switch to OpenWeather** (see below), the key goes in exactly one place:

```
server/.env      →      OPENWEATHER_API_KEY=your_key_here
```

It must **never** go into the `client/` folder, any `VITE_` variable, the HTML,
the JavaScript bundle, or a committed file. `.gitignore` already excludes every
`.env` file to prevent accidental commits.

## NPM scripts

Run these from the repository root:

| Command             | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Runs backend + frontend together with hot-reload                    |
| `npm run dev:server`| Backend only (`tsx watch`) on `:5000`                               |
| `npm run dev:client`| Frontend only (Vite) on `:5173`                                     |
| `npm run build`     | Type-checks and builds both apps for production                     |
| `npm start`         | Runs the built backend (serves the built client too, if present)    |
| `npm test`          | Runs the full backend + frontend test suites                        |
| `npm run test:server` / `npm run test:client` | Run one side's tests                       |
| `npm run typecheck` | Type-checks both apps without emitting                              |

## Testing

- **Backend:** Vitest + Supertest. The Open-Meteo client is mocked, so tests are
  deterministic and require no network. Covers normalization (WMO codes, units,
  timezone handling), the service layer, caching, and every route (success +
  validation + error paths).
- **Frontend:** Vitest + React Testing Library (jsdom). Covers unit conversions,
  **timezone-correct formatting**, scene mapping, icon mapping, storage,
  favorites/recents/debounce/theme/units hooks, the API service (fetch mocked),
  and components (search debounce & keyboard nav, unit toggle, current-weather
  card, error/empty states).

```bash
npm test              # everything
npm run test:client   # frontend only
npm run test:server   # backend only
```

## How the security model works

1. The **browser only ever calls our backend** (`/api/...`). It has no knowledge of the weather provider.
2. In **development**, Vite proxies `/api` to the Express server (see `vite.config.ts`), so there are no CORS issues and no provider URL in the client.
3. In **production**, you set `VITE_API_BASE_URL` to your backend's public origin; the client calls that, and the backend calls the provider.
4. The backend applies **Helmet** (secure headers), a **CORS allow-list**, **per-IP rate limiting**, **request-body size limits**, and **Zod input validation**. Provider/internal errors are **sanitized** into friendly, non-leaking messages before reaching the client.
5. Because Open-Meteo is keyless, there is **no secret in this project at all** by default — the strongest possible version of "the key never reaches the client."

## Deployment

Skyline deploys as two services: the **backend** (a Node web service) and the
**frontend** (a static site). Do **not** deploy to production until you've
decided on hosts — the steps below are a reference.

### Backend → Render (or Railway / Fly.io)

1. Push the repo to GitHub.
2. On [Render](https://render.com): **New → Web Service**, point it at the repo.
3. Settings:
   - **Root directory:** `server`
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
4. Environment variables: set `NODE_ENV=production` and
   `ALLOWED_ORIGINS=https://your-frontend-domain` (your deployed frontend URL).
   Leave the Open-Meteo URLs at their defaults.
5. Deploy, then confirm `https://your-backend.onrender.com/api/health` returns `{"status":"ok"}`.

### Frontend → Vercel (or Netlify)

1. On [Vercel](https://vercel.com): **New Project → import the repo**.
2. Settings:
   - **Root directory:** `client`
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`.
4. Deploy. Then update the backend's `ALLOWED_ORIGINS` to include the Vercel URL and redeploy the backend.

### Alternative: single-service deploy

`server/app.ts` will automatically serve `client/dist` if it exists. So you can
run `npm run build` and deploy just the backend to serve both the API and the
static client from one origin (no `VITE_API_BASE_URL` needed).

## Switching provider (OpenWeather)

The backend isolates all provider specifics in
`server/src/services/openMeteoClient.ts` and `normalize.ts`. To switch:

1. Add your key to `server/.env`: `OPENWEATHER_API_KEY=...` (and, if you add the
   switch, `WEATHER_PROVIDER=openweather`).
2. Implement an `openWeatherClient.ts` that fetches One Call / geocoding, and a
   normalizer that maps OpenWeather's fields + condition codes into the existing
   `WeatherResponse` contract in `server/src/types/weather.types.ts`.
3. Have `weatherService.ts` select the client based on `WEATHER_PROVIDER`.

Because the frontend depends only on the normalized contract, **no frontend
changes are required**.

## Troubleshooting

- **Port already in use (`EADDRINUSE`):** something is on `:5000` or `:5173`. Stop it, or change `PORT` in `server/.env` (and `VITE_PROXY_TARGET` if you change the backend port).
- **CORS error in the browser console:** add your frontend origin to `ALLOWED_ORIGINS` in `server/.env` and restart the backend.
- **Search returns nothing:** you need at least 2 characters. Add a country to disambiguate, e.g. `Paris, US`.
- **"Use my location" does nothing:** the browser blocks geolocation on insecure origins and when permission is denied. `localhost` is treated as secure; in production the site must be HTTPS.
- **Frontend loads but data calls fail:** confirm the backend is running (`/api/health`) and, in production, that `VITE_API_BASE_URL` points to it.
- **`npm install` warnings about engines:** ensure Node is 18.18+ (`node -v`).

---

Weather data by [Open-Meteo](https://open-meteo.com). Built with React, Vite,
Tailwind, Node, and Express.
