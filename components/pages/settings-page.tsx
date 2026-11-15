"use client";

import { useEffect, useState } from "react";
import { Check, Globe2, Leaf, Mail, Ruler, Satellite, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { DemoNotice, PageIntro } from "@/components/platform-ui";

type Preferences = {
  units: "Metric" | "US customary";
  emailAlerts: boolean;
  weeklySummary: boolean;
  moistureWarnings: boolean;
  imageryUpdates: boolean;
};

const defaults: Preferences = { units: "US customary", emailAlerts: true, weeklySummary: true, moistureWarnings: true, imageryUpdates: false };
const preferenceKey = "dust2farm-demo-preferences";

function isPreferences(value: unknown): value is Preferences {
  return (
    typeof value === "object" &&
    value !== null &&
    "units" in value &&
    (value.units === "Metric" || value.units === "US customary") &&
    "emailAlerts" in value &&
    typeof value.emailAlerts === "boolean" &&
    "weeklySummary" in value &&
    typeof value.weeklySummary === "boolean" &&
    "moistureWarnings" in value &&
    typeof value.moistureWarnings === "boolean" &&
    "imageryUpdates" in value &&
    typeof value.imageryUpdates === "boolean"
  );
}

function PreferenceToggle({ checked, onChange, label, description }: { checked: boolean; onChange: () => void; label: string; description: string }) {
  return (
    <label className="preference-toggle-row">
      <span><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" checked={checked} onChange={onChange} /><i className="toggle-switch" />
    </label>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(preferenceKey);
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isPreferences(parsed)) setPreferences(parsed);
      else window.localStorage.removeItem(preferenceKey);
    } catch {
      window.localStorage.removeItem(preferenceKey);
    }
  }, []);

  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setSaved(false);
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = () => {
    window.localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    setSaved(true);
  };

  return (
    <div className="workspace-content">
      <PageIntro eyebrow="FARM WORKSPACE · PREFERENCES" title={<>Make your workspace <em>yours.</em></>} description="Tune display and notification preferences for this device." />
      <DemoNotice>Settings are stored in this browser only. They are not synced to an account or service.</DemoNotice>
      <section className="settings-layout">
        <div className="settings-main">
          <article className="workspace-panel settings-card">
            <div className="settings-card-heading"><span className="settings-section-icon"><UserRound size={17} /></span><div><h2>Profile & workspace</h2><p>Current local demo identity and farm workspace.</p></div></div>
            <div className="settings-readonly-grid"><div><span>DISPLAY NAME</span><strong>Jordan Miller</strong></div><div><span>WORKSPACE</span><strong>Hawthorne Farm <i>DEMO</i></strong></div><div><span>ACCESS MODE</span><strong>Browser-local demo session</strong></div></div>
          </article>
          <article className="workspace-panel settings-card">
            <div className="settings-card-heading"><span className="settings-section-icon blue"><SlidersHorizontal size={17} /></span><div><h2>Display preferences</h2><p>Choose how environmental measurements are shown.</p></div></div>
            <label className="settings-select-row"><span><strong>Measurement units</strong><small>Applied to farm data labels where supported.</small></span><select className="filter-select" value={preferences.units} onChange={(event) => setPreference("units", event.target.value as Preferences["units"])}><option>US customary</option><option>Metric</option></select></label>
            <div className="settings-readonly-grid small"><div><span>DATE FORMAT</span><strong>MMM D, YYYY</strong></div><div><span>TIME ZONE</span><strong>Central Time (US)</strong></div></div>
          </article>
          <article className="workspace-panel settings-card">
            <div className="settings-card-heading"><span className="settings-section-icon amber"><Mail size={17} /></span><div><h2>Notifications</h2><p>Configure demo notification preferences for this device.</p></div></div>
            <PreferenceToggle checked={preferences.emailAlerts} onChange={() => setPreference("emailAlerts", !preferences.emailAlerts)} label="Email alert summaries" description="Daily summary of high-priority field alerts." />
            <PreferenceToggle checked={preferences.weeklySummary} onChange={() => setPreference("weeklySummary", !preferences.weeklySummary)} label="Weekly farm report" description="A weekly recap of water use and field conditions." />
            <PreferenceToggle checked={preferences.moistureWarnings} onChange={() => setPreference("moistureWarnings", !preferences.moistureWarnings)} label="Soil moisture warnings" description="Highlight demo zones outside their moisture target." />
            <PreferenceToggle checked={preferences.imageryUpdates} onChange={() => setPreference("imageryUpdates", !preferences.imageryUpdates)} label="Earth observation updates" description="Show a notice when a new imagery sample is available." />
          </article>
          <div className="settings-save-row"><span>{saved ? <><Check size={15} /> Saved on this device</> : "Unsaved preference changes stay in this page until saved."}</span><button className="primary-button" onClick={save}><Check size={15} />Save preferences</button></div>
        </div>

        <aside className="settings-side">
          <article className="workspace-panel settings-side-card"><span className="settings-side-icon"><ShieldCheck size={18} /></span><h2>Privacy & access</h2><p>This prototype does not connect to real farm accounts or verify credentials. Demo preferences and session state stay in this browser.</p><div className="settings-side-line"><Globe2 size={14} /><span>No external accounts connected</span></div></article>
          <article className="workspace-panel settings-side-card"><span className="settings-side-icon green"><Satellite size={18} /></span><h2>Data sources</h2><p>Real provider connections can be configured when backend integrations are added.</p><div className="source-list"><span><i />Satellite imagery <b>Not connected</b></span><span><i />Weather provider <b>Not connected</b></span><span><i />Field sensors <b>Demo data</b></span></div></article>
          <article className="settings-side-note"><Leaf size={15} /><span>From Earth Observation to Smarter Agriculture.</span></article>
        </aside>
      </section>
      <div className="settings-units-footnote"><Ruler size={13} />Changing units updates this local preference; demo values are not converted from a live source.</div>
    </div>
  );
}
