export type SensorStatus = "Online" | "Attention" | "Offline";

export type FarmSensor = {
  id: string;
  type: "Soil moisture" | "Soil temperature" | "Air station";
  location: string;
  latest: string;
  unit: string;
  status: SensorStatus;
  battery: number | null;
  lastMaintenance: string;
  nextMaintenance: string;
};

export const sensors: FarmSensor[] = [
  { id: "S-104", type: "Soil moisture", location: "North Field", latest: "34", unit: "%", status: "Online", battery: 91, lastMaintenance: "Oct 26, 2026", nextMaintenance: "Jan 26, 2027" },
  { id: "S-108", type: "Soil moisture", location: "East Field", latest: "27", unit: "%", status: "Online", battery: 76, lastMaintenance: "Sep 18, 2026", nextMaintenance: "Dec 18, 2026" },
  { id: "S-112", type: "Soil moisture", location: "South Field", latest: "19", unit: "%", status: "Attention", battery: 34, lastMaintenance: "Aug 10, 2026", nextMaintenance: "Nov 18, 2026" },
  { id: "S-115", type: "Soil moisture", location: "West Field", latest: "39", unit: "%", status: "Online", battery: 88, lastMaintenance: "Oct 30, 2026", nextMaintenance: "Jan 30, 2027" },
  { id: "WX-01", type: "Air station", location: "Central barn", latest: "62", unit: "% RH", status: "Online", battery: null, lastMaintenance: "Nov 02, 2026", nextMaintenance: "Feb 02, 2027" },
  { id: "ST-02", type: "Soil temperature", location: "South Field", latest: "25.1", unit: "°C", status: "Offline", battery: 0, lastMaintenance: "Jul 21, 2026", nextMaintenance: "Overdue" },
];

export const sensorHistory = [
  { day: "Nov 9", value: 32 },
  { day: "Nov 10", value: 34 },
  { day: "Nov 11", value: 31 },
  { day: "Nov 12", value: 29 },
  { day: "Nov 13", value: 24 },
  { day: "Nov 14", value: 21 },
  { day: "Nov 15", value: 19 },
];

export type MaintenanceTask = {
  id: string;
  title: string;
  asset: string;
  category: "Sensor" | "Irrigation" | "Pump";
  due: string;
  priority: "High" | "Medium" | "Low";
  status: "Overdue" | "Scheduled" | "Completed";
};

export const initialMaintenanceTasks: MaintenanceTask[] = [
  { id: "M-2401", title: "Replace low-battery sensor", asset: "S-112 · South Field", category: "Sensor", due: "Nov 12, 2026", priority: "High", status: "Overdue" },
  { id: "M-2402", title: "Inspect drip emitters", asset: "South Field · Row 3", category: "Irrigation", due: "Nov 19, 2026", priority: "High", status: "Scheduled" },
  { id: "M-2403", title: "Check pump seal and pressure", asset: "Main pump · Reservoir", category: "Pump", due: "Nov 22, 2026", priority: "Medium", status: "Scheduled" },
  { id: "M-2404", title: "Flush filter assembly", asset: "East Field · Valve 2", category: "Irrigation", due: "Nov 25, 2026", priority: "Low", status: "Scheduled" },
  { id: "M-2405", title: "Calibrate moisture probe", asset: "S-104 · North Field", category: "Sensor", due: "Nov 12, 2026", priority: "Low", status: "Completed" },
  { id: "M-2406", title: "Check for blocked emitters", asset: "East Field · Drip line 4", category: "Irrigation", due: "Nov 27, 2026", priority: "Medium", status: "Scheduled" },
  { id: "M-2407", title: "Inspect lateral for leak or damage", asset: "West Field · Main lateral", category: "Irrigation", due: "Nov 29, 2026", priority: "Medium", status: "Scheduled" },
];

export type FarmAlert = {
  id: string;
  title: string;
  description: string;
  category: "Soil" | "Sensor" | "Irrigation" | "Weather";
  priority: "High" | "Medium" | "Low";
  location: string;
  time: string;
  status: "New" | "Acknowledged" | "Resolved";
};

export const initialAlerts: FarmAlert[] = [
  { id: "A-1104", title: "Soil moisture below target", description: "South Field is 6 points below the 25% minimum threshold.", category: "Soil", priority: "High", location: "South Field", time: "12 min ago", status: "New" },
  { id: "A-1103", title: "Sensor connection lost", description: "Soil temperature probe has not checked in for 2 hours.", category: "Sensor", priority: "High", location: "South Field · ST-02", time: "38 min ago", status: "New" },
  { id: "A-1102", title: "Emitter inspection due", description: "Scheduled maintenance is due before the next irrigation cycle.", category: "Irrigation", priority: "Medium", location: "South Field · Row 3", time: "Yesterday", status: "Acknowledged" },
  { id: "A-1101", title: "Wind advisory this evening", description: "Delay overhead irrigation until wind speeds decrease.", category: "Weather", priority: "Medium", location: "Hawthorne Farm", time: "3 hours ago", status: "New" },
  { id: "A-1099", title: "High humidity observed overnight", description: "The demo air station recorded 82% relative humidity before dawn. Review crop conditions for moisture-related stress.", category: "Weather", priority: "Medium", location: "Hawthorne Farm · WX-01", time: "Nov 14", status: "New" },
  { id: "A-1097", title: "Irrigation flow below plan", description: "Illustrative flow readings for South Field are lower than the scheduled amount. Check for a blocked emitter or line issue.", category: "Irrigation", priority: "Medium", location: "South Field · Row 3", time: "Nov 13", status: "New" },
  { id: "A-1098", title: "West Field moisture recovered", description: "Readings are back inside the optimal operating range.", category: "Soil", priority: "Low", location: "West Field", time: "Nov 13", status: "Resolved" },
];

export const irrigationHistory = [
  { day: "Nov 9", north: 1.1, east: 0.8, south: 1.4, west: 0.9 },
  { day: "Nov 10", north: 0.9, east: 1.2, south: 1.8, west: 0.7 },
  { day: "Nov 11", north: 1.2, east: 0.6, south: 1.5, west: 0.9 },
  { day: "Nov 12", north: 0.8, east: 1.0, south: 1.3, west: 0.7 },
  { day: "Nov 13", north: 1.1, east: 0.9, south: 1.6, west: 1.1 },
  { day: "Nov 14", north: 0.7, east: 0.8, south: 1.0, west: 0.4 },
  { day: "Nov 15", north: 0.9, east: 0.7, south: 1.3, west: 0.7 },
];
