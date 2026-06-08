# Exoplanet Hunter

A web app that uses a CNN trained on NASA Kepler's dataset to classify stars as exoplanet hosts or non-hosts from stellar light curves.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `python-backend/app.py` — FastAPI service; loads CNN, serves /predict, /samples, /model-status
- `python-backend/cnn_exoplanets.keras` — Keras CNN model (3197 flux inputs → sigmoid binary output)
- `python-backend/sample_lightcurves.npz` — 570 Kepler light curves with exoplanet labels
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/api-server/src/routes/model.ts` — Express proxy routes to Python backend
- `artifacts/exoplanet-hunter/src/` — React + Vite frontend

## Architecture decisions

- Python FastAPI (port 8000) is NOT exposed via the reverse proxy — Express at `/api` proxies to it using Node's built-in `fetch`
- CNN input normalization happens in Python: zero-mean, unit-variance per sample; pad/truncate to 3197
- Output shape (None, 1) = sigmoid binary; class 1 = exoplanet
- Light curves are downsampled to ~400 points client-side before rendering in Recharts
- Model files loaded via `model_setup.py` path registry (local files only, no HuggingFace Hub)

## Product

- Upload a Kepler light curve (.csv) or click a preloaded sample to get an instant exoplanet prediction
- CNN confidence bar + probability breakdown for EXOPLANET / NON-EXOPLANET
- Light curve rendered as a Recharts line chart
- Rotating fun facts panel about the Kepler mission and exoplanet discovery

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
