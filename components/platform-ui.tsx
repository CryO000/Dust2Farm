import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <div className="eyebrow-line"><span className="eyebrow-dot" />{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-intro-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  note,
  icon,
  tone = "green",
}: {
  label: string;
  value: string;
  unit?: string;
  note: string;
  icon: ReactNode;
  tone?: "green" | "blue" | "amber" | "violet";
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top"><span>{label}</span><i className={`stat-icon ${tone}`}>{icon}</i></div>
      <strong>{value}{unit && <small>{unit}</small>}</strong>
      <p>{note}</p>
    </article>
  );
}

export function StatusTag({ children, tone = "green" }: { children: ReactNode; tone?: string }) {
  return <span className={`status-tag ${tone}`}><i />{children}</span>;
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <div className="demo-notice"><span>DEMO MODE</span>{children}</div>;
}
