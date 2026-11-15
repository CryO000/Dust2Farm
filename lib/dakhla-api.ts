const API_BASE = process.env.NEXT_PUBLIC_API_HOST
  ? `https://${process.env.NEXT_PUBLIC_API_HOST}`
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

export type DakhlaDailyRecord = {
  date: string;
  rain_mm: number | null;
  rain_source: string | null;
  rain_granule_version: string | null;
  rain_grid_cell: { lon: number; lat: number; resolution_deg: number } | null;
  wind_ms: number | null;
  wind_max_ms: number | null;
  et0_mm: number | null;
  eta_mm: number | null;
  air_temp_c: number | null;
  rh_day_pct: number | null;
  rh_night_pct: number | null;
}

export type DakhlaSummary = {
  parcel: { name: string; area_ha: number; latitude: number; longitude: number; zone_method: string };
  period: { start: string; end: string; days: number };
  rainfall: {
    source: string;
    total_mm: number;
    days_with_rain: number;
    grid_cell: { lon: number; lat: number; resolution_deg: number } | null;
    spatial_note: string;
  };
  weather_source: string;
  evapotranspiration: {
    source: string;
    date: string;
    unit: string;
    resolution_m: number;
    valid_pixels: number;
    zone_values: Array<{ zone_id: string; value: number; coverage_fraction: number; pixel_count: number }>;
    interpretation: string;
  };
  field_measurements_available: boolean;
  missing_field_data: string[];
}

export type DakhlaRisk = { status: string; evidence?: Record<string, unknown>; missing?: string[]; action?: string };
export type DakhlaAnalysis = {
  date: string;
  precipitation_mm: number | null;
  precipitation_source: string | null;
  weather: Record<string, number | null>;
  risk_assessment: Record<string, DakhlaRisk>;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { cache: "no-store", signal });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API ${response.status}: ${detail || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function getDakhlaSummary(signal?: AbortSignal) {
  return getJson<DakhlaSummary>("/api/dakhla/summary", signal);
}

export function getDakhlaSeries(signal?: AbortSignal) {
  return getJson<{ count: number; rows: DakhlaDailyRecord[] }>("/api/dakhla/series", signal);
}

export function getDakhlaAnalysis(day: string, signal?: AbortSignal) {
  return getJson<DakhlaAnalysis>(`/api/dakhla/analyze?date=${encodeURIComponent(day)}`, signal);
}
