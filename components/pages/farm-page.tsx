"use client";

import { useState } from "react";
import { Droplets, Eye, EyeOff, MapPin, RotateCcw, Satellite, SlidersHorizontal, Thermometer } from "lucide-react";
import Link from "next/link";
import ParcelScene from "@/components/parcel-scene";
import LoadingScreen from "@/components/loading-screen";
import { DemoNotice, PageIntro, StatusTag } from "@/components/platform-ui";
import { zones } from "@/lib/field-data";

export default function FarmPage() {
  const [selectedZone, setSelectedZone] = useState(zones[2]);
  const [showSensors, setShowSensors] = useState(true);
  const [showIrrigation, setShowIrrigation] = useState(true);
  const [irrigationActive, setIrrigationActive] = useState(false);
  const [ready, setReady] = useState(false);
  const statusTone = selectedZone.irrigation === "Needs water" ? "amber" : selectedZone.irrigation === "Scheduled" ? "blue" : "green";

  return (
    <div className="workspace-content farm-page">
      <PageIntro
        eyebrow="FIELD MODEL, HAWTHORNE FARM"
        title={<>Explore your <em>fields.</em></>}
        description="Orbit the terrain, select a zone, and inspect its demo conditions."
        actions={<span className="location-chip"><MapPin size={14} /> Linn County, Iowa</span>}
      />
      <DemoNotice>Interactive field model and readings are illustrative. No live satellite, sensor, or irrigation connection.</DemoNotice>

      <section className="farm-workspace-grid">
        <article className="workspace-panel farm-scene-panel">
          <div className="farm-scene-toolbar">
            <div><span className="panel-kicker">INTERACTIVE PARCEL</span><h2>Hawthorne Farm <small>62.0 acres</small></h2></div>
            <span className="scene-model-pill">DEMO TERRAIN</span>
          </div>
          <div className="farm-scene-frame">
            {!ready && <div className="scene-loading-overlay"><LoadingScreen message="Loading 3D field model" /></div>}
            <ParcelScene
              selectedZone={selectedZone.id}
              onSelectZone={setSelectedZone}
              showSensors={showSensors}
              showIrrigation={showIrrigation}
              irrigationActive={irrigationActive}
              onReady={() => setReady(true)}
            />
            <div className="farm-scene-hud"><span><MapPin size={13} /> LINN COUNTY, IOWA</span><span><Satellite size={13} /> ELEVATION MODEL, DEMO</span></div>
            <div className="farm-scene-controls">
              <button onClick={() => setShowSensors(!showSensors)}>{showSensors ? <Eye size={14} /> : <EyeOff size={14} />}Sensors</button>
              <button onClick={() => setShowIrrigation(!showIrrigation)}><Droplets size={14} />Infrastructure</button>
              <button className={irrigationActive ? "active-water" : ""} onClick={() => setIrrigationActive(!irrigationActive)}><span className={`control-dot ${irrigationActive ? "flow-dot" : "pipe-dot"}`} />{irrigationActive ? "Pause flow" : "Simulate flow"}</button>
            </div>
            <div className="farm-defect-key">SENSOR FAULT, S-112</div>
            <div className="farm-scene-legend"><span>MOISTURE</span><i /><small>LOW</small><small>OPTIMAL</small><small>HIGH</small></div>
            <div className="farm-orbit-hint"><RotateCcw size={12} /> Drag to rotate, scroll to zoom, right-drag to pan</div>
          </div>
          <div className="farm-zone-strip">
            {zones.map((zone) => (
              <button className={`farm-zone-chip ${selectedZone.id === zone.id ? "selected" : ""}`} key={zone.id} onClick={() => setSelectedZone(zone)}>
                <i style={{ background: zone.color }} /><span><strong>{zone.name}</strong><small>{zone.acres} ac, {zone.crop}</small></span><b>{zone.moisture}%</b>
              </button>
            ))}
          </div>
        </article>

        <aside className="workspace-panel selected-zone-panel">
          <span className="panel-kicker">SELECTED FIELD ZONE</span>
          <div className="selected-zone-title"><i style={{ background: selectedZone.color }} /><h2>{selectedZone.name}</h2></div>
          <p className="selected-zone-crop">{selectedZone.crop}, {selectedZone.acres} acres</p>
          <StatusTag tone={statusTone}>{selectedZone.irrigation}</StatusTag>
          <div className="zone-detail-divider" />
          <div className="zone-detail-stat"><span><Droplets size={15} /> Soil moisture</span><strong>{selectedZone.moisture}<small>%</small></strong></div>
          <div className="zone-detail-progress"><i style={{ width: `${Math.min(selectedZone.moisture * 2.5, 100)}%`, background: selectedZone.moisture < 22 ? "#d4865f" : "#a88a5a" }} /></div>
          <div className="zone-range"><span>Dry</span><span>Target 25-35%</span><span>Wet</span></div>
          <div className="zone-detail-stat"><span><Thermometer size={15} /> Soil temperature</span><strong>{selectedZone.temperature}<small>°C</small></strong></div>
          <div className="zone-detail-stat"><span><SlidersHorizontal size={15} /> Crop health</span><strong>{selectedZone.health}<small>/100</small></strong></div>
          <div className="zone-detail-stat"><span><Satellite size={15} /> Sensor ID</span><strong className="sensor-id">{selectedZone.sensor}</strong></div>
          <div className="zone-data-timestamp">Last demo reading, 8 min ago</div>
          {selectedZone.irrigation === "Needs water" && <div className="zone-action-note"><strong>Suggested action</strong><span>Review tonight’s irrigation plan and confirm sensor readings before irrigating.</span><Link href="/irrigation">Open irrigation management →</Link></div>}
        </aside>
      </section>
      <footer className="workspace-footer"><span>3D field model, drag to rotate, scroll to zoom, select a field to inspect</span><span>Elevation and boundaries are illustrative demo data</span></footer>
    </div>
  );
}
