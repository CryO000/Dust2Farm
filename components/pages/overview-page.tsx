"use client";

import {
  Activity,
  ArrowRight,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  Radio,
  Satellite,
  Thermometer,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoNotice, PageIntro, StatCard, StatusTag } from "@/components/platform-ui";
import { moistureSeries, zones } from "@/lib/field-data";
import { sensors } from "@/lib/operations-data";

export default function OverviewPage() {
  const [range, setRange] = useState("7 days");
  const onlineCount = sensors.filter((sensor) => sensor.status === "Online").length;
  const totalArea = zones.reduce((sum, zone) => sum + zone.acres, 0).toFixed(1);

  return (
    <div className="workspace-content">
      <PageIntro
        eyebrow="SUNDAY, NOVEMBER 15, 2026, FARM OVERVIEW"
        title={<>Farm overview</>}
        description="Current field conditions and operations at Hawthorne Farm."
        actions={<span className="location-chip"><MapPin size={14} /> Morocco, Dakhla</span>}
      />
      <DemoNotice>Sample readings and recommendations. No live sensors or satellite feeds are connected.</DemoNotice>

      <section className="stats-grid overview-stats" aria-label="Farm overview">
        <StatCard label="Total farm area" value={totalArea} unit="acres" note="4 managed field zones" icon={<MapPin size={17} />} />
        <StatCard label="Average soil moisture" value="30" unit="%" note="Target range: 25-35%" icon={<Droplets size={17} />} tone="blue" />
        <StatCard label="Air conditions" value="23°" unit="C, 62% RH" note="Partly cloudy, light breeze" icon={<CloudSun size={17} />} tone="amber" />
        <StatCard label="Crop health" value="86" unit="/ 100" note="Illustrative Sentinel-2 NDVI" icon={<Leaf size={17} />} tone="violet" />
      </section>

      <section className="overview-primary-grid">
        <article className="workspace-panel overview-chart-panel">
          <div className="panel-title-row">
            <div><span className="panel-kicker">FIELD CONDITIONS</span><h2>Soil moisture trend</h2><p>Farm-wide sensor average over the last {range.toLowerCase()}.</p></div>
            <select className="filter-select compact-select" value={range} onChange={(event) => setRange(event.target.value)} aria-label="Chart time range">
              <option>7 days</option><option>30 days</option>
            </select>
          </div>
          <div className="overview-chart-summary"><strong>30%</strong><StatusTag tone="blue">Within target</StatusTag><span>Target 25-35%</span></div>
          <div className="overview-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moistureSeries} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
                <defs><linearGradient id="overviewMoisture" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#388568" stopOpacity={0.19} /><stop offset="95%" stopColor="#388568" stopOpacity={0.01} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#f0eeeb" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 10 }} dy={8} />
                <YAxis domain={[10, 40]} tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 10 }} tickFormatter={(value: number) => `${value}%`} />
                <Tooltip contentStyle={{ border: "1px solid #e8ebe6", borderRadius: 10, fontSize: 12 }} formatter={(value) => [`${value}%`, "Moisture"]} />
                <Area type="monotone" dataKey="target" stroke="#c5cec5" strokeWidth={1.5} fill="none" dot={false} />
                <Area type="monotone" dataKey="moisture" stroke="#37876a" strokeWidth={2.5} fill="url(#overviewMoisture)" activeDot={{ r: 4, fill: "#37876a", stroke: "white", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footnote"><span><i className="chart-key-line" />Farm average</span><span><i className="chart-key-dash" />Target range midpoint</span><Link href="/sensors">View sensor history <ArrowRight size={13} /></Link></div>
        </article>

        <article className="workspace-panel overview-alert-card">
          <div className="panel-title-row">
            <div><span className="panel-kicker">NEEDS YOUR ATTENTION</span><h2>South Field is drying out</h2></div>
            <span className="priority-pill high">HIGH</span>
          </div>
          <div className="alert-feature-metric"><Droplets size={20} /><strong>19<span>%</span></strong><small>soil moisture</small></div>
          <p>Current readings are below the preferred range. Review the irrigation recommendation and sensor status before acting.</p>
          <div className="alert-card-meta"><span><Radio size={14} /> Sensor S-112, battery 34%</span><StatusTag tone="amber">Review suggested</StatusTag></div>
          <Link className="primary-link-button" href="/alerts">Review alerts and recommendations <ArrowRight size={15} /></Link>
        </article>
      </section>

      <section className="overview-bottom-grid">
        <article className="workspace-panel zone-overview">
          <div className="panel-title-row">
            <div><span className="panel-kicker">FIELD SNAPSHOT</span><h2>Your four zones</h2></div>
            <Link className="quiet-link" href="/farm">Open 3D farm <ArrowRight size={13} /></Link>
          </div>
          <div className="zone-snapshot-list">{zones.map((zone) => (
            <Link key={zone.id} className="zone-snapshot" href="/farm">
              <i style={{ backgroundColor: zone.color }} />
              <span className="zone-snapshot-name"><strong>{zone.name}</strong><small>{zone.crop}</small></span>
              <span className="zone-snapshot-moisture"><strong>{zone.moisture}%</strong><small>moisture</small></span>
              <StatusTag tone={zone.irrigation === "Needs water" ? "amber" : zone.irrigation === "Scheduled" ? "blue" : "green"}>{zone.irrigation}</StatusTag>
            </Link>
          ))}</div>
        </article>
        <article className="workspace-panel readiness-panel">
          <div><span className="panel-kicker">FARM READINESS</span><h2>Systems at a glance</h2></div>
          <div className="readiness-row"><span><Radio size={16} /> Sensors online</span><strong>{onlineCount} <small>/ {sensors.length}</small></strong></div>
          <div className="readiness-row"><span><Droplets size={16} /> Irrigation zones</span><StatusTag tone="amber">1 needs review</StatusTag></div>
          <div className="readiness-row"><span><Activity size={16} /> Water used today</span><strong>3.6 <small>ac-ft</small></strong></div>
          <div className="readiness-row"><span><Thermometer size={16} /> Soil temperature</span><strong>22.7 <small>°C avg.</small></strong></div>
          <Link className="quiet-link readiness-link" href="/sensors">Review all monitoring data <ArrowRight size={13} /></Link>
        </article>
      </section>
      <footer className="workspace-footer"><span>Dust2Farm, farm monitoring</span><span><Satellite size={13} /> Satellite imagery is illustrative demo data</span></footer>
    </div>
  );
}
