# Dust2Farm

**From Earth Observation to Smarter Agriculture.**

Dust2Farm is a precision-agriculture platform prototype for exploring farm conditions, field zones, sensor readings, irrigation context, and vegetation health. It includes a multi-page Next.js workspace, an interactive Three.js parcel model, and a small FastAPI service.

> **Data notice:** The current readings and satellite-pass details are illustrative demo data. No live sensor, NASA Earth observation, or weather provider is connected yet.

## Run the dashboard

Requirements: Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Continue in demo mode** on the login screen. The email and password fields are not submitted or verified; the app creates a browser-local demo session only. It is not real authentication and does not protect server-side data.

### Workspace pages

- `/` — focused farm overview and key conditions.
- `/farm` — full-page 3D terrain; drag to orbit, scroll to zoom, click a zone, toggle sensor/infrastructure visibility, or animate sample water flow.
- `/sensors` — searchable and filterable sensor registry with sample measurement history and maintenance details.
- `/irrigation` — sample zone schedules, local-only simulated start/pause controls, and water-use history.
- `/maintenance` — sample maintenance queue with local task status updates.
- `/alerts` — filter, acknowledge, resolve, and reopen sample alerts.
- `/settings` — local display and notification preferences.

Route transitions and 3D scene setup use branded loading states. All values, device statuses, recommendations, sensor history, and maintenance records are illustrative; control interactions do not actuate hardware.

## Run the API

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs). The API currently serves typed demo responses at `/api/overview`, `/api/zones`, and `/api/readings`; `/health` is a lightweight health check.

## Current scope and limitations

- Responsive overview, full-page farm visualization, sensors, irrigation, maintenance, alerts, and settings routes.
- Terrain-based Three.js parcel with moisture-colored zones, crop rows, irrigation pipes, animated demo water flow, a reservoir, and selectable sensor markers.
- Explicit browser-local demo-session architecture; real credential authentication is not configured.
- FastAPI/Pydantic demo endpoint contracts for overview, zones, and readings.

Live provider integrations, persistent PostgreSQL/PostGIS storage, server-side authentication, and irrigation control are not implemented. Demo settings and page actions are browser-local/in-memory. Recommendations are informational and should be validated against local agronomic guidance before operational use.
