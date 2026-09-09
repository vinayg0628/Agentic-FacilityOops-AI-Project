def calculate_roi(investment: float, annual_benefit: float) -> float:
    if investment <= 0:
        return 0.0
    return ((annual_benefit - investment) / investment) * 100

def calculate_payback_period(investment: float, monthly_savings: float) -> float:
    if monthly_savings <= 0:
        return 0.0
    return investment / monthly_savings

def calculate_net_benefit(investment: float, annual_savings: float, years: int = 5) -> float:
    return (annual_savings * years) - investment
