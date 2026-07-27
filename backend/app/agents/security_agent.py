import logging
from typing import Dict, Any, List

logger = logging.getLogger("facilityops.security_agent")

class SecurityAgent:
    """
    AI Agent responsible for facility security monitoring, perimeter integrity,
    and access control anomaly detection.
    """
    def __init__(self):
        self.model_name = "Facility Perimeter & Access Anomaly Detector v1.0"

    def scan_security_status(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Monitors facility security metrics and flags unauthorized access signals."""
        anomalies = []
        for item in telemetry_data[-5:] if telemetry_data else []:
            power = item.get("power_kw", 0)
            occ = item.get("occupancy_count", 0)
            # Power spike with 0 occupancy during off-hours indicates unexpected equipment activity
            if occ == 0 and power > 350:
                anomalies.append({
                    "timestamp": str(item.get("timestamp")),
                    "type": "Off-hours Unattended Load Spike",
                    "severity": "Warning"
                })
                
        return {
            "threat_level": "Elevated" if anomalies else "Normal",
            "active_anomalies": anomalies,
            "security_score": 95 if not anomalies else 75
        }
