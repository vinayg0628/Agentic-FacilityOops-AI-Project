"""Centralized security risk scoring service."""
import logging
logger = logging.getLogger('facilityops.risk_service')


class RiskService:
    """Calculate a 0-100 risk score based on security factors."""

    SEVERITY_BANDS = [
        (0, 30, 'Low'),
        (31, 60, 'Medium'),
        (61, 80, 'High'),
        (81, 100, 'Critical'),
    ]
    CCTV_HIGH_RISK = {'Tailgating Suspected', 'Door Forced'}
    CCTV_MEDIUM_RISK = {'Restricted Area Entry', 'Loitering'}

    def calculate_risk_score(self, factors: dict) -> float:
        score = 0.0
        if factors.get('unauthorized_access'):
            score += 40
        if factors.get('after_hours'):
            score += 20
        if factors.get('restricted_zone'):
            score += 25
        repeated = min(int(factors.get('repeated_failures', 0)) * 10, 30)
        score += repeated
        if factors.get('visitor_unescorted'):
            score += 15
        cctv = factors.get('cctv_event', '')
        if cctv in self.CCTV_HIGH_RISK:
            score += 30
        elif cctv in self.CCTV_MEDIUM_RISK:
            score += 15
        if factors.get('existing_incident'):
            score += 10
        return min(round(score, 2), 100.0)

    def get_severity(self, score: float) -> str:
        for lo, hi, label in self.SEVERITY_BANDS:
            if lo <= score <= hi:
                return label
        return 'Critical'

    def should_create_alert(self, score: float) -> bool:
        return score > 30

    def should_create_incident(self, score: float) -> bool:
        return score > 60


risk_service = RiskService()