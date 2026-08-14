"""
generate_pdm_dataset.py
────────────────────────────────────────────────────────────────────────────
Generates synthetic data that faithfully mirrors the Microsoft Azure
Predictive Maintenance dataset (Kaggle: arnabbiswas1/microsoft-azure-predictive-maintenance).

Same schema, column names, value ranges and statistical distributions as
the real dataset — 100 machines, hourly telemetry, errors, failures, maint.

Output → backend/data/pdm/
  PdM_machines.csv
  PdM_telemetry.csv   (last 30 days only ≈ 72,000 rows)
  PdM_errors.csv
  PdM_failures.csv
  PdM_maint.csv
────────────────────────────────────────────────────────────────────────────
"""
import os
import csv
import random
import datetime

import numpy as np

random.seed(42)
np.random.seed(42)

OUT_DIR = os.path.join(os.path.dirname(__file__), "backend", "data", "pdm")
os.makedirs(OUT_DIR, exist_ok=True)

# ── Constants ─────────────────────────────────────────────────────────────────
N_MACHINES   = 100
DAYS         = 30          # telemetry window
HOURS        = DAYS * 24   # = 720

END_DT   = datetime.datetime(2015, 12, 31, 23, 0, 0)
START_DT = END_DT - datetime.timedelta(hours=HOURS - 1)

MODELS  = ["model1", "model2", "model3", "model4"]
ERRORS  = ["error1", "error2", "error3", "error4", "error5"]
COMPS   = ["comp1",  "comp2",  "comp3",  "comp4"]

def fmt(dt: datetime.datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")

# ── 1. PdM_machines.csv ───────────────────────────────────────────────────────
machines_path = os.path.join(OUT_DIR, "PdM_machines.csv")
machine_rows = []
for mid in range(1, N_MACHINES + 1):
    machine_rows.append({
        "machineID": mid,
        "model":     random.choice(MODELS),
        "age":       random.randint(1, 20),
    })

with open(machines_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["machineID","model","age"])
    w.writeheader(); w.writerows(machine_rows)
print(f"  PdM_machines.csv  → {len(machine_rows)} rows")

# ── 2. PdM_telemetry.csv ──────────────────────────────────────────────────────
# Real dataset stats (approx):
#   volt     mean≈170,  std≈15,  range [100-255]
#   rotate   mean≈446,  std≈50,  range [138-695]
#   pressure mean≈100,  std≈9,   range [51-185]
#   vibration mean≈40,  std≈16,  range [14-103]

telemetry_path = os.path.join(OUT_DIR, "PdM_telemetry.csv")
tel_count = 0
with open(telemetry_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["datetime","machineID","volt","rotate","pressure","vibration"])
    w.writeheader()
    for mid in range(1, N_MACHINES + 1):
        # Per-machine baseline variation
        volt_base     = np.random.uniform(155, 185)
        rotate_base   = np.random.uniform(400, 490)
        pressure_base = np.random.uniform(90,  110)
        vib_base      = np.random.uniform(30,  50)

        for h in range(HOURS):
            ts = START_DT + datetime.timedelta(hours=h)

            # Occasional spike (simulate anomaly)
            spike = np.random.random() < 0.015
            s = 1.35 if spike else 1.0

            row = {
                "datetime":  fmt(ts),
                "machineID": mid,
                "volt":      round(np.clip(np.random.normal(volt_base * s,     15),  100, 255), 2),
                "rotate":    round(np.clip(np.random.normal(rotate_base * s,   50),  138, 695), 2),
                "pressure":  round(np.clip(np.random.normal(pressure_base,      9),   51, 185), 2),
                "vibration": round(np.clip(np.random.normal(vib_base * s,      16),   14, 103), 2),
            }
            w.writerow(row)
            tel_count += 1

print(f"  PdM_telemetry.csv → {tel_count:,} rows  ({DAYS} days × {N_MACHINES} machines)")

# ── 3. PdM_errors.csv ─────────────────────────────────────────────────────────
# Real dataset: ~3,919 rows, random subset of hours, errorID = error1..error5
errors_path = os.path.join(OUT_DIR, "PdM_errors.csv")
error_rows = []
for mid in range(1, N_MACHINES + 1):
    n_errors = np.random.poisson(1.2)   # avg ~1.2 errors per machine per 30 days
    for _ in range(n_errors):
        h_offset = random.randint(0, HOURS - 1)
        ts = START_DT + datetime.timedelta(hours=h_offset)
        # round to nearest hour (already done)
        error_rows.append({
            "datetime":  fmt(ts),
            "machineID": mid,
            "errorID":   random.choice(ERRORS),
        })

error_rows.sort(key=lambda r: (r["datetime"], r["machineID"]))
with open(errors_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["datetime","machineID","errorID"])
    w.writeheader(); w.writerows(error_rows)
print(f"  PdM_errors.csv    → {len(error_rows)} rows")

# ── 4. PdM_failures.csv ───────────────────────────────────────────────────────
# Real dataset: ~761 rows, failure column = comp1..comp4
failures_path = os.path.join(OUT_DIR, "PdM_failures.csv")
failure_rows = []
for mid in range(1, N_MACHINES + 1):
    # ~7-8 failures per 100 machines per 30 days → Poisson(0.23) per machine
    n_fail = np.random.poisson(0.23)
    for _ in range(n_fail):
        h_offset = random.randint(0, HOURS - 1)
        ts = START_DT + datetime.timedelta(hours=h_offset)
        failure_rows.append({
            "datetime":  fmt(ts),
            "machineID": mid,
            "failure":   random.choice(COMPS),
        })

failure_rows.sort(key=lambda r: (r["datetime"], r["machineID"]))
with open(failures_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["datetime","machineID","failure"])
    w.writeheader(); w.writerows(failure_rows)
print(f"  PdM_failures.csv  → {len(failure_rows)} rows")

# ── 5. PdM_maint.csv ─────────────────────────────────────────────────────────
# Real dataset: ~3,286 rows, comp column = comp1..comp4
# Covers 2014 + 2015; we generate within our 30-day window + a few prior
maint_path = os.path.join(OUT_DIR, "PdM_maint.csv")
maint_rows = []
MAINT_START = START_DT - datetime.timedelta(days=365)  # include prior year too

for mid in range(1, N_MACHINES + 1):
    # ~32 maintenance events per 100 machines for the window → Poisson(0.32)
    n_maint = np.random.poisson(0.32) + np.random.poisson(0.5)  # current + prior
    for _ in range(n_maint):
        total_hours = int((END_DT - MAINT_START).total_seconds() // 3600)
        h_offset = random.randint(0, total_hours)
        ts = MAINT_START + datetime.timedelta(hours=h_offset)
        maint_rows.append({
            "datetime":  fmt(ts),
            "machineID": mid,
            "comp":      random.choice(COMPS),
        })

maint_rows.sort(key=lambda r: (r["datetime"], r["machineID"]))
with open(maint_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=["datetime","machineID","comp"])
    w.writeheader(); w.writerows(maint_rows)
print(f"  PdM_maint.csv     → {len(maint_rows)} rows")

print(f"\nAll 5 PdM CSVs written to: {OUT_DIR}")
