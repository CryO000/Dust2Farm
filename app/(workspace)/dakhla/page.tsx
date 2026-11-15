"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CloudRain, Leaf, MapPin, Satellite, Wind } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageIntro, StatCard, StatusTag } from "@/components/platform-ui";
import {
  getDakhlaAnalysis,
  getDakhlaSeries,
  getDakhlaSummary,
  type DakhlaAnalysis,
  type DakhlaDailyRecord,
  type DakhlaSummary,
} from "@/lib/dakhla-api";

const riskLabels: Record<string, string> = {
  tomato_air_rh: "Humidité de l’air pour tomates",
  fuite: "Signature de fuite",
  erosion: "Érosion",
  salinite_sol: "Salinité du sol",
  colmatage_boue: "Colmatage par solides / boue",
  colmatage_sel: "Colmatage minéral lié au sel",
};

function displayStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function DakhlaPage() {
  const [summary, setSummary] = useState<DakhlaSummary | null>(null);
  const [rows, setRows] = useState<DakhlaDailyRecord[]>([]);
  const [analysis, setAnalysis] = useState<DakhlaAnalysis | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getDakhlaSummary(controller.signal), getDakhlaSeries(controller.signal)])
      .then(([nextSummary, result]) => {
        setSummary(nextSummary);
        setRows(result.rows);
        setSelectedDate(nextSummary.period.end);
        setApiError("");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setApiError(error instanceof Error ? error.message : "API inaccessible");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const controller = new AbortController();
    getDakhlaAnalysis(selectedDate, controller.signal)
      .then(setAnalysis)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setApiError(error instanceof Error ? error.message : "Analyse indisponible");
      });
    return () => controller.abort();
  }, [selectedDate]);

  const chartData = useMemo(() => rows.map((row) => ({
    day: row.date.slice(5),
    rain: row.rain_mm ?? 0,
  })), [rows]);

  return (
    <div className="workspace-content dakhla-page">
      <PageIntro
        eyebrow="HYDROSAT · API DAKHLA"
        title={<>Dakhla Field01, <em>field signals.</em></>}
        description="Historical NASA IMERG rainfall, MERRA-2 weather context, PT-JPL ETa, and explainable field-risk outputs from the connected FastAPI backend."
        actions={<span className="location-chip"><MapPin size={14} /> 23.683° N · 15.712° W</span>}
      />

      <div className={`dakhla-api-banner ${apiError ? "error" : summary ? "connected" : ""}`}>
        <span className="dakhla-api-dot" />
        <div>
          <strong>{apiError ? "API not connected" : loading ? "Connecting to API…" : "Dust2Farm API connected"}</strong>
          <small>{apiError || (summary ? `${summary.period.days} historical daily records · ${summary.rainfall.source}` : "Waiting for the backend")}</small>
        </div>
        {apiError && <span className="dakhla-api-hint">Start FastAPI on port 8000</span>}
      </div>

      {summary && (
        <>
          <section className="stats-grid dakhla-stats" aria-label="Dakhla data summary">
            <StatCard label="Parcel area" value={summary.parcel.area_ha.toFixed(2)} unit="ha" note="Dakhla Field01 boundary" icon={<MapPin size={17} />} />
            <StatCard label="IMERG rain total" value={summary.rainfall.total_mm.toFixed(2)} unit="mm" note={`${summary.rainfall.days_with_rain} rainy days · ${summary.period.start} to ${summary.period.end}`} icon={<CloudRain size={17} />} tone="blue" />
            <StatCard label="Observed ETa" value={String(summary.evapotranspiration.valid_pixels)} unit="pixels" note={`${summary.evapotranspiration.date} · ${summary.evapotranspiration.resolution_m} m raster`} icon={<Leaf size={17} />} tone="violet" />
            <StatCard label="Risk assessment date" value={selectedDate || "—"} note="Select a date to refresh the API assessment" icon={<AlertTriangle size={17} />} tone="amber" />
          </section>

          <section className="dakhla-dashboard-grid">
            <article className="workspace-panel dakhla-chart-panel">
              <div className="panel-title-row">
                <div><span className="panel-kicker">NASA GPM IMERG LATE · DAILY</span><h2>Rainfall series</h2><p>Satellite estimate at the nearest 0.1° grid cell, not a parcel rain gauge.</p></div>
                <StatusTag tone="blue">Historical · V07</StatusTag>
              </div>
              <div className="dakhla-chart">
                {chartData.length > 0 && <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
                    <CartesianGrid vertical={false} stroke="#edf0eb" strokeDasharray="3 5" />
                    <XAxis dataKey="day" interval={20} tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 9 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 9 }} tickFormatter={(value: number) => `${value}`} />
                    <Tooltip formatter={(value) => [`${value} mm/day`, "IMERG rainfall"]} />
                    <Bar dataKey="rain" fill="#6d9da5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>}
              </div>
              <div className="dakhla-source-note"><Satellite size={14} /> Grid cell center: {summary.rainfall.grid_cell?.lat.toFixed(2)}° N, {Math.abs(summary.rainfall.grid_cell?.lon ?? 0).toFixed(2)}° W · 0.1° resolution</div>
            </article>

            <article className="workspace-panel dakhla-eta-panel">
              <div className="panel-title-row"><div><span className="panel-kicker">PT-JPL · OBSERVED</span><h2>ETa by demo zone</h2><p>{summary.evapotranspiration.interpretation}</p></div></div>
              <div className="dakhla-eta-list">{summary.evapotranspiration.zone_values.map((zone) => (
                <div className="dakhla-eta-row" key={zone.zone_id}>
                  <span><i />{zone.zone_id}</span><strong>{zone.value.toFixed(2)} <small>mm/day</small></strong>
                  <small>{zone.pixel_count.toLocaleString()} pixels</small>
                </div>
              ))}</div>
              <p className="dakhla-method-note">The three north–center–south bands are demo zones, not measured irrigation boundaries.</p>
            </article>
          </section>

          <section className="workspace-panel dakhla-risks-panel">
            <div className="dakhla-risk-heading">
              <div><span className="panel-kicker">EXPLAINABLE ANALYSIS VIA API</span><h2>Risk indicators</h2><p>Historical weather context is joined with optional same-day field measurements.</p></div>
              <label className="dakhla-date-select">Analysis date
                <input type="date" min={summary.period.start} max={summary.period.end} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
            </div>
            {analysis && <div className="dakhla-risk-grid">{Object.entries(analysis.risk_assessment).map(([key, risk]) => (
              <article className="dakhla-risk-card" key={key}>
                <div><strong>{riskLabels[key] ?? key}</strong><StatusTag tone={risk.status === "indetermine" ? "amber" : risk.status.includes("inspect") || risk.status.includes("alerte") ? "red" : "blue"}>{displayStatus(risk.status)}</StatusTag></div>
                <p>{risk.action ?? "See the evidence and measurements listed by the API."}</p>
                {(risk.missing ?? []).length > 0 && <small>Missing: {risk.missing?.join(", ")}</small>}
              </article>
            ))}</div>}
          </section>

          <div className="dakhla-limits-note"><Wind size={15} /><span>{summary.rainfall.spatial_note} Air humidity, pipe flow/pressure, soil ECe, and erosion inspections are not present in the current package, so related risks remain undetermined.</span></div>
        </>
      )}
    </div>
  );
}
