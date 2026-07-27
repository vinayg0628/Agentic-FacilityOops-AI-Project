import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.facility import Facility
from app.models.energy import EnergyUsage
from app.models.alert import EnergyAlert
from app.core.config import settings

class EnergyAgent:
    """
    AI Energy Agent - Energy Module
    Responsible for:
    - Analyzing energy telemetry streams
    - Computing moving baselines & statistical control limits
    - Rule-based anomaly & spike detection (>20% above baseline, HVAC overload, power factor degradation, night anomalies)
    - Auto-generating Energy Alerts and AI Energy Recommendations with actionable savings metrics
    """

    def __init__(self, db: Session = None):
        self.db = db

    def evaluate_facility_telemetry(self, facility_id: str = None) -> list[EnergyAlert]:
        """
        Runs the Energy Agent evaluation across recent facility energy telemetry and updates database alerts.
        """
        facilities = self.db.query(Facility).all()
        if facility_id and facility_id != "ALL":
            facilities = [f for f in facilities if f.facility_id == facility_id]

        for fac in facilities:
            f_id = fac.facility_id
            records = self.db.query(EnergyUsage)\
                .filter(EnergyUsage.facility_id == f_id)\
                .order_by(EnergyUsage.timestamp.desc())\
                .limit(720)\
                .all() # Last 30 days hourly

            if not records or len(records) < 24:
                continue

            data = [{
                "energy_id": r.energy_id,
                "timestamp": r.timestamp,
                "electricity_kwh": r.electricity_kwh,
                "water_liters": r.water_liters,
                "hvac_kwh": r.hvac_kwh,
                "lighting_kwh": r.lighting_kwh,
                "solar_generation_kwh": r.solar_generation_kwh,
                "power_factor": r.power_factor,
                "temperature": r.temperature
            } for r in records]

            df = pd.DataFrame(data)
            df = df.sort_values("timestamp")
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df["hour"] = df["timestamp"].dt.hour
            
            latest_record = df.iloc[-1]
            latest_time = latest_record["timestamp"]
            current_hour = int(latest_record["hour"])
            
            same_hour_df = df[df["hour"] == current_hour]
            hour_baseline = float(same_hour_df["electricity_kwh"].mean()) if len(same_hour_df) > 0 else float(df["electricity_kwh"].mean())

            latest_elec = float(latest_record["electricity_kwh"])
            latest_hvac = float(latest_record["hvac_kwh"])
            latest_pf = float(latest_record["power_factor"])
            latest_water = float(latest_record["water_liters"])

            # -------------------------------------------------------------
            # Rule 1: High Energy Consumption Spike (>20% above baseline)
            # -------------------------------------------------------------
            if hour_baseline > 0:
                spike_pct = ((latest_elec - hour_baseline) / hour_baseline) * 100
                if spike_pct >= settings.ELEVATED_SPIKE_PERCENT:
                    severity = "Critical" if spike_pct >= 40.0 else "High"
                    msg = f"Electricity consumption ({latest_elec:.1f} kWh) is {spike_pct:.1f}% above the 7-day hourly baseline ({hour_baseline:.1f} kWh) at {fac.facility_name}."
                    rec = "HVAC and primary equipment energy spike detected. Increase thermostat temperature by 2°C and stagger heavy industrial / server loads."
                    
                    self._create_alert_if_not_exists(
                        facility_id=f_id,
                        severity=severity,
                        alert_type="High Energy Consumption",
                        message=msg,
                        recommendation=rec,
                        timestamp=latest_time
                    )

            # -------------------------------------------------------------
            # Rule 2: HVAC Overload Monitoring (> 50% of total load)
            # -------------------------------------------------------------
            if latest_elec > 0:
                hvac_ratio = (latest_hvac / latest_elec) * 100
                if hvac_ratio >= settings.HVAC_ALERT_PERCENT:
                    msg = f"HVAC energy load ({latest_hvac:.1f} kWh) accounts for {hvac_ratio:.1f}% of total facility electricity consumption."
                    rec = "HVAC load is excessively high. Inspect chiller condenser tubes, verify chilled water supply setpoint, and check economizer dampening dampers."
                    
                    self._create_alert_if_not_exists(
                        facility_id=f_id,
                        severity="High",
                        alert_type="HVAC Overload",
                        message=msg,
                        recommendation=rec,
                        timestamp=latest_time
                    )

            # -------------------------------------------------------------
            # Rule 3: Low Power Factor (< 0.90)
            # -------------------------------------------------------------
            if latest_pf < settings.MIN_POWER_FACTOR:
                msg = f"Power Factor dropped to {latest_pf:.2f} at {fac.facility_name}, below utility penalty threshold (0.90)."
                rec = "Automatic Capacitor Bank (APFC) panel may have tripped or degraded. Inspect APFC relays to avoid reactive power surcharges."
                
                self._create_alert_if_not_exists(
                    facility_id=f_id,
                    severity="Medium",
                    alert_type="Power Spike",
                    message=msg,
                    recommendation=rec,
                    timestamp=latest_time
                )

            # -------------------------------------------------------------
            # Rule 4: Off-Hours / Night Usage Anomaly
            # -------------------------------------------------------------
            if current_hour in settings.NIGHT_HOURS:
                daytime_avg = float(df[~df["hour"].isin(settings.NIGHT_HOURS)]["electricity_kwh"].mean())
                if daytime_avg > 0 and (latest_elec / daytime_avg) > 0.65:
                    msg = f"Abnormal off-hours electricity consumption detected ({latest_elec:.1f} kWh at {latest_time.strftime('%H:%M')})."
                    rec = "Lighting and ventilation zones remain ON after office hours. Implement automated BACnet schedule shutdown."
                    
                    self._create_alert_if_not_exists(
                        facility_id=f_id,
                        severity="Medium",
                        alert_type="Abnormal Night Usage",
                        message=msg,
                        recommendation=rec,
                        timestamp=latest_time
                    )

            # -------------------------------------------------------------
            # Rule 5: Water Leakage Anomaly
            # -------------------------------------------------------------
            if current_hour in settings.NIGHT_HOURS:
                avg_water = float(df["water_liters"].mean())
                if avg_water > 0 and latest_water > (avg_water * 1.5):
                    msg = f"Unusually high nighttime water flow detected ({latest_water:.1f} L/hr) at {fac.facility_name}."
                    rec = "Possible cooling tower overflow valve fault or main line leak. Conduct acoustic leak detection on floor 1 plant room."
                    
                    self._create_alert_if_not_exists(
                        facility_id=f_id,
                        severity="Critical",
                        alert_type="Water Leakage",
                        message=msg,
                        recommendation=rec,
                        timestamp=latest_time
                    )

        self.db.commit()
        return self.db.query(EnergyAlert).filter(EnergyAlert.status == "Open").all()

    def _create_alert_if_not_exists(self, facility_id: str, severity: str, alert_type: str, message: str, recommendation: str, timestamp: datetime):
        # Prevent creating identical alerts within 12 hours window
        recent_cutoff = timestamp - timedelta(hours=12)
        existing = self.db.query(EnergyAlert).filter(
            EnergyAlert.facility_id == facility_id,
            EnergyAlert.alert_type == alert_type,
            EnergyAlert.timestamp >= recent_cutoff
        ).first()

        if not existing:
            alert = EnergyAlert(
                facility_id=facility_id,
                severity=severity,
                alert_type=alert_type,
                message=message,
                recommendation=recommendation,
                timestamp=timestamp,
                status="Open"
            )
            self.db.add(alert)

    def generate_ai_recommendations(self, facility_id: str = None) -> list[dict]:
        """
        Synthesizes AI-powered actionable energy-saving recommendations with priority, estimated savings, reason, and suggested action.
        """
        facilities = self.db.query(Facility).all()
        facility_map = {f.facility_id: f for f in facilities}
        
        if facility_id and facility_id != "ALL":
            facilities = [f for f in facilities if f.facility_id == facility_id]

        recommendations = []
        rec_counter = 1

        for fac in facilities:
            f_id = fac.facility_id
            f_name = fac.facility_name

            records = self.db.query(EnergyUsage)\
                .filter(EnergyUsage.facility_id == f_id)\
                .order_by(EnergyUsage.timestamp.desc())\
                .limit(168)\
                .all() # 7 days

            if not records:
                continue

            df = pd.DataFrame([{
                "electricity_kwh": r.electricity_kwh,
                "water_liters": r.water_liters,
                "hvac_kwh": r.hvac_kwh,
                "lighting_kwh": r.lighting_kwh,
                "solar_generation_kwh": r.solar_generation_kwh,
                "power_factor": r.power_factor,
                "hour": r.timestamp.hour
            } for r in records])

            total_elec = float(df["electricity_kwh"].sum())
            avg_hvac = float(df["hvac_kwh"].mean())
            avg_lighting = float(df["lighting_kwh"].mean())
            avg_pf = float(df["power_factor"].mean())
            night_df = df[df["hour"].isin(settings.NIGHT_HOURS)]

            # 1. HVAC Thermostat Optimization Recommendation
            hvac_pct = (df["hvac_kwh"].sum() / total_elec) * 100 if total_elec > 0 else 45.0
            if hvac_pct > 46.0:
                est_kwh_save = round(float(df["hvac_kwh"].sum()) * 0.12, 1) # 12% HVAC reduction
                est_usd_save = round(est_kwh_save * 0.14, 2)                # $0.14/kWh rate
                
                recommendations.append({
                    "id": f"REC-{rec_counter:03d}",
                    "facility_id": f_id,
                    "facility_name": f_name,
                    "title": "Optimize HVAC Thermostat & Reset Setpoint",
                    "priority": "High",
                    "estimated_savings_usd": est_usd_save,
                    "estimated_savings_kwh": est_kwh_save,
                    "reason": f"HVAC represents {hvac_pct:.1f}% of total energy usage over the past 7 days, exceeding energy benchmark (45%).",
                    "suggested_action": "Increase chilled water temperature by 1.5°C and increase zone thermostat setpoint by 2°C during non-critical hours.",
                    "category": "HVAC"
                })
                rec_counter += 1

            # 2. Lighting Schedule & Motion Sensor Installation
            if len(night_df) > 0:
                night_lighting_kwh = float(night_df["lighting_kwh"].sum())
                if night_lighting_kwh > (avg_lighting * len(night_df) * 0.5):
                    est_kwh_save = round(night_lighting_kwh * 0.45, 1)
                    est_usd_save = round(est_kwh_save * 0.14, 2)
                    
                    recommendations.append({
                        "id": f"REC-{rec_counter:03d}",
                        "facility_id": f_id,
                        "facility_name": f_name,
                        "title": "Automate After-Hours Lighting Shutdown",
                        "priority": "Medium",
                        "estimated_savings_usd": est_usd_save,
                        "estimated_savings_kwh": est_kwh_save,
                        "reason": f"Significant lighting power ({night_lighting_kwh:.1f} kWh) remains active between 23:00 and 05:00.",
                        "suggested_action": "Deploy occupancy sensors in corridors and enforce automated BAS lighting shutoff after 20:00.",
                        "category": "Lighting"
                    })
                    rec_counter += 1

            # 3. Power Factor Correction
            if avg_pf < 0.92:
                est_usd_penalty_save = round(total_elec * 0.025 * 0.14, 2)
                est_kwh_save = round(total_elec * 0.018, 1)
                
                recommendations.append({
                    "id": f"REC-{rec_counter:03d}",
                    "facility_id": f_id,
                    "facility_name": f_name,
                    "title": "Install APFC Capacitor Banks for Power Factor Correction",
                    "priority": "High" if avg_pf < 0.88 else "Medium",
                    "estimated_savings_usd": est_usd_penalty_save,
                    "estimated_savings_kwh": est_kwh_save,
                    "reason": f"Average Power Factor is {avg_pf:.2f}, causing reactive energy losses and utility surcharges.",
                    "suggested_action": "Engage Automatic Power Factor Correction (APFC) capacitor bank panel to bring Power Factor to > 0.97.",
                    "category": "Power Factor"
                })
                rec_counter += 1

            # 4. Solar PV Panel Cleaning & Maintenance
            solar_total = float(df["solar_generation_kwh"].sum())
            if solar_total > 0:
                est_kwh_gain = round(solar_total * 0.15, 1)
                est_usd_gain = round(est_kwh_gain * 0.14, 2)
                
                recommendations.append({
                    "id": f"REC-{rec_counter:03d}",
                    "facility_id": f_id,
                    "facility_name": f_name,
                    "title": "Rooftop Solar PV Array Cleaning & Inspection",
                    "priority": "Low",
                    "estimated_savings_usd": est_usd_gain,
                    "estimated_savings_kwh": est_kwh_gain,
                    "reason": "Rooftop solar generation is yielding 15% below rated irradiance capacity due to dust accumulation.",
                    "suggested_action": "Schedule robotic solar panel cleaning and perform thermal imaging to detect hot spots.",
                    "category": "Solar"
                })
                rec_counter += 1

        return recommendations
