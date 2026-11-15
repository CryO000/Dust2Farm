"use client";

import {
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  Droplets,
  Leaf,
  LogOut,
  Map,
  Menu,
  Settings,
  Sprout,
  Wrench,
  X,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearDemoSession, getDemoSession } from "@/lib/demo-session";

const navigation = [
  { label: "Overview", href: "/", icon: Activity },
  { label: "3D farm", href: "/farm", icon: Map },
  { label: "Sensors & monitoring", href: "/sensors", icon: Radio },
  { label: "Irrigation", href: "/irrigation", icon: Droplets },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Alerts & recommendations", href: "/alerts", icon: Bell, count: "6" },
];

const pageNames: Record<string, string> = {
  "/": "Overview",
  "/farm": "3D Farm Visualization",
  "/sensors": "Sensors & Monitoring",
  "/irrigation": "Irrigation Management",
  "/maintenance": "Maintenance Center",
  "/alerts": "Alerts & Recommendations",
  "/settings": "Settings",
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "Jordan Miller", email: "jordan@hawthorne.demo" });

  useEffect(() => {
    const session = getDemoSession();
    if (session) setProfile({ name: session.name, email: session.email });
  }, []);

  const signOut = () => {
    clearDemoSession();
    router.replace("/login");
  };

  const sidebar = (
    <>
      <Link className="brand" href="/" onClick={() => setMobileOpen(false)}>
        <span className="brand-mark"><Sprout size={19} strokeWidth={2.2} /></span>
        <span className="brand-copy">Dust<span>2</span>Farm<small>FARM MONITORING</small></span>
      </Link>
      <button className="workspace-picker" type="button">
        <span className="workspace-avatar">H</span>
        <span className="workspace-copy"><strong>Hawthorne Farm</strong><small>Demo workspace</small></span>
        <ChevronDown size={15} />
      </button>
      <div className="nav-section">FARM WORKSPACE</div>
      <nav className="side-nav" aria-label="Farm workspace">
        {navigation.map(({ label, href, icon: Icon, count }) => (
          <Link
            key={href}
            className={`nav-item ${pathname === href ? "active" : ""}`}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={17} />
            <span>{label}</span>
            {count && <span className="nav-count">{count}</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="satellite-card">
          <div className="satellite-card-icon"><Leaf size={16} /></div>
          <span className="satellite-eyebrow">FIELD NOTE</span>
          <strong>South Field needs attention</strong>
          <p>Moisture is below the preferred range. Review the irrigation recommendation.</p>
          <Link href="/alerts" onClick={() => setMobileOpen(false)}>Review alert <ChevronRight size={13} /></Link>
        </div>
        <Link className={`nav-item settings-link ${pathname === "/settings" ? "active" : ""}`} href="/settings" onClick={() => setMobileOpen(false)}>
          <Settings size={17} /><span>Settings</span>
        </Link>
        <div className="profile">
          <div className="profile-avatar">JM</div>
          <div><strong>{profile.name}</strong><small>Demo farm manager</small></div>
          <button type="button" className="signout-button" onClick={signOut} aria-label="Exit demo workspace"><LogOut size={15} /></button>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`mobile-sidebar ${mobileOpen ? "open" : ""}`}>
        <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        {sidebar}
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
            <div className="breadcrumbs"><span>Hawthorne Farm</span><ChevronRight size={14} /><strong>{pageNames[pathname] ?? "Farm workspace"}</strong></div>
          </div>
          <div className="topbar-actions"><span className="demo-mode-chip">DEMO WORKSPACE</span><span className="sync-status">Sample data, Nov 15</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}
