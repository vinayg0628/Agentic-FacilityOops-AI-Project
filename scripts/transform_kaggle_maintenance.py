#!/usr/bin/env python3
"""Transform the Microsoft Azure predictive maintenance Kaggle CSV into this app's schema.

This script reads a Kaggle-style predictive maintenance CSV and inserts rows into the
existing SQLAlchemy tables used by the project:

- equipment
- maintenance_monitoring
- maintenance_alerts
- maintenance_schedule

It is designed to work with the common Azure predictive maintenance dataset columns such as:
- UDI / Machine ID / MachineID
- Product ID / Type
- Air temperature [K]
- Process temperature [K]
- Rotational speed [rpm]
- Torque [Nm]
- Tool wear [min]
- Machine failure / TWF / HDF / PWF / OSF / RNF

Usage:
    python scripts/transform_kaggle_maintenance.py --csv data/maintenance.csv --facility FAC-001
    python scripts/transform_kaggle_maintenance.py --csv data/maintenance.csv --dry-run
"""

from __future__ import annotations

import argparse
import csv
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.core.database import SessionLocal
from app.models.equipment import (
    Equipment,
    MaintenanceAlert,
    MaintenanceMonitoring,
    MaintenanceSchedule,
)


FAILURE_MAP = {
    "TWF": "Tool Wear Failure",
    "HDF": "Heat Dissipation Failure",
    "PWF": "Power Failure",
    "OSF": "Overstrain Failure",
    "RNF": "Random Failure",
}


def safe_float(value: Any) -> float:
    if value is None or value == "":
        return 0.0
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return 0.0


