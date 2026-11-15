"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, CircleAlert, Droplets, Filter, Plus, Radio, Wrench } from "lucide-react";
import { DemoNotice, PageIntro, StatCard, StatusTag } from "@/components/platform-ui";
import { initialMaintenanceTasks, type MaintenanceTask } from "@/lib/operations-data";

const categoryIcon = (category: MaintenanceTask["category"]) => category === "Sensor" ? <Radio size={16} /> : category === "Pump" ? <Wrench size={16} /> : <Droplets size={16} />;

export default function MaintenancePage() {
  const [tasks, setTasks] = useState(initialMaintenanceTasks);
  const [filter, setFilter] = useState("All tasks");
  const [message, setMessage] = useState("");
  const visibleTasks = useMemo(() => filter === "All tasks" ? tasks : tasks.filter((task) => task.status === filter), [tasks, filter]);
  const overdueCount = tasks.filter((task) => task.status === "Overdue").length;
  const scheduledCount = tasks.filter((task) => task.status === "Scheduled").length;
  const completedCount = tasks.filter((task) => task.status === "Completed").length;

  const completeTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, status: "Completed" } : item));
    setMessage(`${task.title} marked complete in this demo view only.`);
  };

  return (
    <div className="workspace-content">
      <PageIntro eyebrow="FARM WORKSPACE, OPERATIONS" title={<>Maintenance</>} description="Track sensor service, irrigation equipment, and upcoming maintenance tasks." actions={<button className="primary-button" onClick={() => setMessage("New maintenance tasks can be planned here when connected to your operations system.")}><Plus size={15} />Add maintenance task</button>} />
      <DemoNotice>Maintenance records and task updates are local demo data; no work order system is connected.</DemoNotice>
      <section className="stats-grid three-stats">
        <StatCard label="Overdue tasks" value={String(overdueCount)} note="Review before next cycle" icon={<CircleAlert size={17} />} tone="amber" />
        <StatCard label="Upcoming" value={String(scheduledCount)} note="Scheduled maintenance" icon={<CalendarClock size={17} />} tone="blue" />
        <StatCard label="Completed this period" value={String(completedCount)} note="Demo maintenance log" icon={<Check size={17} />} />
      </section>
      {message && <div className="inline-feedback" role="status"><Check size={15} />{message}<button onClick={() => setMessage("")}>Dismiss</button></div>}

      <section className="workspace-panel maintenance-panel">
        <div className="table-panel-heading maintenance-heading">
          <div><span className="panel-kicker">MAINTENANCE REGISTER</span><h2>Tasks & equipment care</h2><p>Sensor servicing, drip nozzle checks, pipe inspection, and pump maintenance.</p></div>
          <label className="filter-control"><Filter size={14} /><select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter maintenance tasks"><option>All tasks</option><option>Overdue</option><option>Scheduled</option><option>Completed</option></select></label>
        </div>
        <div className="responsive-table-wrap">
          <table className="management-table maintenance-table">
            <thead><tr><th>TASK</th><th>EQUIPMENT / LOCATION</th><th>CATEGORY</th><th>DUE DATE</th><th>PRIORITY</th><th>STATUS</th><th>ACTION</th></tr></thead>
            <tbody>{visibleTasks.map((task) => (
              <tr key={task.id}>
                <td><span className="table-icon-text"><i className={`maintenance-icon ${task.category.toLowerCase()}`}>{categoryIcon(task.category)}</i><strong>{task.title}</strong></span></td>
                <td>{task.asset}</td>
                <td><span className="category-label">{task.category}</span></td>
                <td className={task.status === "Overdue" ? "overdue-text" : ""}>{task.due}</td>
                <td><StatusTag tone={task.priority === "High" ? "red" : task.priority === "Medium" ? "amber" : "green"}>{task.priority}</StatusTag></td>
                <td><StatusTag tone={task.status === "Overdue" ? "red" : task.status === "Completed" ? "green" : "blue"}>{task.status}</StatusTag></td>
                <td>{task.status !== "Completed" ? <button className="table-action-button" onClick={() => completeTask(task.id)}><Check size={13} />Complete</button> : <span className="completed-note"><Check size={13} />Logged</span>}</td>
              </tr>
            ))}</tbody>
          </table>
          {visibleTasks.length === 0 && <div className="empty-table-state"><Wrench size={19} /><strong>No tasks in this view</strong><span>Choose another status filter to see maintenance tasks.</span></div>}
        </div>
        <div className="table-panel-footer"><span>History includes completed illustrative tasks.</span><span>{tasks.length} demo records</span></div>
      </section>

      <section className="maintenance-callout"><span className="callout-icon"><CircleAlert size={17} /></span><span><strong>South Field service note</strong><small>Check the S-112 battery and inspect row 3 drip emitters before the next scheduled cycle.</small></span><button onClick={() => setFilter("Overdue")}>View overdue tasks →</button></section>
    </div>
  );
}
