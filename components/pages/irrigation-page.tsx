"use client";

import { useState } from "react";
import { ArrowDownRight, CalendarDays, Check, Clock3, Droplets, Pause, Play, RotateCw, Waves } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DemoNotice, PageIntro, StatCard, StatusTag } from "@/components/platform-ui";
import { zones } from "@/lib/field-data";
import { irrigationHistory } from "@/lib/operations-data";

const initialSchedules = [
  { zone: "North Field", method: "Drip irrigation", next: "Nov 16 · 5:30 AM", duration: "42 min", status: "Scheduled" },
  { zone: "East Field", method: "Drip irrigation", next: "Nov 16 · 6:20 AM", duration: "36 min", status: "Scheduled" },
  { zone: "South Field", method: "Drip irrigation", next: "Nov 15 · 7:15 PM", duration: "55 min", status: "Recommended" },
  { zone: "West Field", method: "Drip irrigation", next: "Nov 17 · 5:45 AM", duration: "30 min", status: "Scheduled" },
];

export default function IrrigationPage() {
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [schedules, setSchedules] = useState(initialSchedules);
  const [message, setMessage] = useState("");

  const toggleValve = (name: string) => {
    const isRunning = Boolean(running[name]);
    setRunning((current) => ({ ...current, [name]: !current[name] }));
    setMessage(`${name} demo control ${isRunning ? "paused" : "started"}. No physical valve was changed.`);
  };
  const updateSchedule = (index: number, next: string) => {
    setSchedules((current) => current.map((item, i) => i === index ? { ...item, next } : item));
  };

  return (
    <div className="workspace-content">
      <PageIntro eyebrow="FARM WORKSPACE · WATER MANAGEMENT" title={<>Irrigation, <em>in balance.</em></>} description="Review zone schedules and use the demo controls to explore water planning." />
      <DemoNotice>Controls change only this browser view. No pump, valve, or irrigation hardware is connected.</DemoNotice>
      <section className="stats-grid four-stats">
        <StatCard label="Water used this week" value="27.7" unit="ac-ft" note="Illustrative weekly total" icon={<Droplets size={17} />} tone="blue" />
        <StatCard label="Weekly allocation" value="32.0" unit="ac-ft" note="87% of allocation used" icon={<Waves size={17} />} />
        <StatCard label="Zones monitored" value="4" note="Drip schedules · sample plan" icon={<CalendarDays size={17} />} tone="violet" />
        <StatCard label="Optimization" value="8%" note="Lower use than prior week" icon={<ArrowDownRight size={17} />} tone="green" />
      </section>

      {message && <div className="inline-feedback" role="status"><Check size={15} />{message}<button onClick={() => setMessage("")}>Dismiss</button></div>}
      <section className="irrigation-main-grid">
        <article className="workspace-panel irrigation-schedule-panel">
          <div className="panel-title-row"><div><span className="panel-kicker">ZONE CONTROLS</span><h2>Schedules & manual controls</h2><p>Schedule edits are local demo interactions only.</p></div><StatusTag tone="blue">Drip irrigation</StatusTag></div>
          <div className="irrigation-zone-list">
            {schedules.map((schedule, index) => {
              const zone = zones[index];
              return (
                <div className="irrigation-zone-row" key={schedule.zone}>
                  <i className="irrigation-zone-swatch" style={{ background: zone.color }} />
                  <div className="irrigation-zone-name"><strong>{schedule.zone}</strong><small>{zone.acres} ac · {schedule.method}</small></div>
                  <label className="schedule-select-label"><span>NEXT RUN</span><select value={schedule.next} onChange={(event) => updateSchedule(index, event.target.value)} aria-label={`Next irrigation run for ${schedule.zone}`}><option>{schedule.next}</option><option>Nov 17 · 5:30 AM</option><option>Nov 18 · 6:00 AM</option></select></label>
                  <span className="schedule-duration"><Clock3 size={13} />{schedule.duration}</span>
                  <div className="irrigation-controls"><StatusTag tone={schedule.status === "Recommended" ? "amber" : "green"}>{running[schedule.zone] ? "Running · demo" : schedule.status}</StatusTag><button className={`valve-button ${running[schedule.zone] ? "is-running" : ""}`} onClick={() => toggleValve(schedule.zone)} aria-label={`${running[schedule.zone] ? "Pause" : "Start"} ${schedule.zone} demo irrigation`}>{running[schedule.zone] ? <Pause size={14} /> : <Play size={14} />}{running[schedule.zone] ? "Pause" : "Start"}</button></div>
                </div>
              );
            })}
          </div>
          <div className="irrigation-panel-foot"><span><i /> All valves are disconnected in demo mode.</span><button onClick={() => setMessage("Schedules saved in this page session only.")}><Check size={14} />Save schedule</button></div>
        </article>

        <article className="workspace-panel water-tip-panel">
          <span className="panel-kicker">WATER OPTIMIZATION</span>
          <div className="water-tip-icon"><Droplets size={18} /></div>
          <h2>Time watering for cooler hours</h2>
          <p>South Field is the driest zone in the sample readings. The illustrative plan suggests a short evening cycle when winds are lower.</p>
          <div className="water-tip-stats"><span>EST. WATER</span><strong>~1.2 <small>ac-ft</small></strong><span>AVOID PEAK EVAPORATION</span><strong>After 7:00 PM</strong></div>
          <button className="secondary-action" onClick={() => setMessage("Recommendation added to the demo schedule. No physical irrigation system is connected.")}><Check size={14} />Add to demo schedule</button>
        </article>
      </section>

      <section className="workspace-panel irrigation-history-panel">
        <div className="panel-title-row"><div><span className="panel-kicker">WATER HISTORY</span><h2>Daily consumption by field</h2><p>Ac-ft · illustrative sample data</p></div><button className="filter-select"><RotateCw size={13} />Last 7 days</button></div>
        <div className="irrigation-history-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={irrigationHistory} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}><CartesianGrid vertical={false} stroke="#f0eeeb" strokeDasharray="3 5" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#98a199", fontSize: 10 }} /><Tooltip contentStyle={{ border: "1px solid #e8ebe6", borderRadius: 9, fontSize: 11 }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 7 }} /><Bar dataKey="north" name="North Field" stackId="a" fill="#9d8b6c" /><Bar dataKey="east" name="East Field" stackId="a" fill="#d2af60" /><Bar dataKey="south" name="South Field" stackId="a" fill="#d58962" /><Bar dataKey="west" name="West Field" stackId="a" fill="#b3a489" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>
    </div>
  );
}
