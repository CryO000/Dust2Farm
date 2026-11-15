"""Export API-shaped demo responses for the GitHub Pages build."""

from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from .dakhla_data import FIELD, SERIES, analyze_day, daily_series, summary


OUTPUT = Path(__file__).resolve().parents[1] / "public" / "demo-data" / "dakhla"


def _write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main() -> None:
    _write_json(OUTPUT / "summary.json", summary())
    _write_json(OUTPUT / "series.json", {"count": len(SERIES), "rows": daily_series()})
    _write_json(OUTPUT / "field.json", FIELD)
    for row in SERIES:
        day = date.fromisoformat(row["date"])
        _write_json(OUTPUT / "analysis" / f"{day.isoformat()}.json", analyze_day(day))
    print(f"Exported {len(SERIES)} daily Dakhla analyses to {OUTPUT}")


if __name__ == "__main__":
    main()
