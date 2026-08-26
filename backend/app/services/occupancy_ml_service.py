"""ML service for occupancy forecasting — RandomForestRegressor with lag features."""
import datetime, logging
import numpy as np
from typing import List, Dict, Optional

logger = logging.getLogger('facilityops.occupancy_ml')

# In-memory model cache: facility_id -> (model, trained_at)
_model_cache: Dict = {}


def _make_features(hour: int, dow: int, is_weekend: bool,
                   lag1: float, lag24: float, lag48: float, roll6: float) -> List[float]:
    return [hour, dow, int(is_weekend), lag1, lag24, lag48, roll6]


def train_model(facility_id: str, readings: list) -> bool:
    """Train a RandomForestRegressor on historical OccupancyReading rows.
    readings: list of OccupancyReading ORM objects sorted by timestamp asc.
    Returns True if model was trained, False if not enough data."""
    try:
        from sklearn.ensemble import RandomForestRegressor
    except ImportError:
        logger.warning('scikit-learn not available, using fallback')
        return False

    if len(readings) < 48:
        logger.info('Not enough data to train ML model for %s (%d rows)', facility_id, len(readings))
        return False

    rates = [r.occupancy_rate for r in readings]
    timestamps = [r.timestamp for r in readings]

    X, y = [], []
    for i in range(48, len(rates)):
        ts = timestamps[i]
        lag1  = rates[i - 1]
        lag24 = rates[i - 24] if i >= 24 else rates[0]
        lag48 = rates[i - 48] if i >= 48 else rates[0]
        roll6 = float(np.mean(rates[max(0, i-6):i]))
        feat = _make_features(
            hour=ts.hour,
            dow=ts.weekday(),
            is_weekend=ts.weekday() >= 5,
            lag1=lag1, lag24=lag24, lag48=lag48, roll6=roll6
        )
        X.append(feat)
        y.append(rates[i])

    if len(X) < 20:
        return False

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)
    _model_cache[facility_id] = {
        'model': model,
        'trained_at': datetime.datetime.utcnow(),
        'last_rates': rates[-48:],
        'n_samples': len(X),
    }
    logger.info('ML model trained for %s on %d samples', facility_id, len(X))
    return True


def predict_next_hours(facility_id: str, hours_ahead: int = 24) -> Optional[List[Dict]]:
    """Predict next N hours of occupancy rate for a facility."""
    cache = _model_cache.get(facility_id)
    if not cache:
        return None

    model = cache['model']
    last_rates = list(cache['last_rates'])  # copy
    now = datetime.datetime.utcnow().replace(minute=0, second=0, microsecond=0)

    results = []
    for i in range(hours_ahead):
        ts = now + datetime.timedelta(hours=i + 1)
        lag1  = last_rates[-1] if last_rates else 0.5
        lag24 = last_rates[-24] if len(last_rates) >= 24 else last_rates[0] if last_rates else 0.3
        lag48 = last_rates[-48] if len(last_rates) >= 48 else last_rates[0] if last_rates else 0.3
        roll6 = float(np.mean(last_rates[-6:])) if len(last_rates) >= 6 else lag1

        feat = _make_features(
            hour=ts.hour, dow=ts.weekday(),
            is_weekend=ts.weekday() >= 5,
            lag1=lag1, lag24=lag24, lag48=lag48, roll6=roll6
        )
        pred = float(model.predict([feat])[0])
        pred = min(1.0, max(0.0, pred))

        # Estimate confidence from tree variance
        try:
            preds_all = [t.predict([feat])[0] for t in model.estimators_]
            std = float(np.std(preds_all))
            confidence = round(max(0.60, min(0.99, 1.0 - std * 2)), 2)
        except Exception:
            confidence = 0.80

        last_rates.append(pred)
        if len(last_rates) > 48:
            last_rates = last_rates[-48:]

        results.append({
            'hour': ts.hour,
            'timestamp': ts.isoformat(),
            'day_label': ts.strftime('%a %d %b'),
            'predicted_occupancy_rate': round(pred, 4),
            'predicted_occupancy_pct': round(pred * 100, 1),
            'confidence': confidence,
            'is_peak': pred > 0.75,
            'status': 'Critical' if pred >= 1.0 else 'Overcrowded' if pred >= 0.95 else 'High' if pred >= 0.80 else 'Moderate' if pred >= 0.60 else 'Normal',
        })

    return results


def is_model_fresh(facility_id: str, max_age_hours: int = 6) -> bool:
    cache = _model_cache.get(facility_id)
    if not cache:
        return False
    age = (datetime.datetime.utcnow() - cache['trained_at']).total_seconds() / 3600
    return age < max_age_hours


def get_model_info(facility_id: str) -> Dict:
    cache = _model_cache.get(facility_id)
    if not cache:
        return {'trained': False}
    return {
        'trained': True,
        'trained_at': cache['trained_at'].isoformat(),
        'n_samples': cache['n_samples'],
        'age_hours': round((datetime.datetime.utcnow() - cache['trained_at']).total_seconds() / 3600, 1),
    }
