import unittest
import os
import sys

# Ensure backend root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.agents.energy_agent import EnergyAgent
from app.agents.maintenance_agent import MaintenanceAgent
from app.agents.occupancy_agent import OccupancyAgent
from app.agents.security_agent import SecurityAgent
from app.agents.cost_agent import CostAgent
from app.agents.intelligence_engine import IntelligenceEngine

class TestMultiAgentSystem(unittest.TestCase):
    def test_multi_agent_diagnosis(self):
        sample_data = [
            {
                "timestamp": "2026-07-25 12:00:00",
                "power_kw": 420.0,
                "electricity_kwh": 420.0,
                "hvac_efficiency": 0.72,
                "occupancy_count": 160,
                "temperature": 79.5
            }
        ]
        
        engine = IntelligenceEngine()
        results = engine.run_full_diagnosis(sample_data)
        
        self.assertIn("overall_health_score", results)
        self.assertIn("maintenance_insights", results)
        self.assertIn("occupancy_insights", results)
        self.assertIn("security_insights", results)
        self.assertIn("cost_insights", results)
        self.assertTrue(results["overall_health_score"] >= 0)

if __name__ == '__main__':
    unittest.main()
