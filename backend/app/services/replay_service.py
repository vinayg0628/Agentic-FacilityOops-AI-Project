"""
replay_service.py
─────────────────────────────────────────────────────────────────────────────
Live-replay engine for the Agentic AI For Smart Facility Operations And Optimizations.

Reads the static energy CSV row-by-row and inserts each record into the
energy_usage table on a configurable timer, simulating a live IoT stream
for demos and development.

Configuration (via core/config.py / .env):
  REPLAY_MODE                 bool        master toggle (default: False)
  REPLAY_INTERVAL_SECONDS     int         seconds between inserts (default: 15)
  REPLAY_DURATION_MINUTES     Optional[int]
      • If set  → replay stops cleanly after this many minutes.
      • If None → original indefinite-loop behaviour (no breaking change).

Threading model:
  A single daemon Thread is spawned once at startup via start_replay().
  The thread is a daemon so it never blocks a clean server shutdown.

Demo math (defaults):
  15 s interval × 120 inserts ≈ 30 minutes → ~120 visible dashboard updates.
─────────────────────────────────────────────────────────────────────────────
"""

import csv
import datetime
import logging
import threading
import time

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.energy import EnergyUsage
from app.services.data_service import ENERGY_CSV, EVENTS_CSV, generate_sample_csv_data, FacilityEvent

logger = logging.getLogger("facilityops.replay")

# ── Internal state ────────────────────────────────────────────────────────────
_replay_thread: threading.Thread | None = None


# ── Helper ────────────────────────────────────────────────────────────────────


def _parse_event_row(row: dict) -> FacilityEvent | None:
    try:
        val = row.get("access_granted", "")
        ag = None if val == "" else (val.lower() == "true")
        return FacilityEvent(
            zone_id=str(row["zone_id"]).strip(),
            entity_id=str(row["entity_id"]).strip(),
            entity_type=str(row["entity_type"]).strip(),
            event_type=str(row["event_type"]).strip(),
            access_granted=ag,
            timestamp=datetime.datetime.now().replace(microsecond=0)
        )
    except Exception as exc:
        logger.warning("Replay: skipping malformed event row — %s", exc)
        return None

def _parse_row(row: dict) -> EnergyUsage | None:
    """Convert a CSV row dict into an EnergyUsage ORM object.

    Stamps the record with *now* so the dashboard always shows fresh data
    rather than the historical timestamps baked into the CSV file.
    Returns None if the row is malformed so the loop can skip it gracefully.
    """
    try:
        return EnergyUsage(
            facility_id=str(row["facility_id"]).strip(),
            timestamp=datetime.datetime.now().replace(second=0, microsecond=0),
            electricity_kwh=float(row["electricity_kwh"]),
            water_liters=float(row["water_liters"]),
            hvac_kwh=float(row["hvac_kwh"]),
            lighting_kwh=float(row["lighting_kwh"]),
            solar_generation_kwh=float(row["solar_generation_kwh"]),
            power_factor=float(row["power_factor"]),
            temperature=float(row["temperature"]),
            humidity=float(row["humidity"]),
        )
    except (KeyError, ValueError) as exc:
        logger.warning("Replay: skipping malformed CSV row — %s", exc)
        return None


# ── Core replay loop ──────────────────────────────────────────────────────────

