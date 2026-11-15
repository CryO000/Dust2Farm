"""Indicateurs journaliers d'inspection pour Dakhla Field01, Python standard.

Entrées terrain éventuelles de la même zone, du même jour et du même
cycle pour l'hydraulique. Les références de débit et de pression doivent
correspondre à la même configuration de pompe et de vannes.
"""

from math import isfinite

FIELD_SCHEMA = {
    "irrigation_active": "booléen : réseau en fonctionnement lors des mesures",
    "flow_lph": "Débit de zone mesuré, L/h",
    "expected_flow_lph": "Débit de référence dans cette configuration, L/h",
    "pressure_end_bar": "Pression au bout de la ligne, bar",
    "expected_pressure_end_bar": "Pression nominale au bout de la ligne, bar",
    "filter_delta_bar": "Différence de pression de part et d'autre du filtre, bar",
    "filter_warning_bar": "Seuil local de perte de charge du filtre, bar",
    "suspended_solids_mg_l": "Matières en suspension mesurées dans l'eau, mg/L",
    "tss_warning_mg_l": "Seuil local de matières en suspension, mg/L",
    "ec_dsm": "Conductivité électrique de l'eau d'irrigation, dS/m",
    "ec_warning_dsm": "Seuil local de conductivité de l'eau, dS/m",
    "calcite_saturation_index": "Indice de saturation de la calcite issu d'une analyse de l'eau",
    "soil_ece_dsm": "Conductivité de l'extrait de pâte saturée du sol (ECe), dS/m",
    "soil_warning_ece_dsm": "Seuil de décision local pour l'ECe du sol, dS/m",
    "bare_soil_fraction": "Fraction observée de sol exposé dans la zone (0 à 1)",
    "bare_fraction_warning": "Seuil de fraction exposée pour l'examen d'érosion (démo 0,5)",
    "flow_high_ratio": "Seuil débit / référence pour le surdébit (démo 1,10)",
    "flow_low_ratio": "Seuil débit / référence pour la restriction (démo 0,90)",
    "pressure_low_ratio": "Seuil pression / référence pour la chute de pression (démo 0,85)",
    "wind_max_warning_ms": "Seuil local pour le maximum horaire du vent à 10 m, m/s",
    "rain_warning_mm": "Seuil local de précipitation journalière, mm",
}

def _validate(field):
    if not isinstance(field, dict):
        raise ValueError("field doit être un objet")
    for key, value in field.items():
        if value is None or key not in FIELD_SCHEMA:
            continue
        if key == "irrigation_active":
            if type(value) is not bool:
                raise ValueError("irrigation_active doit être un booléen")
            continue
        if type(value) not in (int, float) or not isfinite(value):
            raise ValueError(f"{key} doit être un nombre fini")
        if key != "calcite_saturation_index" and value < 0:
            raise ValueError(f"{key} doit être positif ou nul")
        if key in ("bare_soil_fraction", "bare_fraction_warning") and value > 1:
            raise ValueError(f"{key} doit rester entre 0 et 1")
        if (key.startswith("expected_") or "warning" in key or key.endswith("_ratio")) and value == 0:
            raise ValueError(f"{key} doit être strictement positif")
        if key == "flow_high_ratio" and value <= 1:
            raise ValueError("flow_high_ratio doit dépasser 1")
        if key in ("flow_low_ratio", "pressure_low_ratio") and value >= 1:
            raise ValueError(f"{key} doit être inférieur à 1")

def _record(status, evidence, missing, action):
    return dict(status=status, evidence=evidence, missing=missing, action=action)

def _present(source, keys):
    return {key:source[key] for key in keys if source.get(key) is not None}

def _above(values, key, limit):
    return values.get(key) is not None and values.get(limit) is not None and values[key] >= values[limit]

def _rh(row):
    def phase(night):
        name = "night" if night else "day"
        key = f"rh_{name}_pct"
        mean = row.get(key)
        hours = row.get(f"rh_{name}_hours")
        upper = row.get("rh_night_above_80_hours" if night else "rh_day_above_70_hours")
        lower = None if night else row.get("rh_day_below_60_hours")
        target = [None, 80] if night else [60, 70]
        mean_status = "indisponible"
        if mean is not None and hours != 0:
            mean_status = "au_dessus" if mean > target[1] else "dans_la_consigne"
            if not night and mean < target[0]:
                mean_status = "au_dessous"
        return dict(mean_pct=mean, target_pct=target, status_moyenne=mean_status,
                    hours=hours, hours_above=upper, hours_below=lower,
                    status_heures=("indisponible" if hours is None or not hours or upper is None
                                   or (not night and lower is None) else
                                   "hors_consigne" if upper or lower else "dans_la_consigne"))
    day, night = phase(False), phase(True)
    return {"status": ("hors_consigne" if any(x["status_heures"] == "hors_consigne"
                or x["status_moyenne"] in ("au_dessous","au_dessus") for x in (day,night))
                else "dans_la_consigne" if all(x["status_heures"] == "dans_la_consigne" for x in (day,night))
                else "indetermine"), "day":day, "night":night,
            "source":"Air extérieur régional MERRA-2. Consignes tomate fournies par l’utilisateur."}

