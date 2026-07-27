from datetime import datetime
from typing import Any, Dict

def format_timestamp(dt: datetime) -> str:
    """Formats datetime object to standard ISO format string."""
    if dt is None:
        return ""
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def round_dict_floats(d: Dict[str, Any], decimals: int = 2) -> Dict[str, Any]:
    """Recursively rounds floating point values in a dictionary."""
    result = {}
    for k, v in d.items():
        if isinstance(v, float):
            result[k] = round(v, decimals)
        elif isinstance(v, dict):
            result[k] = round_dict_floats(v, decimals)
        else:
            result[k] = v
    return result
