import logging
from typing import List, Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MaintenanceAgent:
    """AI Agent responsible for predictive maintenance and equipment health analysis."""
    
    def __init__(self):
        self.temperature_critical = {
            'HVAC': 75, 'Generator': 90, 'Water Pump': 70, 'Elevator': 65, 
            'UPS': 55, 'Transformer': 85, 'Chiller': 68, 'Air Compressor': 80, 
            'Lighting Panel': 60, 'Solar Inverter': 70
        }
        self.temperature_warning = {k: v * 0.8 for k, v in self.temperature_critical.items()}
        
        self.vibration_critical = {
            'HVAC': 4.5, 'Generator': 5.5, 'Water Pump': 4.0, 'Elevator': 3.5, 
            'UPS': 2.5, 'Transformer': 3.0, 'Chiller': 4.5, 'Air Compressor': 5.0, 
            'Lighting Panel': 2.0, 'Solar Inverter': 2.5
        }
        
        self.runtime_max = {
            'HVAC': 8000, 'Generator': 5000, 'Water Pump': 8000, 'Elevator': 10000, 
            'UPS': 12000, 'Transformer': 15000, 'Chiller': 8000, 'Air Compressor': 6000, 
            'Lighting Panel': 20000, 'Solar Inverter': 25000
        }
        
        self.power_consumption_baseline = {
            'HVAC': 150.0, 'Generator': 200.0, 'Water Pump': 45.0, 'Elevator': 55.0, 
            'UPS': 30.0, 'Transformer': 500.0, 'Chiller': 250.0, 'Air Compressor': 75.0, 
            'Lighting Panel': 20.0, 'Solar Inverter': 100.0
        }

    def calculate_health_score(self, equipment_type: str, monitoring_data_list: List[Dict[str, Any]]) -> float:
        """Calculate a comprehensive health score out of 100 based on recent monitoring data."""
        if not monitoring_data_list:
            return 100.0
            
        recent = monitoring_data_list[-1]
        
        # Calculate averages for historical comparison if needed
        avg_temp = sum(d.get('temperature', 25) for d in monitoring_data_list) / len(monitoring_data_list)
        avg_vib = sum(d.get('vibration', 1) for d in monitoring_data_list) / len(monitoring_data_list)
        avg_power = sum(d.get('power_consumption', 0) for d in monitoring_data_list) / len(monitoring_data_list)
        
        temp_score = 25.0
        temp_warn = self.temperature_warning.get(equipment_type, 60.0)
        temp_crit = self.temperature_critical.get(equipment_type, 75.0)
        if avg_temp > temp_crit:
            temp_score = 0
        elif avg_temp > temp_warn:
            temp_score = 25.0 * (1 - (avg_temp - temp_warn)/(temp_crit - temp_warn))
            
        vib_score = 25.0
        vib_crit = self.vibration_critical.get(equipment_type, 5.0)
        vib_warn = vib_crit * 0.8
        if avg_vib > vib_crit:
            vib_score = 0
        elif avg_vib > vib_warn:
            vib_score = 25.0 * (1 - (avg_vib - vib_warn)/(vib_crit - vib_warn))
            
        runtime_score = 20.0
        rt_max = self.runtime_max.get(equipment_type, 10000)
        rt_curr = recent.get('runtime_hours', 0)
        if rt_curr > rt_max:
            runtime_score = 0
        else:
            runtime_score = 20.0 * (1 - (rt_curr / rt_max))
            
        power_score = 15.0
        pwr_base = self.power_consumption_baseline.get(equipment_type, 100.0)
        if avg_power > pwr_base * 1.2:
            power_score = max(0, 15.0 - (avg_power - pwr_base * 1.2))
            
        pressure_score = 10.0
        pressure = recent.get('pressure', 1.0)
        if pressure < 0.5 or pressure > 8.0:
            pressure_score = 0
            
        status_score = 5.0
        status = recent.get('operating_status', 'Running')
        if status == 'Fault':
            status_score = -5.0
        elif status == 'Idle':
            status_score = 0.0
        elif status == 'Standby':
            status_score = 2.0
            
        total = temp_score + vib_score + runtime_score + power_score + pressure_score + status_score
        return max(0.0, min(100.0, total))

    def get_health_category(self, score: float) -> str:
        """Map score to a categorical health status."""
        if score >= 90: return 'Excellent'
        if score >= 75: return 'Good'
        if score >= 60: return 'Warning'
        if score >= 40: return 'Critical'
        return 'Immediate Maintenance'

    def run_rule_engine(self, equipment: Dict[str, Any], monitoring_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Run diagnostic rules to generate proactive alerts."""
        alerts = []
        if not monitoring_data_list:
            return alerts
            
        equipment_type = equipment.get('equipment_type', 'Unknown')
        recent = monitoring_data_list[-1]
        
        avg_temp = sum(d.get('temperature', 25) for d in monitoring_data_list) / len(monitoring_data_list)
        avg_vib = sum(d.get('vibration', 1) for d in monitoring_data_list) / len(monitoring_data_list)
        avg_power = sum(d.get('power_consumption', 0) for d in monitoring_data_list) / len(monitoring_data_list)
        
        temp_crit = self.temperature_critical.get(equipment_type, 75.0)
        temp_warn = self.temperature_warning.get(equipment_type, 60.0)
        vib_crit = self.vibration_critical.get(equipment_type, 5.0)
        rt_max = self.runtime_max.get(equipment_type, 10000)
        rt_curr = recent.get('runtime_hours', 0)
        pwr_base = self.power_consumption_baseline.get(equipment_type, 100.0)
        
        if avg_temp > temp_crit:
            alerts.append({'severity': 'Critical', 'issue': 'Motor Overheating', 'recommendation': 'Immediately shut down and inspect cooling system', 'timestamp': datetime.utcnow()})
        elif avg_temp > temp_warn:
            alerts.append({'severity': 'High', 'issue': 'High Temperature Warning', 'recommendation': 'Schedule cooling system inspection within 24 hours', 'timestamp': datetime.utcnow()})
            
        if avg_vib > vib_crit:
            alerts.append({'severity': 'Critical', 'issue': 'Severe Bearing Vibration', 'recommendation': 'Emergency maintenance required — replace bearings immediately', 'timestamp': datetime.utcnow()})
        elif avg_vib > vib_crit * 0.8:
            alerts.append({'severity': 'High', 'issue': 'Elevated Vibration Detected', 'recommendation': 'Inspect and lubricate bearings; schedule maintenance', 'timestamp': datetime.utcnow()})
            
        if rt_curr > rt_max:
            alerts.append({'severity': 'High', 'issue': 'Excessive Runtime — Maintenance Overdue', 'recommendation': 'Schedule preventive maintenance immediately', 'timestamp': datetime.utcnow()})
        elif rt_curr > rt_max * 0.85:
            alerts.append({'severity': 'Medium', 'issue': 'Approaching Maximum Runtime', 'recommendation': 'Plan preventive maintenance in next 30 days', 'timestamp': datetime.utcnow()})
            
        if avg_power > pwr_base * 1.25:
            alerts.append({'severity': 'High', 'issue': 'Power Consumption Surge — Equipment Inefficiency', 'recommendation': 'Inspect motor windings and power supply', 'timestamp': datetime.utcnow()})
        elif avg_power > pwr_base * 1.15:
            alerts.append({'severity': 'Medium', 'issue': 'Power Consumption Elevated', 'recommendation': 'Monitor for further increase; inspect load conditions', 'timestamp': datetime.utcnow()})
            
        pressure = recent.get('pressure', 1.0)
        if pressure < 0.5 or pressure > 8.0:
            alerts.append({'severity': 'High', 'issue': 'Abnormal Pressure Reading', 'recommendation': 'Inspect pressure relief valve and pipework', 'timestamp': datetime.utcnow()})
            
        humidity = recent.get('humidity', 50.0)
        if humidity > 85:
            alerts.append({'severity': 'Medium', 'issue': 'High Humidity in Equipment Zone', 'recommendation': 'Improve ventilation and check seals', 'timestamp': datetime.utcnow()})
            
        if recent.get('operating_status') == 'Fault':
            alerts.append({'severity': 'Critical', 'issue': 'Equipment Fault Detected', 'recommendation': 'Immediate inspection required — do not restart without engineering clearance', 'timestamp': datetime.utcnow()})
            
        return alerts

    def predict_failure(self, equipment: Dict[str, Any], monitoring_data_list: List[Dict[str, Any]], health_score: float) -> Dict[str, Any]:
        """Predict time to failure based on health score and degradation rate."""
        runtime_hours = 0
        if monitoring_data_list:
            runtime_hours = monitoring_data_list[-1].get('runtime_hours', 0)
            
        degradation_rate = (100 - health_score) / max(1, runtime_hours / 1000)
        days_to_failure = max(1, int((health_score - 40) / max(0.01, degradation_rate) * 7))
        days_to_failure = max(1, min(365, days_to_failure))
        
        predicted_date = datetime.utcnow() + timedelta(days=days_to_failure)
        risk_score = round(100 - health_score, 1)
        
        maintenance_priority = 'Emergency' if health_score < 40 else 'High' if health_score < 60 else 'Medium' if health_score < 75 else 'Low'
        
        if risk_score > 60:
            maintenance_type = 'Corrective'
        elif risk_score > 30:
            maintenance_type = 'Predictive'
        else:
            maintenance_type = 'Preventive'
            
        return {
            'predicted_failure_date': predicted_date.isoformat(),
            'remaining_useful_life_days': days_to_failure,
            'risk_score': risk_score,
            'maintenance_priority': maintenance_priority,
            'recommended_maintenance_type': maintenance_type,
            'estimated_downtime_hours': 4.0 if maintenance_priority == 'Emergency' else 2.0,
            'estimated_cost_usd': 1500.0 if maintenance_priority == 'Emergency' else 500.0
        }

    def generate_recommendations(self, equipment_type: str, health_score: float, alerts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate specific maintenance recommendations."""
        recommendations = []
        priority = 'Critical' if health_score < 40 else 'High' if health_score < 60 else 'Medium' if health_score < 75 else 'Low'
        
        type_recs = {
            'HVAC': 'Inspect air filters and coils, check refrigerant levels.',
            'Generator': 'Check fuel levels, injectors, and perform oil analysis.',
            'Water Pump': 'Check mechanical seals, bearings, and alignment.',
            'Elevator': 'Inspect hoistway, lubricate guide rails, and check control panel.',
            'UPS': 'Perform battery load testing and check inverter circuitry.',
            'Transformer': 'Check oil levels, perform thermography inspection.',
            'Chiller': 'Clean condenser tubes and verify compressor operation.',
            'Air Compressor': 'Drain moisture traps, check drive belts and intake filters.',
            'Lighting Panel': 'Verify breaker tightness, check for thermal hotspots.',
            'Solar Inverter': 'Clean ventilation screens, verify string voltages.'
        }
        
        specific_action = type_recs.get(equipment_type, 'Perform standard preventive maintenance.')
        
        recommendations.append({
            'priority': priority,
            'action': specific_action,
            'reason': f'Routine and predictive check based on {equipment_type} guidelines.',
            'estimated_cost_usd': 350.0,
            'estimated_downtime_hours': 2.0,
            'expected_benefit': 'Improves efficiency and prevents sudden breakdowns.'
        })
        
        if health_score < 75:
            recommendations.append({
                'priority': priority,
                'action': 'Schedule deep diagnostic and calibration',
                'reason': f'Health score has degraded to {health_score:.1f}',
                'estimated_cost_usd': 500.0,
                'estimated_downtime_hours': 4.0,
                'expected_benefit': 'Restores baseline performance and reliability.'
            })
            
        return recommendations

    def analyze_equipment(self, equipment_dict: Dict[str, Any], monitoring_data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Master analysis function for equipment health, predictions, and recommendations."""
        equipment_type = equipment_dict.get('equipment_type', 'Unknown')
        
        health_score = self.calculate_health_score(equipment_type, monitoring_data_list)
        health_category = self.get_health_category(health_score)
        
        alerts = self.run_rule_engine(equipment_dict, monitoring_data_list)
        prediction = self.predict_failure(equipment_dict, monitoring_data_list, health_score)
        recommendations = self.generate_recommendations(equipment_type, health_score, alerts)
        
        return {
            'equipment_id': equipment_dict.get('equipment_id'),
            'equipment_name': equipment_dict.get('equipment_name'),
            'equipment_type': equipment_type,
            'health_score': round(health_score, 1),
            'health_category': health_category,
            'alerts': alerts,
            'prediction': prediction,
            'recommendations': recommendations,
            'last_analyzed': datetime.utcnow().isoformat()
        }