def _replay_loop() -> None:
    """Background thread target.

    Algorithm
    ---------
    1. Record session start time.
    2. Open the CSV and iterate rows.
    3. Before each insert, check whether REPLAY_DURATION_MINUTES has elapsed.
       • Yes → log clean stop message and return (thread exits naturally).
       • No  → insert the row, then sleep REPLAY_INTERVAL_SECONDS.
    4. When the CSV is exhausted before the duration ends, loop back to the
       start of the file and keep going (existing loop behaviour, now
       time-bounded).
    5. If REPLAY_DURATION_MINUTES is None, loop indefinitely — identical to
       the original behaviour; this path is NOT a breaking change.
    """
    # Ensure the CSV exists before we try to open it
    generate_sample_csv_data()

    interval: int = settings.REPLAY_INTERVAL_SECONDS
    duration_minutes: int | None = settings.REPLAY_DURATION_MINUTES
    duration_seconds: float | None = (
        duration_minutes * 60.0 if duration_minutes is not None else None
    )

    session_start: float = time.monotonic()
    rows_inserted: int = 0

    logger.info(
        "Replay session started | interval=%ss | duration=%s",
        interval,
        f"{duration_minutes} min" if duration_minutes is not None else "indefinite",
    )

    while True:
        # ── Open (or re-open) the CSV for one full pass ───────────────────────
        try:
            energy_csv_file = open(ENERGY_CSV, newline="", encoding="utf-8")
            events_csv_file = open(EVENTS_CSV, newline="", encoding="utf-8")
        except FileNotFoundError:
            logger.error("Replay: CSVs not found — aborting replay.")
            return

        with energy_csv_file, events_csv_file:
            energy_reader = csv.DictReader(energy_csv_file)
            events_reader = csv.DictReader(events_csv_file)

            for energy_row, event_row in zip(energy_reader, events_reader):
                # ── Duration guard (checked before every insert) ──────────────
                if duration_seconds is not None:
                    elapsed = time.monotonic() - session_start
                    if elapsed >= duration_seconds:
                        logger.info(
                            "Replay session ended after %s minute%s "
                            "(%d rows inserted).",
                            duration_minutes,
                            "s" if duration_minutes != 1 else "",
                            rows_inserted,
                        )
                        return  # clean stop — thread exits

                # ── Build and persist the ORM records ────────────────────────
                energy_record = _parse_row(energy_row)
                event_record = _parse_event_row(event_row)

                if energy_record is None and event_record is None:
                    continue

                db = SessionLocal()
                try:
                    if energy_record:
                        db.add(energy_record)
                    if event_record:
                        db.add(event_record)
                    db.commit()
                    rows_inserted += 1
                    if energy_record:
                        logger.debug(
                            "Replay insert #%d | facility=%s | ts=%s",
                            rows_inserted,
                            energy_record.facility_id,
                            energy_record.timestamp,
                        )
                except Exception as exc:
                    db.rollback()
                    logger.error("Replay: DB insert failed — %s", exc)
                finally:
                    db.close()

                # ── Wait before the next row ──────────────────────────────────
                time.sleep(interval)

        # ── CSV exhausted; check duration before looping back ─────────────────
        if duration_seconds is not None:
            elapsed = time.monotonic() - session_start
            if elapsed >= duration_seconds:
                logger.info(
                    "Replay session ended after %s minute%s "
                    "(%d rows inserted).",
                    duration_minutes,
                    "s" if duration_minutes != 1 else "",
                    rows_inserted,
                )
                return  # clean stop

        logger.info(
            "Replay: CSV exhausted after %d inserts — looping back to start.",
            rows_inserted,
        )


# ── Public API ────────────────────────────────────────────────────────────────

def start_replay() -> None:
    """Spawn the replay daemon thread (idempotent — safe to call multiple times).

    Only starts the thread when REPLAY_MODE is True; does nothing otherwise so
    existing startup code is unaffected when the flag is off.
    """
    global _replay_thread

    if not settings.REPLAY_MODE:
        logger.debug("Replay: REPLAY_MODE is False — replay thread not started.")
        return

    if _replay_thread is not None and _replay_thread.is_alive():
        logger.warning("Replay: thread already running — ignoring duplicate start().")
        return

    _replay_thread = threading.Thread(
        target=_replay_loop,
        name="facilityops-replay",
        daemon=True,          # never blocks a clean process shutdown
    )
    _replay_thread.start()
    logger.info(
        "Replay daemon thread launched (interval=%ss, duration=%s).",
        settings.REPLAY_INTERVAL_SECONDS,
        f"{settings.REPLAY_DURATION_MINUTES} min"
        if settings.REPLAY_DURATION_MINUTES is not None
        else "indefinite",
    )
