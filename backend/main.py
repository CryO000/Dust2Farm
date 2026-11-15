from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Dust2Farm API",
    description="Field intelligence API. Bundled readings are illustrative demo data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


class Zone(BaseModel):
    id: str
    name: str
    crop: str
    acres: float
    moisture: float
    soil_temperature_c: float
    crop_health: int
    irrigation: Literal["Optimal", "Scheduled", "Needs water"]
    sensor_id: str


class Overview(BaseModel):
    farm_name: str
    location: str
    area_acres: float
    average_moisture: float
    air_temperature_c: float
    crop_health: int
    data_mode: Literal["demo"]
    updated_at: datetime


class Reading(BaseModel):
    timestamp: str
    moisture: float
    target: float
    temperature_c: float
    water_ac_ft: float


ZONES = [
    Zone(id="north", name="North Field", crop="Winter wheat", acres=18.4, moisture=34, soil_temperature_c=21.8, crop_health=91, irrigation="Optimal", sensor_id="S-104"),
    Zone(id="east", name="East Field", crop="Sweet corn", acres=14.2, moisture=27, soil_temperature_c=23.4, crop_health=84, irrigation="Scheduled", sensor_id="S-108"),
    Zone(id="south", name="South Field", crop="Soybean", acres=16.8, moisture=19, soil_temperature_c=25.1, crop_health=72, irrigation="Needs water", sensor_id="S-112"),
    Zone(id="west", name="West Field", crop="Alfalfa", acres=12.6, moisture=39, soil_temperature_c=20.6, crop_health=96, irrigation="Optimal", sensor_id="S-115"),
]

READINGS = [
    Reading(timestamp="Nov 9", moisture=31, target=30, temperature_c=20, water_ac_ft=4.2),
    Reading(timestamp="Nov 10", moisture=30, target=30, temperature_c=21, water_ac_ft=3.8),
    Reading(timestamp="Nov 11", moisture=28, target=30, temperature_c=22, water_ac_ft=5.1),
    Reading(timestamp="Nov 12", moisture=29, target=30, temperature_c=23, water_ac_ft=3.4),
    Reading(timestamp="Nov 13", moisture=25, target=30, temperature_c=24, water_ac_ft=4.7),
    Reading(timestamp="Nov 14", moisture=26, target=30, temperature_c=22, water_ac_ft=2.9),
    Reading(timestamp="Nov 15", moisture=27, target=30, temperature_c=23, water_ac_ft=3.6),
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "data_mode": "demo"}


@app.get("/api/overview", response_model=Overview)
def get_overview() -> Overview:
    return Overview(
        farm_name="Hawthorne Farm",
        location="Linn County, Iowa",
        area_acres=sum(zone.acres for zone in ZONES),
        average_moisture=round(sum(zone.moisture for zone in ZONES) / len(ZONES)),
        air_temperature_c=23,
        crop_health=86,
        data_mode="demo",
        updated_at=datetime.now(timezone.utc),
    )


@app.get("/api/zones", response_model=list[Zone])
def get_zones() -> list[Zone]:
    return ZONES


@app.get("/api/readings", response_model=list[Reading])
def get_readings() -> list[Reading]:
    return READINGS