def _hydraulic(field):
    q0, p0 = field.get("expected_flow_lph"), field.get("expected_pressure_end_bar")
    running = field.get("irrigation_active")
    flow = field["flow_lph"]/q0 if q0 and field.get("flow_lph") is not None and running else None
    pressure = field["pressure_end_bar"]/p0 if p0 and field.get("pressure_end_bar") is not None and running else None
    high = field.get("flow_high_ratio") or 1.10
    low = field.get("flow_low_ratio") or 0.90
    pressure_low = field.get("pressure_low_ratio") or 0.85
    context = _present(field, ("irrigation_active","flow_lph","expected_flow_lph","pressure_end_bar","expected_pressure_end_bar"))
    if flow is not None:
        context["flow_ratio"] = round(flow, 4)
    if pressure is not None:
        context["pressure_ratio"] = round(pressure, 4)
    flow_missing = [key for key in ("irrigation_active","flow_lph","expected_flow_lph") if field.get(key) is None]
    leak_missing = flow_missing + [key for key in ("pressure_end_bar","expected_pressure_end_bar") if field.get(key) is None]
    lost_pressure = pressure is not None and pressure <= pressure_low
    excess = flow is not None and flow >= high
    if running is False:
        leak_status = "hors_cycle"
    elif flow is None or pressure is None:
        leak_status = "indetermine"
    else:
        leak_status = "a_inspecter" if excess and lost_pressure else "signature_absente"
    leak = _record(leak_status, dict(context, flow_high_ratio=high,pressure_low_ratio=pressure_low),
                   leak_missing,"Contrôler vannes et pression, puis rechercher une fuite sur le tronçon.")
    reduced = flow is not None and flow <= low
    tss_alert = _above(field, "suspended_solids_mg_l", "tss_warning_mg_l")
    filter_alert = _above(field, "filter_delta_bar", "filter_warning_bar")
    salt_alert = field.get("calcite_saturation_index") is not None and field["calcite_saturation_index"] > 0
    def clog(evidence, missing, supported, action):
        if running is False:
            status = "hors_cycle"
        elif flow is None:
            status = "indetermine"
        elif reduced and supported:
            status = "a_inspecter"
        elif reduced:
            status = "restriction_cause_indeterminee"
        else:
            status = "signature_absente"
        return _record(status,dict(context, flow_low_ratio=low, **evidence),
                       flow_missing + missing, action)
    solid_keys = ("suspended_solids_mg_l","tss_warning_mg_l")
    solid = _present(field, solid_keys + ("filter_delta_bar","filter_warning_bar"))
    if "filter_warning_bar" in solid and "filter_delta_bar" in solid:
        solid["filter_above_limit"] = filter_alert
    mud = clog(solid,[k for k in solid_keys if field.get(k) is None],tss_alert,
               "Vérifier le filtre et prélever le dépôt dans la buse. Identifier la fraction minérale ou organique.")
    mineral = _present(field,("calcite_saturation_index","ec_dsm","ec_warning_dsm"))
    if "ec_dsm" in mineral and "ec_warning_dsm" in mineral:
        mineral["water_ec_above_limit"] = _above(field,"ec_dsm","ec_warning_dsm")
    salt = clog(mineral,[] if "calcite_saturation_index" in mineral else ["calcite_saturation_index"],
                salt_alert,"Inspecter la buse et analyser le dépôt. L’indice de saturation porte sur la calcite.")
    return leak,mud,salt

def assess(row, field=None, anomaly=None):
    """Combine daily context, optional field readings and signed anomaly drivers."""
    field = {} if field is None else field
    _validate(field)
    drivers = (anomaly or {}).get("drivers") or {}
    optical = row.get("satellite_observed") is True
    context = _present(row, ("rain_mm","wind_max_ms","wind_ms"))
    if optical:
        context.update(_present(row, ("bare_fraction","ndvi")))
    exposure = field.get("bare_soil_fraction")
    if exposure is None and optical:
        exposure = row.get("bare_fraction")
    cover_limit = field.get("bare_fraction_warning") or 0.50
    cover = exposure is not None and exposure >= cover_limit
    erosion_drivers = []
    for key, limit in (("wind_max_ms","wind_max_warning_ms"),("rain_mm","rain_warning_mm")):
        measurement = row.get(key)
        if measurement is not None and (drivers.get(key) == "high" or
                (field.get(limit) is not None and measurement >= field[limit])):
            erosion_drivers.append(key)
    context.update(exposed_fraction=exposure, exposed_fraction_threshold=cover_limit,
                   forcing_above_reference=erosion_drivers)
    context.update(_present(field, ("wind_max_warning_ms","rain_warning_mm")))
    erosion = _record("exposition_a_inspecter" if cover and erosion_drivers else "indetermine",
                      context,["transport de sédiments ou relevé d’érosion"],
                      "Examiner les surfaces exposées après le vent ou la pluie et mesurer la perte de sol.")
    soil = _present(field,("soil_ece_dsm","soil_warning_ece_dsm"))
    if optical:
        soil.update(_present(row, ("si_bare","ndsi_bare","bare_fraction","ndvi")))
    if field.get("soil_ece_dsm") is not None and field.get("soil_warning_ece_dsm") is not None:
        soil_status = "ece_au_seuil_ou_plus" if _above(field,"soil_ece_dsm","soil_warning_ece_dsm") else "ece_sous_seuil"
    elif optical and soil.get("bare_fraction",0) > 0 and soil.get("si_bare") is not None and drivers.get("si_bare") == "high":
        soil_status = "surface_a_echantillonner"
    else:
        soil_status = "indetermine"
    salinity = _record(soil_status,soil,[k for k in ("soil_ece_dsm","soil_warning_ece_dsm") if field.get(k) is None],
                       "Échantillonner le sol à la profondeur racinaire et comparer l’ECe au seuil local.")
    leak,mud,salt = _hydraulic(field)
    return {"tomato_air_rh":_rh(row),"fuite":leak,"erosion":erosion,"salinite_sol":salinity,
            "colmatage_boue":mud,"colmatage_sel":salt}
