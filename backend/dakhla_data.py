"""Local read-only adapter for the Dakhla IMERG, MERRA-2 and ETa demo data."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from .dakhla_risks import assess


DATA_DIR = Path(__file__).resolve().parent / "data"
SERIES = json.loads((DATA_DIR / "dakhla_series.json").read_text(encoding="utf-8"))
ETA = json.loads((DATA_DIR / "dakhla_eta_historical.json").read_text(encoding="utf-8"))
FIELD = json.loads((DATA_DIR / "Dakhla_Field01_field.geojson").read_text(encoding="utf-8"))
ETA_BY_DATE = {
    ETA["et_map"]["start_date"]: ETA["et_map"],
}


def summary() -> dict:
    parcel = ETA["parcel_config"]
    rainfall = [row.get("rain_mm") for row in SERIES if row.get("rain_mm") is not None]
    grid = next((row.get("rain_grid_cell") for row in SERIES if row.get("rain_grid_cell")), None)
    return {
        "parcel": {
            "name": "Dakhla Field01",
            "area_ha": round(parcel["area_m2"] / 10_000, 2),
            "latitude": parcel["latitude"],
            "longitude": parcel["longitude"],
            "zone_method": ETA["et_map"].get("zone_method"),
        },
        "period": {"start": SERIES[0]["date"], "end": SERIES[-1]["date"],
                   "days": len(SERIES)},
        "rainfall": {
            "source": SERIES[-1].get("rain_source"),
            "total_mm": round(sum(rainfall), 3),
            "days_with_rain": sum(value > 0 for value in rainfall),
            "grid_cell": grid,
            "spatial_note": "Maille régionale de 0,1°; estimation satellite, pas un pluviomètre de parcelle.",
        },
        "weather_source": "MERRA-2 daily forcing",
        "evapotranspiration": {
            "source": ETA["et_map"]["source"],
            "date": ETA["et_map"]["start_date"],
            "unit": ETA["et_map"]["unit"],
            "resolution_m": ETA["et_map"]["resolution_m"],
            "valid_pixels": ETA["provenance"]["valid_pixel_count"],
            "zone_values": ETA["et_map"]["zone_values"],
            "interpretation": ETA["provenance"]["interpretation"],
        },
        "field_measurements_available": False,
        "missing_field_data": ["humidité relative mesurée", "débit et pression d'irrigation",
                               "ECe du sol", "mesures d'érosion"],
    }


def daily_series(start_date: date | None = None, end_date: date | None = None) -> list[dict]:
    if start_date and end_date and start_date > end_date:
        raise ValueError("start_date doit précéder ou égaler end_date")
    result = []
    for row in SERIES:
        day = date.fromisoformat(row["date"])
        if start_date and day < start_date:
            continue
        if end_date and day > end_date:
            continue
        result.append(row)
    return result


def analyze_day(day: date, field: dict | None = None, anomaly: dict | None = None) -> dict:
    record = next((row for row in SERIES if row["date"] == day.isoformat()), None)
    if record is None:
        raise KeyError("Date absente de la série Dakhla")
    return {
        "date": record["date"],
        "precipitation_mm": record.get("rain_mm"),
        "precipitation_source": record.get("rain_source"),
        "rain_granule_version": record.get("rain_granule_version"),
        "rain_grid_cell": record.get("rain_grid_cell"),
        "weather": {key: record.get(key) for key in
                    ("wind_ms", "wind_max_ms", "et0_mm", "air_temp_c", "rh_day_pct", "rh_night_pct")},
        "evapotranspiration": ETA_BY_DATE.get(day.isoformat()),
        "risk_assessment": assess(record, field or {}, anomaly or {}),
    }
