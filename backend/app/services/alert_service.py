import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.alert import Alert, AlertSeverity, AlertStatus

logger = logging.getLogger("facilityops.alert_service")

class AlertService:
    """
    Service layer for threshold monitoring, alert creation, and status management.
    """
    @staticmethod
    def evaluate_telemetry_thresholds(db: Session, facility_id: int, power_kw: float, temperature: float) -> List[Alert]:
        """Evaluates live telemetry against critical thresholds and generates Alerts."""
        new_alerts = []
        
        # Power threshold check (> 380 kW)
        if power_kw > 380.0:
            alert = Alert(
                facility_id=facility_id,
                title="Critical Power Spike Detected",
                description=f"Power demand reached {power_kw} kW, exceeding 380 kW threshold.",
                severity=AlertSeverity.CRITICAL,
                status=AlertStatus.OPEN,
                metric_name="power_kw",
                metric_value=power_kw,
                threshold_value=380.0
            )
            db.add(alert)
            new_alerts.append(alert)

        # Temperature threshold check (> 78°F)
        if temperature > 78.0:
            alert = Alert(
                facility_id=facility_id,
                title="HVAC Temperature Excursion",
                description=f"Space temperature reached {temperature}°F, exceeding 78°F limit.",
                severity=AlertSeverity.HIGH,
                status=AlertStatus.OPEN,
                metric_name="temperature",
                metric_value=temperature,
                threshold_value=78.0
            )
            db.add(alert)
            new_alerts.append(alert)

        if new_alerts:
            db.commit()
            logger.info(f"Generated {len(new_alerts)} new automated telemetry alerts for Facility {facility_id}.")

        return new_alerts
