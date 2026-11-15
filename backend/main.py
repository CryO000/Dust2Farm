import os
from datetime import date, datetime, timezone
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .dakhla_data import analyze_day, daily_series, summary as dakhla_summary
from .dakhla_data import FIELD as DAKHLA_FIELD

app = FastAPI(
    title="Dust2Farm API",
    description="Field intelligence API. Bundled readings are illustrative demo data.",
    version="1.0.0",
)

cors_origins = [origin.strip() for origin in os.environ.get(
    "DUST2FARM_CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",") if origin.strip()]
frontend_host = os.environ.get("DUST2FARM_FRONTEND_HOST", "").strip()
if frontend_host:
    cors_origins.append(f"https://{frontend_host}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["GET", "POST"],
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


class DakhlaAnalysisRequest(BaseModel):
    date: date
    field: dict[str, Any] = Field(default_factory=dict)
    anomaly: dict[str, Any] = Field(default_factory=dict)


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


@app.get("/api/dakhla/summary")
def get_dakhla_summary() -> dict:
    """Real historical Dakhla weather, rainfall and ETa provenance."""
    return dakhla_summary()


@app.get("/api/dakhla/field")
def get_dakhla_field() -> dict:
    """Dakhla Field01 GeoJSON boundary supplied with the project data."""
    return DAKHLA_FIELD


@app.get("/api/dakhla/series")
def get_dakhla_series(start_date: date | None = Query(default=None),
                      end_date: date | None = Query(default=None)) -> dict:
    """Daily IMERG and MERRA-2 records; optional inclusive date filters."""
    try:
        rows = daily_series(start_date, end_date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"count": len(rows), "rows": rows}


@app.get("/api/dakhla/analyze")
def get_dakhla_analysis(date: date = Query(...)) -> dict:
    """Explainable risk assessment with the available record for one date."""
    try:
        return analyze_day(date)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc).strip("'")) from exc


@app.post("/api/dakhla/analyze")
def post_dakhla_analysis(request: DakhlaAnalysisRequest) -> dict:
    """Re-run an assessment with optional same-day field measurements."""
    try:
        return analyze_day(request.date, request.field, request.anomaly)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc).strip("'")) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/overview", response_model=Overview)
def get_overview() -> Overview:
    return Overview(
        farm_name="Hawthorne Farm",
        location="Dakhla",
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
