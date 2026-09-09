import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.alert import EnergyAlert

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
            alert = EnergyAlert(
                facility_id=facility_id,
                title="Critical Power Spike Detected",
                description=f"Power demand reached {power_kw} kW, exceeding 380 kW threshold.",
                severity='Critical',
                status='Open',
                metric_name="power_kw",
                metric_value=power_kw,
                threshold_value=380.0
            )
            db.add(alert)
            new_alerts.append(alert)

        # Temperature threshold check (> 78°F)
        if temperature > 78.0:
            alert = EnergyAlert(
                facility_id=facility_id,
                title="HVAC Temperature Excursion",
                description=f"Space temperature reached {temperature}°F, exceeding 78°F limit.",
                severity='High',
                status='Open',
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

from app.utils.email_utils import send_alert_notification_email

def create_system_alert(db, zone_id, alert_type, severity, message):
    from app.services.data_service import SystemAlert
    alert = SystemAlert(
        zone_id=zone_id,
        alert_type=alert_type,
        severity=severity,
        message=message,
        status="Open"
    )
    db.add(alert)
    db.commit()
    logger.info(f"Generated {alert_type} alert for zone {zone_id}: {message}")
    send_alert_notification_email("admin@facilityops.com", f"{severity} {alert_type} Alert", message)
    
    # Send In-App + Webhook
    send_in_app_notification(alert.alert_id, message)
    send_webhook_notification({"alert_id": alert.alert_id, "type": alert_type, "severity": severity, "message": message})

def send_in_app_notification(alert_id, message):
    logger.info(f"[In-App Notification Emitted] Alert {alert_id}: {message}")
    # Websocket emit logic would go here

def send_webhook_notification(payload):
    logger.info(f"[Webhook Notification Sent] Payload: {payload}")
    # requests.post(WEBHOOK_URL, json=payload) logic would go here
