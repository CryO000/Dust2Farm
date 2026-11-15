"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bell, Check, CheckCheck, Droplets, Leaf, Radio, Satellite, Search, ShieldAlert, Wind } from "lucide-react";
import Link from "next/link";
import { DemoNotice, PageIntro, StatusTag } from "@/components/platform-ui";
import { initialAlerts, type FarmAlert } from "@/lib/operations-data";

const categoryIcon = (category: FarmAlert["category"]) => category === "Soil" ? <Droplets size={17} /> : category === "Sensor" ? <Radio size={17} /> : category === "Irrigation" ? <Leaf size={17} /> : <Wind size={17} />;

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState("All alerts");
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    const matchesStatus = filter === "All alerts" || (filter === "Open" ? alert.status !== "Resolved" : alert.status === filter);
    const matchesCategory = category === "All categories" || alert.category === category;
    const matchesQuery = `${alert.title} ${alert.description} ${alert.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesCategory && matchesQuery;
  }), [alerts, filter, category, query]);
  const openCount = alerts.filter((alert) => alert.status !== "Resolved").length;
  const highCount = alerts.filter((alert) => alert.priority === "High" && alert.status !== "Resolved").length;
  const updateStatus = (id: string, status: FarmAlert["status"]) => {
    setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, status } : alert));
  };

  return (
    <div className="workspace-content">
      <PageIntro eyebrow="FARM WORKSPACE, ALERTS" title={<>Alerts and recommendations</>} description="Review field alerts and recommended actions." />
      <DemoNotice>Alert events and recommendations below are examples generated from bundled demo readings.</DemoNotice>
      <div className="alert-summary-strip">
        <span><Bell size={16} /><strong>{openCount}</strong> open alerts</span>
        <span><ShieldAlert size={16} /><strong>{highCount}</strong> high priority</span>
        <span><CheckCheck size={16} /><strong>{alerts.filter((alert) => alert.status === "Resolved").length}</strong> resolved</span>
      </div>
      <section className="workspace-panel alerts-panel">
        <div className="alerts-toolbar">
          <div className="alert-filter-tabs" role="group" aria-label="Filter alerts by status">{["All alerts", "Open", "Acknowledged", "Resolved"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
          <div className="table-filters">
            <label className="search-field"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts" aria-label="Search alerts" /></label>
            <select className="filter-select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter alerts by category"><option>All categories</option><option>Soil</option><option>Sensor</option><option>Irrigation</option><option>Weather</option></select>
          </div>
        </div>
        <div className="alert-list">{filteredAlerts.map((alert) => (
          <article className={`alert-list-item ${alert.status === "Resolved" ? "is-resolved" : ""}`} key={alert.id}>
            <div className={`alert-category-icon ${alert.category.toLowerCase()}`}>{categoryIcon(alert.category)}</div>
            <div className="alert-list-main">
              <div className="alert-title-row"><h2>{alert.title}</h2><StatusTag tone={alert.priority === "High" ? "red" : alert.priority === "Medium" ? "amber" : "green"}>{alert.priority} priority</StatusTag><span className="alert-time">{alert.time}</span></div>
              <p>{alert.description}</p>
              <div className="alert-list-meta"><span>{alert.category}</span>, {alert.location}, ID {alert.id}</div>
              {alert.status === "Acknowledged" && <span className="alert-status-text"><Check size={12} /> Acknowledged</span>}
              {alert.status === "Resolved" && <span className="alert-status-text resolved"><CheckCheck size={12} /> Resolved</span>}
            </div>
            <div className="alert-actions">
              {alert.status === "New" && <button className="table-action-button" onClick={() => updateStatus(alert.id, "Acknowledged")}><Check size={13} />Acknowledge</button>}
              {alert.status !== "Resolved" && <button className="resolve-button" onClick={() => updateStatus(alert.id, "Resolved")}><CheckCheck size={14} />Resolve</button>}
              {alert.status === "Resolved" && <button className="resolve-button" onClick={() => updateStatus(alert.id, "New")}>Reopen</button>}
            </div>
          </article>
        ))}{filteredAlerts.length === 0 && <div className="empty-table-state"><Bell size={19} /><strong>No alerts match these filters</strong><span>Try a different status, category, or search.</span></div>}</div>
      </section>
      <section className="recommendation-row">
        <div className="recommendation-row-icon"><Satellite size={18} /></div>
        <div><span className="panel-kicker">RECOMMENDATION, DEMO</span><h2>Review South Field irrigation</h2><p>Sample soil moisture is below the target range. Confirm local conditions before irrigating.</p></div>
        <Link href="/irrigation">Review irrigation plan <ArrowRight size={14} /></Link>
      </section>
    </div>
  );
}
