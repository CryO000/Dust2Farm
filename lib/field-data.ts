export type FieldZone = {
  id: string;
  name: string;
  crop: string;
  acres: number;
  moisture: number;
  temperature: number;
  health: number;
  irrigation: "Optimal" | "Scheduled" | "Needs water";
  color: string;
  position: [number, number, number];
  sensor: string;
};

export const zones: FieldZone[] = [
  {
    id: "north",
    name: "North Field",
    crop: "Winter wheat",
    acres: 18.4,
    moisture: 34,
    temperature: 21.8,
    health: 91,
    irrigation: "Optimal",
    color: "#78b87f",
    position: [-2.8, 0.06, -1.72],
    sensor: "S-104",
  },
  {
    id: "east",
    name: "East Field",
    crop: "Sweet corn",
    acres: 14.2,
    moisture: 27,
    temperature: 23.4,
    health: 84,
    irrigation: "Scheduled",
    color: "#d7a747",
    position: [2.8, 0.06, -1.72],
    sensor: "S-108",
  },
  {
    id: "south",
    name: "South Field",
    crop: "Soybean",
    acres: 16.8,
    moisture: 19,
    temperature: 25.1,
    health: 72,
    irrigation: "Needs water",
    color: "#d9865d",
    position: [-2.8, 0.06, 1.72],
    sensor: "S-112",
  },
  {
    id: "west",
    name: "West Field",
    crop: "Alfalfa",
    acres: 12.6,
    moisture: 39,
    temperature: 20.6,
    health: 96,
    irrigation: "Optimal",
    color: "#5e9d76",
    position: [2.8, 0.06, 1.72],
    sensor: "S-115",
  },
];

export const moistureSeries = [
  { day: "Nov 9", moisture: 31, target: 30, temperature: 20 },
  { day: "Nov 10", moisture: 30, target: 30, temperature: 21 },
  { day: "Nov 11", moisture: 28, target: 30, temperature: 22 },
  { day: "Nov 12", moisture: 29, target: 30, temperature: 23 },
  { day: "Nov 13", moisture: 25, target: 30, temperature: 24 },
  { day: "Nov 14", moisture: 26, target: 30, temperature: 22 },
  { day: "Nov 15", moisture: 27, target: 30, temperature: 23 },
];

export const waterSeries = [
  { day: "Mon", usage: 4.2 },
  { day: "Tue", usage: 3.8 },
  { day: "Wed", usage: 5.1 },
  { day: "Thu", usage: 3.4 },
  { day: "Fri", usage: 4.7 },
  { day: "Sat", usage: 2.9 },
  { day: "Sun", usage: 3.6 },
];