def safe_int(value: Any) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def get_first(row: Dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in row and row.get(key) not in (None, ""):
            return row.get(key)
        normalized = key.strip().lower().replace(" ", "").replace("-", "")
        for actual_key, actual_value in row.items():
            if str(actual_key).strip().lower().replace(" ", "").replace("-", "") == normalized:
                return actual_value
    return None


def normalize_column_name(name: str) -> str:
    return str(name).strip().lower().replace(" ", "").replace("-", "")


def parse_timestamp(value: Any, index: int) -> datetime:
    if value is None or value == "":
        return datetime.utcnow() - timedelta(minutes=index)

    text = str(value).strip()
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d",
    ):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            pass

    try:
        return datetime.fromisoformat(text.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        pass

    try:
        numeric = float(text)
        return datetime.fromtimestamp(numeric)
    except ValueError:
        pass

    return datetime.utcnow() - timedelta(minutes=index)


def kelvin_to_celsius(value: Any) -> float:
    temp = safe_float(value)
    if temp <= 0:
        return 0.0
    return round(temp - 273.15, 2)


def infer_equipment_type(row: Dict[str, Any], fallback: str = "Equipment") -> str:
    candidate = (
        get_first(row, "Type", "Product ID", "Machine type", "Model")
        or get_first(row, "ProductID")
        or fallback
    )
    text = str(candidate).strip()
    if not text:
        return fallback
    if text.lower().startswith("m") and "machine" in text.lower():
        return "Machine"
    return text


def infer_equipment_name(row: Dict[str, Any], index: int) -> str:
    machine_id = (
        get_first(row, "Machine ID", "MachineID", "UDI", "ID")
        or get_first(row, "machineid")
        or f"Machine-{index + 1}"
    )
    return f"Machine-{machine_id}" if str(machine_id).strip().lower().startswith("machine") is False else str(machine_id).strip()


def infer_failure_flags(row: Dict[str, Any]) -> Tuple[List[str], bool]:
    failure_flags: List[str] = []
    for key, label in FAILURE_MAP.items():
        if safe_float(get_first(row, key)) > 0:
            failure_flags.append(label)

    machine_failure = (
        safe_float(get_first(row, "Machine failure", "machine_failure", "Target", "Failure", "label")) > 0
        or safe_float(get_first(row, "Target", "machinefailure")) > 0
    )

    return failure_flags, machine_failure


def infer_issue_and_severity(row: Dict[str, Any]) -> Tuple[str, str, bool]:
    failure_flags, machine_failure = infer_failure_flags(row)

    if machine_failure and failure_flags:
        issue = failure_flags[0]
        severity = "Critical"
        return issue, severity, True

    if failure_flags:
        issue = failure_flags[0]
        severity = "High"
        return issue, severity, True

    if safe_float(get_first(row, "Tool wear [min]", "Tool wear")) > 200:
        issue = "Excessive tool wear"
        severity = "Medium"
        return issue, severity, False

    issue = "Abnormal equipment behavior detected"
    severity = "Low"
    return issue, severity, False


def normalize_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = {}
    for key, value in row.items():
        normalized[str(key).strip()] = value
    return normalized


def add_or_get_equipment(db: Any, facility_id: str, equipment_name: str, equipment_type: str) -> Equipment:
    equipment = (
        db.query(Equipment)
        .filter(Equipment.facility_id == facility_id)
        .filter(Equipment.equipment_name == equipment_name)
        .first()
    )

    if equipment is None:
        equipment = Equipment(
            facility_id=facility_id,
            equipment_name=equipment_name,
            equipment_type=equipment_type,
            manufacturer="Unknown",
            installation_date=datetime.utcnow() - timedelta(days=365 * 3),
            expected_life_years=15,
            location="Site",
            status="Operational",
        )
        db.add(equipment)
        db.commit()
        db.refresh(equipment)

    return equipment


def build_monitoring_record(row: Dict[str, Any], equipment_id: int, index: int) -> MaintenanceMonitoring:
    air_temp = kelvin_to_celsius(get_first(row, "Air temperature [K]", "Air temperature"))
    process_temp = kelvin_to_celsius(get_first(row, "Process temperature [K]", "Process temperature"))
    temp_value = round((air_temp + process_temp) / 2.0, 2) if air_temp or process_temp else 25.0

    rpm = safe_float(get_first(row, "Rotational speed [rpm]", "Rotational speed"))
    torque = safe_float(get_first(row, "Torque [Nm]", "Torque"))
    tool_wear_min = safe_float(get_first(row, "Tool wear [min]", "Tool wear"))
    power = safe_float(get_first(row, "Power [kW]", "Power"))

    vibration = 0.0
    if rpm > 0:
        vibration = round(min(max((rpm / 5000.0) * 2.0, 0.0), 5.0), 3)

    runtime_hours = round(tool_wear_min / 60.0, 2) if tool_wear_min > 0 else round((index + 1) * 0.5, 2)
    pressure = round(max(torque * 0.05, 0.0), 3) if torque > 0 else 1.0
    humidity = 50.0
    power_consumption = round(max(power, torque * rpm / 1000.0), 2) if (power > 0 or torque > 0) else 0.0

    failure_flags, machine_failure = infer_failure_flags(row)
    operating_status = "Fault" if machine_failure or failure_flags else "Running"

    return MaintenanceMonitoring(
        equipment_id=equipment_id,
        timestamp=parse_timestamp(get_first(row, "Timestamp", "Date", "datetime"), index),
        temperature=temp_value,
        vibration=vibration,
        runtime_hours=runtime_hours,
        pressure=pressure,
        humidity=humidity,
        power_consumption=power_consumption,
        operating_status=operating_status,
    )


def build_alert_record(row: Dict[str, Any], equipment_id: int, index: int) -> Optional[MaintenanceAlert]:
    failure_flags, machine_failure = infer_failure_flags(row)
    if not machine_failure and not failure_flags:
        return None

    issue, severity, has_alert = infer_issue_and_severity(row)
    if not has_alert:
        return None

    recommendation_map = {
        "Tool Wear Failure": "Inspect tool wear and replace worn components before the next cycle.",
        "Heat Dissipation Failure": "Check cooling system, airflow, and thermal management components.",
        "Power Failure": "Validate power supply, breaker status, and electrical load balance.",
        "Overstrain Failure": "Reduce operating load and inspect mechanical structure for stress damage.",
        "Random Failure": "Run diagnostic checks and review abnormal operating pattern for hidden fault sources.",
    }

    recommendation = recommendation_map.get(issue, "Inspect the asset, review the telemetry trend, and schedule preventive maintenance.")

    return MaintenanceAlert(
        equipment_id=equipment_id,
        timestamp=parse_timestamp(get_first(row, "Timestamp", "Date", "datetime"), index),
        severity=severity,
        issue=issue,
        recommendation=recommendation,
        status="Open",
    )


def build_schedule_record(row: Dict[str, Any], equipment_id: int, index: int) -> Optional[MaintenanceSchedule]:
    failure_flags, machine_failure = infer_failure_flags(row)
    if not machine_failure and not failure_flags:
        return None

    issue, severity, _ = infer_issue_and_severity(row)

    now = datetime.utcnow()
    days_ahead = 7 if severity == "Critical" else 14 if severity == "High" else 21

    maintenance_type = "Predictive"
    if severity == "Critical":
        maintenance_type = "Emergency"
    elif severity == "High":
        maintenance_type = "Corrective"

    estimate_hours = 2.0 if severity == "Low" else 4.0 if severity == "Medium" else 8.0
    estimate_cost = 500.0 if severity == "Low" else 1500.0 if severity == "High" else 4000.0

    return MaintenanceSchedule(
        equipment_id=equipment_id,
        next_service_date=now + timedelta(days=days_ahead),
        maintenance_type=maintenance_type,
        priority=severity,
        assigned_engineer="Auto-assigned",
        status="Scheduled",
        estimated_duration_hours=estimate_hours,
        estimated_cost_usd=estimate_cost,
        notes=f"Generated from {issue} signal",
    )


def transform_csv(csv_path: str, facility_id: str, dry_run: bool = False) -> Dict[str, int]:
    stats = {"equipment": 0, "monitoring": 0, "alerts": 0, "schedules": 0, "rows_processed": 0}

    with open(csv_path, "r", encoding="utf-8-sig", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        if reader.fieldnames is None:
            raise ValueError(f"CSV file does not contain a header row: {csv_path}")

        db = SessionLocal()
        try:
            for index, raw_row in enumerate(reader):
                row = normalize_row(raw_row)
                stats["rows_processed"] += 1

                equipment_name = infer_equipment_name(row, index)
                equipment_type = infer_equipment_type(row, fallback="Equipment")
                equipment = add_or_get_equipment(db, facility_id, equipment_name, equipment_type)

                if not dry_run:
                    monitoring = build_monitoring_record(row, equipment.equipment_id, index)
                    db.add(monitoring)
                    stats["monitoring"] += 1

                    alert = build_alert_record(row, equipment.equipment_id, index)
                    if alert is not None:
                        db.add(alert)
                        stats["alerts"] += 1

                    schedule = build_schedule_record(row, equipment.equipment_id, index)
                    if schedule is not None:
                        db.add(schedule)
                        stats["schedules"] += 1

                stats["equipment"] = max(stats["equipment"], 1)

            if not dry_run:
                db.commit()
        finally:
            db.close()

    return stats


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transform the Kaggle predictive maintenance CSV into this app's maintenance schema.")
    parser.add_argument("--csv", required=True, help="Path to the Kaggle CSV file")
    parser.add_argument("--facility", default="FAC-001", help="Facility ID to assign for imported assets")
    parser.add_argument("--dry-run", action="store_true", help="Preview the transformation without writing to the database")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    csv_path = Path(args.csv).expanduser().resolve()

    if not csv_path.exists():
        print(f"CSV file not found: {csv_path}")
        return 1

    try:
        stats = transform_csv(str(csv_path), facility_id=args.facility, dry_run=args.dry_run)
    except Exception as exc:  # pragma: no cover
        print(f"Transformation failed: {exc}")
        return 1

    print("Transformation complete.")
    print(f"Rows processed: {stats['rows_processed']}")
    print(f"Equipment created/used: {stats['equipment']}")
    print(f"Monitoring rows: {stats['monitoring']}")
    print(f"Alerts created: {stats['alerts']}")
    print(f"Schedules created: {stats['schedules']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
