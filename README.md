Dust2Farm

**From Earth Observation to Smarter Agriculture.**

Dust2Farm is a precision-agriculture platform prototype for exploring farm conditions, field zones, sensor readings, irrigation context, and vegetation health. It includes a multi-page Next.js workspace, an interactive Three.js parcel model, and a small FastAPI service.

> **Data notice:** The original farm workspace still uses illustrative readings. The new Dakhla page reads bundled historical IMERG, MERRA-2, and PT-JPL ETa data through the FastAPI backend; it is not a live satellite or sensor feed.

## Run the full demo locally

Requirements: Node.js 20.9 or later and Python 3.10 or later. Run the frontend and backend in two separate terminals from the repository root.

### One-time setup

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
deactivate
```

### Terminal 1 — FastAPI backend

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API runs at [http://127.0.0.1:8000](http://127.0.0.1:8000); interactive documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Terminal 2 — Next.js frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), choose **Continue in demo mode**, then open **Dakhla · NASA data** in the left navigation. The email and password fields are not submitted or verified; the app creates a browser-local demo session only. It is not real authentication and does not protect server-side data.

### Workspace pages

- `/` — focused farm overview and key conditions.
- `/farm` — full-page 3D terrain; drag to orbit, scroll to zoom, click a zone, toggle sensor/infrastructure visibility, or animate sample water flow.
- `/sensors` — searchable and filterable sensor registry with sample measurement history and maintenance details.
- `/irrigation` — sample zone schedules, local-only simulated start/pause controls, and water-use history.
- `/maintenance` — sample maintenance queue with local task status updates.
- `/alerts` — filter, acknowledge, resolve, and reopen sample alerts.
- `/settings` — local display and notification preferences.

Route transitions and 3D scene setup use branded loading states. All values, device statuses, recommendations, sensor history, and maintenance records are illustrative; control interactions do not actuate hardware.

## Backend API

The FastAPI app is `backend.main:app`. Start it from the repository root so Python can resolve the `backend` package. The original `/api/overview`, `/api/zones`, and `/api/readings` routes serve typed sample farm responses; `/health` is a lightweight health check.

For the local browser-to-API connection, the dashboard defaults to `http://127.0.0.1:8000`. Copy `.env.example` to `.env.local` to override `NEXT_PUBLIC_API_BASE_URL`. If the frontend uses a different host, set `DUST2FARM_CORS_ORIGINS` on the API to a comma-separated list of exact frontend origins.

### Dakhla data endpoints

The `/dakhla` page calls the local API and displays historical rainfall, weather context, ETa, and explainable risk indicators. Run the API and Next.js dashboard in separate terminals. The API includes:

- `GET /api/dakhla/summary` — parcel metadata, source notes, rainfall totals, and ETa summary.
- `GET /api/dakhla/series?start_date=2026-01-01&end_date=2026-05-31` — daily IMERG rainfall and MERRA-2 context.
- `GET /api/dakhla/field` — Dakhla Field01 boundary as GeoJSON.
- `GET /api/dakhla/analyze?date=2026-05-31` — dated risk assessment with missing measurements called out.
- `POST /api/dakhla/analyze` — same assessment with optional same-day `field` measurements and `anomaly` drivers.

Example API calls:

```bash
curl -s http://127.0.0.1:8000/api/dakhla/summary | python3 -m json.tool
curl -s 'http://127.0.0.1:8000/api/dakhla/analyze?date=2026-05-31' | python3 -m json.tool
```

To include field readings in an assessment, send a POST request. Replace the illustrative flow and pressure values with measurements from the same irrigation cycle:

```bash
curl -s -X POST http://127.0.0.1:8000/api/dakhla/analyze \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-05-31","field":{"irrigation_active":true,"flow_lph":120,"expected_flow_lph":100,"pressure_end_bar":1.1,"expected_pressure_end_bar":1.5}}' \
  | python3 -m json.tool
```

The bundled Dakhla rainfall is GPM IMERG Late V07 on a 0.1° grid; ETa is a historical 10 m map dated 2026-05-31. No field sensor labels or soil/pipe inspections are bundled, so the API leaves those risk classes undetermined until measurements are supplied. Other dashboard pages continue to show the original sample farm.

Demo data for ET and NDVI and LSWI:


https://github.com/user-attachments/assets/a9b4b121-39e3-499d-8722-7da42772581c



Uploading ET_and_ET0_daily_Dakhla_Field01.mp4…



## Current scope and limitations

- Responsive overview, full-page farm visualization, sensors, irrigation, maintenance, alerts, and settings routes.
- Terrain-based Three.js parcel with moisture-colored zones, crop rows, irrigation pipes, animated demo water flow, a reservoir, and selectable sensor markers.
- Explicit browser-local demo-session architecture; real credential authentication is not configured.
- FastAPI/Pydantic demo endpoint contracts for overview, zones, and readings.

Live provider integrations, persistent PostgreSQL/PostGIS storage, server-side authentication, and irrigation control are not implemented. Demo settings and page actions are browser-local/in-memory. Recommendations are informational and should be validated against local agronomic guidance before operational use.

