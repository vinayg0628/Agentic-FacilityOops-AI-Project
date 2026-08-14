import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.facility import Facility
from app.models.energy import EnergyUsage
from app.models.alert import EnergyAlert

GRID_EMISSION_FACTOR_KG_CO2_PER_KWH = 0.82  # Standard commercial grid emission factor

def compute_energy_analytics(db: Session, facility_id: str = None, start_date: str = None, end_date: str = None):
    # Fetch base query
    query = db.query(EnergyUsage)
    if facility_id and facility_id != "ALL":
        query = query.filter(EnergyUsage.facility_id == facility_id)
    
    if start_date:
        try:
            s_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(EnergyUsage.timestamp >= s_dt)
        except ValueError:
            pass
            
    if end_date:
        try:
            e_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(EnergyUsage.timestamp < e_dt)
        except ValueError:
            pass

    records = query.order_by(EnergyUsage.timestamp.asc()).all()
    
    if not records:
        # Return fallback default schema
        return {
            "total_electricity_kwh": 0.0,
            "today_electricity_kwh": 0.0,
            "yesterday_electricity_kwh": 0.0,
            "electricity_change_pct": 0.0,
            "today_water_liters": 0.0,
            "hvac_total_kwh": 0.0,
            "lighting_total_kwh": 0.0,
            "solar_total_kwh": 0.0,
            "active_alerts_count": 0,
            "critical_alerts_count": 0,
            "energy_efficiency_score": 85.0,
            "carbon_emissions_ton_co2": 0.0,
            "average_hourly_kwh": 0.0,
            "peak_consumption_hour": "14:00",
            "peak_consumption_kwh": 0.0,
            "hourly_trend": [],
            "daily_trend": [],
            "monthly_trend": [],
            "category_breakdown": [],
            "facility_comparison": [],
            "peak_hours": []
        }

    # Convert SQLAlchemy models to Pandas DataFrame for high-performance vectorized operations
    data = []
    for r in records:
        data.append({
            "energy_id": r.energy_id,
            "facility_id": r.facility_id,
            "timestamp": r.timestamp,
            "electricity_kwh": r.electricity_kwh,
            "water_liters": r.water_liters,
            "hvac_kwh": r.hvac_kwh,
            "lighting_kwh": r.lighting_kwh,
            "solar_generation_kwh": r.solar_generation_kwh,
            "power_factor": r.power_factor,
            "temperature": r.temperature,
            "humidity": r.humidity
        })
        
    df = pd.DataFrame(data)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["date"] = df["timestamp"].dt.date
    df["hour"] = df["timestamp"].dt.hour

    total_electricity = float(df["electricity_kwh"].sum())
    total_water = float(df["water_liters"].sum())
    total_hvac = float(df["hvac_kwh"].sum())
    total_lighting = float(df["lighting_kwh"].sum())
    total_solar = float(df["solar_generation_kwh"].sum())
    avg_hourly = float(df["electricity_kwh"].mean()) if len(df) > 0 else 0.0

    # Today vs Yesterday logic
    latest_date = df["date"].max()
    yesterday_date = latest_date - timedelta(days=1)

    df_today = df[df["date"] == latest_date]
    df_yesterday = df[df["date"] == yesterday_date]

    today_electricity = float(df_today["electricity_kwh"].sum())
    yesterday_electricity = float(df_yesterday["electricity_kwh"].sum())
    today_water = float(df_today["water_liters"].sum())

    if yesterday_electricity > 0:
        electricity_change_pct = round(((today_electricity - yesterday_electricity) / yesterday_electricity) * 100, 2)
    else:
        electricity_change_pct = 0.0

    # Peak hour computation
    hourly_grp = df.groupby("hour")["electricity_kwh"].mean()
    peak_hour = int(hourly_grp.idxmax()) if len(hourly_grp) > 0 else 14
    peak_kwh = float(hourly_grp.max()) if len(hourly_grp) > 0 else 0.0
    peak_hour_str = f"{peak_hour:02d}:00 - {peak_hour+1:02d}:00"

    peak_hours_list = []
    for h in range(24):
        avg_h_kwh = float(hourly_grp.get(h, 0.0))
        peak_hours_list.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "avg_kwh": round(avg_h_kwh, 2),
            "is_peak": (h == peak_hour or (peak_kwh > 0 and avg_h_kwh >= peak_kwh * 0.9))
        })

    # Hourly Trend (Full 24-Hour Diurnal Telemetry Stream)
    df_recent_24 = df[df["timestamp"] >= (df["timestamp"].max() - timedelta(hours=24))]
    if len(df_recent_24) >= 12:
        df_hourly_agg = df_recent_24.groupby("hour").agg({
            "electricity_kwh": "mean",
            "hvac_kwh": "mean",
            "lighting_kwh": "mean",
            "solar_generation_kwh": "mean",
            "water_liters": "mean"
        }).reset_index()
    else:
        df_hourly_agg = df.groupby("hour").agg({
            "electricity_kwh": "mean",
            "hvac_kwh": "mean",
            "lighting_kwh": "mean",
            "solar_generation_kwh": "mean",
            "water_liters": "mean"
        }).reset_index()

    hourly_trend = []
    for h in range(24):
        match_row = df_hourly_agg[df_hourly_agg["hour"] == h]
        if not match_row.empty:
            r = match_row.iloc[0]
            elec = round(float(r["electricity_kwh"]), 2)
            hvac = round(float(r["hvac_kwh"]), 2)
            light = round(float(r["lighting_kwh"]), 2)
            solar = round(float(r["solar_generation_kwh"]), 2)
            water = round(float(r["water_liters"]), 1)
        else:
            elec = hvac = light = solar = water = 0.0

        hourly_trend.append({
            "hour": f"{h:02d}:00",
            "electricity_kwh": elec,
            "hvac_kwh": hvac,
            "lighting_kwh": light,
            "solar_kwh": solar,
            "water_liters": water
        })

    # Daily Trend (Last 7 Days)
    df_daily = df.groupby("date").agg({
        "electricity_kwh": "sum",
        "water_liters": "sum",
        "hvac_kwh": "sum",
        "solar_generation_kwh": "sum"
    }).reset_index().tail(7)

    daily_trend = []
    for _, row in df_daily.iterrows():
        daily_trend.append({
            "date": str(row["date"]),
            "electricity_kwh": round(float(row["electricity_kwh"]), 2),
            "water_liters": round(float(row["water_liters"]), 1),
            "hvac_kwh": round(float(row["hvac_kwh"]), 2),
            "solar_kwh": round(float(row["solar_generation_kwh"]), 2)
        })

    # Monthly Trend (30 days)
    df_monthly = df.groupby("date").agg({
        "electricity_kwh": "sum",
        "water_liters": "sum",
        "hvac_kwh": "sum",
        "solar_generation_kwh": "sum"
    }).reset_index().tail(30)

    monthly_trend = []
    for _, row in df_monthly.iterrows():
        monthly_trend.append({
            "date": str(row["date"]),
            "electricity_kwh": round(float(row["electricity_kwh"]), 2),
            "water_liters": round(float(row["water_liters"]), 1),
            "hvac_kwh": round(float(row["hvac_kwh"]), 2),
            "solar_kwh": round(float(row["solar_generation_kwh"]), 2)
        })

    # Category Breakdown (HVAC, Lighting, Solar Offset, Plug Loads / Equipment)
    plug_loads_kwh = max(0.0, total_electricity - total_hvac - total_lighting)
    cat_total = total_electricity if total_electricity > 0 else 1.0
    category_breakdown = [
        {
            "category": "HVAC",
            "kwh": round(total_hvac, 2),
            "percentage": round((total_hvac / cat_total) * 100, 1)
        },
        {
            "category": "Lighting",
            "kwh": round(total_lighting, 2),
            "percentage": round((total_lighting / cat_total) * 100, 1)
        },
        {
            "category": "Equipment & Plug Loads",
            "kwh": round(plug_loads_kwh, 2),
            "percentage": round((plug_loads_kwh / cat_total) * 100, 1)
        },
        {
            "category": "Solar Offsetting",
            "kwh": round(total_solar, 2),
            "percentage": round((total_solar / cat_total) * 100, 1)
        }
    ]

    # Facility Comparison
    facilities = db.query(Facility).all()
    facility_map = {f.facility_id: f for f in facilities}
    
    fac_grp = df.groupby("facility_id").agg({
        "electricity_kwh": "sum",
        "water_liters": "sum",
        "power_factor": "mean",
        "hvac_kwh": "sum"
    }).reset_index()

    facility_comparison = []
    for _, row in fac_grp.iterrows():
        f_id = row["facility_id"]
        f_obj = facility_map.get(f_id)
        f_name = f_obj.facility_name if f_obj else f_id
        f_type = f_obj.facility_type if f_obj else "Commercial"
        
        f_elec = float(row["electricity_kwh"])
        f_water = float(row["water_liters"])
        f_pf = float(row["power_factor"])
        f_hvac = float(row["hvac_kwh"])

        # Energy Efficiency Score formula (base 100 - penalties for bad PF and high HVAC ratio)
        hvac_pct = (f_hvac / f_elec) if f_elec > 0 else 0.45
        pf_penalty = max(0.0, (0.95 - f_pf) * 100)
        hvac_penalty = max(0.0, (hvac_pct - 0.45) * 60)
        score = round(max(50.0, min(98.0, 95.0 - pf_penalty - hvac_penalty)), 1)
        carbon_kg = round(f_elec * GRID_EMISSION_FACTOR_KG_CO2_PER_KWH, 2)

        facility_comparison.append({
            "facility_id": f_id,
            "facility_name": f_name,
            "facility_type": f_type,
            "electricity_kwh": round(f_elec, 2),
            "water_liters": round(f_water, 1),
            "efficiency_score": score,
            "carbon_emissions_kg": carbon_kg
        })

    # Overall Efficiency Score and Carbon Footprint
    avg_pf = float(df["power_factor"].mean()) if len(df) > 0 else 0.95
    hvac_ratio_overall = total_hvac / total_electricity if total_electricity > 0 else 0.45
    overall_score = round(max(50.0, min(98.0, 95.0 - max(0.0, (0.95 - avg_pf) * 100) - max(0.0, (hvac_ratio_overall - 0.45) * 50))), 1)

    carbon_ton_co2 = round((total_electricity * GRID_EMISSION_FACTOR_KG_CO2_PER_KWH) / 1000.0, 2)

    # Active & Critical Alerts count
    active_alerts_q = db.query(EnergyAlert).filter(EnergyAlert.status != "Resolved")
    if facility_id and facility_id != "ALL":
        active_alerts_q = active_alerts_q.filter(EnergyAlert.facility_id == facility_id)
    
    active_alerts_count = active_alerts_q.count()
    critical_alerts_count = active_alerts_q.filter(EnergyAlert.severity == "Critical").count()

    return {
        "total_electricity_kwh": round(total_electricity, 2),
        "today_electricity_kwh": round(today_electricity, 2),
        "yesterday_electricity_kwh": round(yesterday_electricity, 2),
        "electricity_change_pct": electricity_change_pct,
        "today_water_liters": round(today_water, 1),
        "hvac_total_kwh": round(total_hvac, 2),
        "lighting_total_kwh": round(total_lighting, 2),
        "solar_total_kwh": round(total_solar, 2),
        "active_alerts_count": active_alerts_count,
        "critical_alerts_count": critical_alerts_count,
        "energy_efficiency_score": overall_score,
        "carbon_emissions_ton_co2": carbon_ton_co2,
        "average_hourly_kwh": round(avg_hourly, 2),
        "peak_consumption_hour": peak_hour_str,
        "peak_consumption_kwh": round(peak_kwh, 2),
        "hourly_trend": hourly_trend,
        "daily_trend": daily_trend,
        "monthly_trend": monthly_trend,
        "category_breakdown": category_breakdown,
        "facility_comparison": facility_comparison,
        "peak_hours": peak_hours_list
    }
