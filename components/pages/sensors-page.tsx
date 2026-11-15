"use client";

import { useMemo, useState } from "react";
import { Battery, BatteryWarning, CalendarClock, Radio, Search, Signal, Thermometer, Waves } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoNotice, PageIntro, StatCard, StatusTag } from "@/components/platform-ui";
import { sensorHistory, sensors, type FarmSensor, type SensorStatus } from "@/lib/operations-data";

const sensorIcon = (type: FarmSensor["type"]) => type === "Air station" ? <Waves size={16} /> : type === "Soil temperature" ? <Thermometer size={16} /> : <Radio size={16} />;
const statusTone = (status: SensorStatus) => status === "Online" ? "green" : status === "Attention" ? "amber" : "red";

export default function SensorsPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedId, setSelectedId] = useState(sensors[2].id);
  const filteredSensors = useMemo(() => sensors.filter((sensor) => {
    const matchesText = `${sensor.id} ${sensor.type} ${sensor.location}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === "All types" || sensor.type === typeFilter;
    const matchesStatus = statusFilter === "All statuses" || sensor.status === statusFilter;
    return matchesText && matchesType && matchesStatus;
  }), [query, typeFilter, statusFilter]);
  const selectedSensor = sensors.find((sensor) => sensor.id === selectedId) ?? sensors[0];
  const onlineCount = sensors.filter((sensor) => sensor.status === "Online").length;
  const lowBatteryCount = sensors.filter((sensor) => sensor.battery !== null && sensor.battery > 0 && sensor.battery < 40).length;
  const historyValues =
    selectedSensor.type === "Air station"
      ? [56, 58, 60, 62, 64, 61, 62]
      : selectedSensor.type === "Soil temperature"
        ? [22.9, 23.2, 24, 24.3, 25.1, 25, 25.1]
        : sensorHistory.map((reading) => Number(selectedSensor.latest) + reading.value - 19);
  const measurementHistory = sensorHistory.map((reading, index) => ({
    day: reading.day,
    value: historyValues[index],
  }));
  const measurementName =
    selectedSensor.type === "Air station"
      ? "Relative humidity"
      : selectedSensor.type === "Soil temperature"
        ? "Temperature"
        : "Soil moisture";

  return (
    <div className="workspace-content">
      <PageIntro eyebrow="FARM WORKSPACE · MONITORING" title={<>Sensors & <em>monitoring.</em></>} description="Review device health, recent measurements, and maintenance windows." />
      <DemoNotice>Sensor values, connection states, battery levels, and maintenance dates are sample data.</DemoNotice>
      <section className="stats-grid three-stats">
        <StatCard label="Registered sensors" value={String(sensors.length)} note="Across all monitored areas" icon={<Radio size={17} />} />
        <StatCard label="Online now" value={String(onlineCount)} unit={`/ ${sensors.length}`} note="Sample device status" icon={<Signal size={17} />} tone="blue" />
        <StatCard label="Needs attention" value={String(sensors.length - onlineCount)} note={`${lowBatteryCount} low battery · 1 offline`} icon={<BatteryWarning size={17} />} tone="amber" />
      </section>

      <section className="sensor-layout-grid">
        <article className="workspace-panel data-table-panel">
          <div className="table-panel-heading">
            <div><span className="panel-kicker">DEVICE REGISTRY</span><h2>Farm sensors <small>{filteredSensors.length} devices</small></h2></div>
            <div className="table-filters">
              <label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sensors" aria-label="Search sensors" /></label>
              <select className="filter-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by sensor type">
                <option>All types</option><option>Soil moisture</option><option>Soil temperature</option><option>Air station</option>
              </select>
              <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by connection status">
                <option>All statuses</option><option>Online</option><option>Attention</option><option>Offline</option>
              </select>
            </div>
          </div>
          <div className="responsive-table-wrap">
            <table className="management-table sensor-table">
              <thead><tr><th>SENSOR</th><th>TYPE / LOCATION</th><th>LATEST READING</th><th>BATTERY</th><th>CONNECTION</th><th>NEXT SERVICE</th></tr></thead>
              <tbody>{filteredSensors.map((sensor) => (
                <tr key={sensor.id} className={selectedSensor.id === sensor.id ? "row-selected" : ""} onClick={() => setSelectedId(sensor.id)}>
                  <td><strong className="table-primary">{sensor.id}</strong></td>
                  <td><span className="table-icon-text">{sensorIcon(sensor.type)}<span><strong>{sensor.type}</strong><small>{sensor.location}</small></span></span></td>
                  <td><strong>{sensor.latest}{sensor.unit}</strong><small className="table-subtext">{sensor.status === "Offline" ? "Last reported · 2h ago" : "8 min ago"}</small></td>
                  <td>{sensor.battery === null ? <span className="unavailable">Hard-wired</span> : <span className={`battery-cell ${sensor.battery < 40 ? "low" : ""}`}><Battery size={14} />{sensor.battery}%</span>}</td>
                  <td><StatusTag tone={statusTone(sensor.status)}>{sensor.status}</StatusTag></td>
                  <td><span className={sensor.nextMaintenance === "Overdue" ? "overdue-text" : ""}>{sensor.nextMaintenance}</span></td>
                </tr>
              ))}</tbody>
            </table>
            {filteredSensors.length === 0 && <div className="empty-table-state"><Search size={19} /><strong>No matching sensors</strong><span>Try changing the search or filters.</span></div>}
          </div>
          <div className="table-panel-footer"><span>Measurements are demo values, not live telemetry.</span><span><i className="demo-live-dot" />Sample refresh cadence · 15 minutes</span></div>
        </article>

        <aside className="workspace-panel sensor-detail-panel">
          <div className="sensor-detail-heading"><span className="panel-kicker">SELECTED DEVICE</span><StatusTag tone={statusTone(selectedSensor.status)}>{selectedSensor.status}</StatusTag></div>
          <div className="sensor-device-title"><span>{sensorIcon(selectedSensor.type)}</span><div><h2>{selectedSensor.id}</h2><p>{selectedSensor.type}</p></div></div>
          <div className="sensor-location"><span>LOCATION</span><strong>{selectedSensor.location}</strong></div>
          <div className="sensor-reading"><span>Latest reading</span><strong>{selectedSensor.latest}<small>{selectedSensor.unit}</small></strong></div>
          <div className="sensor-history-heading"><strong>Measurement history</strong><span>Last 7 days</span></div>
          <div className="sensor-history-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measurementHistory} margin={{ top: 8, right: 6, bottom: 0, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#edf0eb" strokeDasharray="3 5" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 9 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 9 }} />
                <Tooltip contentStyle={{ border: "1px solid #e8ebe6", borderRadius: 9, fontSize: 11 }} />
                <Line type="monotone" dataKey="value" name={measurementName} stroke="#438568" strokeWidth={2} dot={{ r: 2, fill: "#438568" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="sensor-maintenance-block">
            <span className="panel-kicker">MAINTENANCE</span>
            <div><CalendarClock size={14} /><span>Last service</span><strong>{selectedSensor.lastMaintenance}</strong></div>
            <div><CalendarClock size={14} /><span>Next service</span><strong className={selectedSensor.nextMaintenance === "Overdue" ? "overdue-text" : ""}>{selectedSensor.nextMaintenance}</strong></div>
            <div><BatteryWarning size={14} /><span>Battery</span><strong>{selectedSensor.battery === null ? "Hard-wired" : `${selectedSensor.battery}%`}</strong></div>
          </div>
        </aside>
      </section>
    </div>
  );
}
