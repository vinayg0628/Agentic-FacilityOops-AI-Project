import logging
from typing import Dict, Any, List
from app.agents.intelligence_engine import IntelligenceEngine

logger = logging.getLogger("facilityops.ml_service")

class MLService:
    """
    Service layer providing machine learning model inference and agent orchestration.
    """
    def __init__(self):
        self.engine = IntelligenceEngine()

    def generate_facility_insights(self, telemetry_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Runs inference via IntelligenceEngine and produces unified recommendations."""
        return self.engine.run_full_diagnosis(telemetry_data)

ml_service_instance = MLService()
