import logging
from sqlalchemy.orm import Session
from app.services.cost_service import get_cost_overview
from app.services.budget_service import get_budget_summary

logger = logging.getLogger(__name__)

def ask_facility_ai(question: str, db: Session, facility_id: str = None) -> dict:
    """
    Simulates a natural-language AI assistant processing a user query.
    In a real-world scenario, this would use an LLM for intent extraction,
    query the appropriate agents, and use an LLM for response synthesis.
    """
    question_lower = question.lower()
    
    intent = "UNKNOWN"
    data = {}
    recommendation = ""
    financial_impact = ""
    
    if "cost" in question_lower or "save money" in question_lower or "optimization" in question_lower:
        intent = "COST_ANALYSIS"
        overview = get_cost_overview(db, facility_id)
        data = overview
        recommendation = "Review HVAC and Vendor optimizations to reduce highest expenditure categories."
        financial_impact = f"Potential annual savings: ₹{overview['annual_savings']}"
        answer = f"Operating costs are currently being optimized. Your facility health score is {overview['facility_health_score']}/100. We have identified opportunities for cost reduction."
    elif "budget" in question_lower:
        intent = "BUDGET_ANALYSIS"
        summary = get_budget_summary(db, facility_id)
        data = summary
        recommendation = "Reallocate funds from underutilized departments if necessary."
        financial_impact = f"Total remaining budget: ₹{summary['total_remaining']}"
        answer = f"The overall budget status is {summary['overall_status']} with {summary['percentage_used']:.1f}% used."
    elif "energy" in question_lower or "hvac" in question_lower:
        intent = "ENERGY_ANALYSIS"
        answer = "Energy consumption is high. The Intelligence Engine recommends consolidating low-use space and reducing HVAC load."
        recommendation = "Implement preventive maintenance on HVAC and optimize thermostat schedules."
        financial_impact = "Estimated 12% reduction in energy spend."
    else:
        answer = "I can help you analyze facility costs, budgets, energy, maintenance, occupancy, and security. Could you please specify which area you'd like to investigate?"
    
    return {
        "question": question,
        "intent": intent,
        "answer": answer,
        "metrics_used": data,
        "recommendation": recommendation,
        "expected_financial_impact": financial_impact,
        "data_sources": ["Cost Agent", "Intelligence Engine"] if intent != "UNKNOWN" else []
    }
