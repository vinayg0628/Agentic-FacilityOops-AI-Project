"""ML service for security anomaly detection — Isolation Forest on access patterns."""
import datetime, logging, json
import numpy as np
from typing import List, Dict, Optional

logger = logging.getLogger('facilityops.security_ml')

# Zone risk weights — higher = more sensitive zone
ZONE_RISK = {
    'Server Room': 1.0, 'Data Centre': 1.0, 'Restricted Area': 0.9,
    'Laboratory': 0.8,  'HR Office': 0.7,   'Executive Suite': 0.7,
    'Finance Office': 0.6, 'Meeting Room': 0.2, 'Lobby': 0.1, 'Parking Area': 0.1,
}

# In-memory cache: facility_id -> {'model': ..., 'trained_at': ..., 'scaler': ...}
_cache: Dict = {}


def _zone_risk(zone_id: str) -> float:
    for k, v in ZONE_RISK.items():
        if k.lower() in zone_id.lower():
            return v
    return 0.3


def _make_features(hour: int, dow: int, is_weekend: bool,
                   zone_risk: float, freq_per_hr: float, result_denied: bool) -> List[float]:
    return [hour, dow, int(is_weekend), zone_risk, freq_per_hr, int(result_denied)]


def train_model(facility_id: str, access_logs: list) -> bool:
    """Train Isolation Forest on normal access patterns.
    access_logs: list of AccessLog ORM objects.
    """
    try:
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import StandardScaler
    except ImportError:
        logger.warning('scikit-learn not available')
        return False

    if len(access_logs) < 50:
        logger.info('Not enough data to train for %s (%d logs)', facility_id, len(access_logs))
        return False

    # Compute user-level access frequencies
    user_counts: Dict[str, int] = {}
    for log in access_logs:
        user_counts[log.user_id] = user_counts.get(log.user_id, 0) + 1

    # Build feature matrix — one row per access log
    X = []
    for log in access_logs:
        ts = log.timestamp
        freq = user_counts.get(log.user_id, 1) / max(1, len(access_logs) / 24)
        feat = _make_features(
            hour=ts.hour,
            dow=ts.weekday(),
            is_weekend=ts.weekday() >= 5,
            zone_risk=_zone_risk(log.zone_id),
            freq_per_hr=min(freq, 10.0),
            result_denied=(log.result == 'Denied'),
        )
        X.append(feat)

    X = np.array(X)
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    # contamination=0.05 means we expect ~5% to be anomalous
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(Xs)

    _cache[facility_id] = {
        'model':      model,
        'scaler':     scaler,
        'trained_at': datetime.datetime.utcnow(),
        'n_samples':  len(X),
        'user_counts': user_counts,
        'total_logs': len(access_logs),
    }
    logger.info('IsolationForest trained for %s on %d access events', facility_id, len(X))
    return True


def detect_anomalies(facility_id: str, access_logs: list) -> List[Dict]:
    """Score each access log with Isolation Forest.
    Returns list of anomaly dicts for any log flagged as anomalous.
    """
    cache = _cache.get(facility_id)
    if not cache:
        return []

    model  = cache['model']
    scaler = cache['scaler']
    user_counts = cache['user_counts']
    total = cache['total_logs']

    results = []
    for log in access_logs:
        ts = log.timestamp
        freq = user_counts.get(log.user_id, 1) / max(1, total / 24)
        feat = _make_features(
            hour=ts.hour,
            dow=ts.weekday(),
            is_weekend=ts.weekday() >= 5,
            zone_risk=_zone_risk(log.zone_id),
            freq_per_hr=min(freq, 10.0),
            result_denied=(log.result == 'Denied'),
        )
        Xs = scaler.transform([feat])
        score = float(model.score_samples(Xs)[0])  # more negative = more anomalous
        is_anomaly = model.predict(Xs)[0] == -1    # -1 = anomaly, 1 = normal

        if not is_anomaly:
            continue

        # Classify the anomaly type
        atype = 'Unusual Pattern'
        if ts.hour < 6 or ts.hour > 22:
            atype = 'After-Hours Access'
        elif log.result == 'Denied':
            atype = 'Repeated Denial'
        elif _zone_risk(log.zone_id) >= 0.8:
            atype = 'High-Risk Zone Access'
        elif freq > 5:
            atype = 'Abnormal Frequency'

        results.append({
            'access_id':       log.access_id,
            'facility_id':     log.facility_id,
            'user_id':         log.user_id,
            'user_type':       log.user_type,
            'zone_id':         log.zone_id,
            'timestamp':       log.timestamp.isoformat(),
            'hour_of_day':     ts.hour,
            'day_of_week':     ts.weekday(),
            'is_weekend':      ts.weekday() >= 5,
            'result':          log.result,
            'access_method':   log.access_method,
            'anomaly_score':   round(score, 4),
            'anomaly_type':    atype,
            'zone_risk_level': round(_zone_risk(log.zone_id), 2),
            'description':     f'{atype}: {log.user_id} accessed {log.zone_id} at {ts.strftime("%H:%M")} (score={score:.3f})',
            'risk_score':      min(100, int(abs(score) * 120 + _zone_risk(log.zone_id) * 30)),
        })

    return results


def is_model_fresh(facility_id: str, max_age_hours: int = 6) -> bool:
    c = _cache.get(facility_id)
    if not c: return False
    age = (datetime.datetime.utcnow() - c['trained_at']).total_seconds() / 3600
    return age < max_age_hours


def get_model_info(facility_id: str) -> Dict:
    c = _cache.get(facility_id)
    if not c: return {'trained': False}
    return {
        'trained': True,
        'trained_at': c['trained_at'].isoformat(),
        'n_samples': c['n_samples'],
        'age_hours': round((datetime.datetime.utcnow() - c['trained_at']).total_seconds() / 3600, 1),
    }


def get_scatter_data(facility_id: str, access_logs: list, anomaly_ids: set) -> List[Dict]:
    """Build scatter-plot data: (hour, zone_risk, is_anomaly) for each log."""
    points = []
    for log in access_logs:
        points.append({
            'x':          log.timestamp.hour,
            'y':          round(_zone_risk(log.zone_id), 2),
            'is_anomaly': log.access_id in anomaly_ids,
            'user_id':    log.user_id,
            'zone_id':    log.zone_id,
            'result':     log.result,
            'timestamp':  log.timestamp.isoformat(),
        })
    return points
