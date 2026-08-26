"""Occupancy Agent — Phase A: monitoring, utilization, overcrowding, heatmaps, ML forecast."""
import datetime, logging, random
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.occupancy_models import Room, OccupancyReading, OccupancyPrediction, OccupancyAlert
from app.services.event_service import event_service
from app.services import occupancy_ml_service as ml

logger = logging.getLogger('facilityops.occupancy_agent')

# Thresholds (occupancy_rate)
T_NORMAL     = 0.60
T_MODERATE   = 0.80
T_HIGH       = 0.95
T_CRITICAL   = 1.00


def _status(rate: float) -> str:
    if rate >= T_CRITICAL:   return 'Critical'
    if rate >= T_HIGH:       return 'Overcrowded'
    if rate >= T_MODERATE:   return 'High'
    if rate >= T_NORMAL:     return 'Moderate'
    return 'Normal'


def _util_label(avg_rate: float) -> str:
    if avg_rate >= T_HIGH:     return 'High'
    if avg_rate >= T_MODERATE: return 'Moderate'
    if avg_rate >= T_NORMAL:   return 'Low'
    return 'Underutilized'


class OccupancyAgent:
    def __init__(self, db: Session):
        self.db = db

    # ── A. LIVE MONITORING ──────────────────────────────────
    def get_current_occupancy(self, facility_id: str = None):
        """Return latest occupancy snapshot for every active room."""
        q = self.db.query(Room)
        if facility_id:
            q = q.filter(Room.facility_id == facility_id)
        rooms = q.filter(Room.status == 'active').all()
        result = []
        for room in rooms:
            reading = (
                self.db.query(OccupancyReading)
                .filter(OccupancyReading.room_id == room.room_id)
                .order_by(OccupancyReading.timestamp.desc())
                .first()
            )
            people = reading.people_count if reading else 0
            rate   = people / room.capacity if room.capacity > 0 else 0.0
            result.append({
                'room_id':        room.room_id,
                'room_name':      room.room_name,
                'room_type':      room.room_type,
                'floor':          room.floor,
                'zone':           room.zone,
                'facility_id':    room.facility_id,
                'x_grid':         room.x_grid,
                'y_grid':         room.y_grid,
                'people_count':   people,
                'capacity':       room.capacity,
                'entry_count':    reading.entry_count if reading else 0,
                'exit_count':     reading.exit_count  if reading else 0,
                'occupancy_rate': round(rate, 4),
                'occupancy_pct':  round(rate * 100, 1),
                'status':         _status(rate),
                'last_updated':   reading.timestamp.isoformat() if reading else None,
            })
        return result

    # ── B. SPACE UTILIZATION ANALYTICS ──────────────────────
    def get_utilization_report(self, facility_id: str = None, days: int = 7):
        """Per-room avg/peak/label utilization ranked by avg descending."""
        since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        q = self.db.query(OccupancyReading).filter(OccupancyReading.timestamp >= since)
        if facility_id:
            q = q.filter(OccupancyReading.facility_id == facility_id)
        rows = q.all()

        room_data: dict = {}
        for r in rows:
            if r.room_id not in room_data:
                room_data[r.room_id] = {'rates': [], 'entries': [], 'exits': [], 'cap': r.capacity, 'room_id': r.room_id}
            room_data[r.room_id]['rates'].append(r.occupancy_rate)
            room_data[r.room_id]['entries'].append(r.entry_count)
            room_data[r.room_id]['exits'].append(r.exit_count)

        # Join room names
        rooms_q = self.db.query(Room)
        if facility_id:
            rooms_q = rooms_q.filter(Room.facility_id == facility_id)
        room_meta = {r.room_id: r for r in rooms_q.all()}

        report = []
        for rid, d in room_data.items():
            rates = d['rates']
            avg   = float(np.mean(rates)) if rates else 0.0
            peak  = float(np.max(rates))  if rates else 0.0
            meta  = room_meta.get(rid)
            report.append({
                'room_id':          rid,
                'room_name':        meta.room_name if meta else rid,
                'room_type':        meta.room_type if meta else '',
                'floor':            meta.floor     if meta else 0,
                'facility_id':      meta.facility_id if meta else '',
                'capacity':         d['cap'],
                'avg_occupancy_rate':  round(avg, 4),
                'avg_occupancy_pct':   round(avg * 100, 1),
                'peak_occupancy_rate': round(peak, 4),
                'peak_occupancy_pct':  round(peak * 100, 1),
                'utilization_label':   _util_label(avg),
                'total_entries':    sum(d['entries']),
                'total_exits':      sum(d['exits']),
                'reading_count':    len(rates),
            })
        report.sort(key=lambda x: x['avg_occupancy_rate'], reverse=True)
        return report

    def get_analytics(self, facility_id: str = None, days: int = 7):
        current = self.get_current_occupancy(facility_id)
        total_people   = sum(r['people_count']   for r in current)
        total_capacity = sum(r['capacity']       for r in current)
        avg_rate  = total_people / total_capacity if total_capacity > 0 else 0.0
        peak_rate = max((r['occupancy_rate'] for r in current), default=0.0)
        overcrowded   = [r for r in current if r['status'] in ('Overcrowded', 'Critical')]
        underutilized = [r for r in current if r['occupancy_rate'] < 0.20]
        space_score = round(avg_rate * 100, 1)
        eff_score   = max(0.0, round(100.0 - len(underutilized) * 10 - len(overcrowded) * 5, 1))

        since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        rows_q = self.db.query(OccupancyReading).filter(OccupancyReading.timestamp >= since)
        if facility_id:
            rows_q = rows_q.filter(OccupancyReading.facility_id == facility_id)
        rows = rows_q.all()

        hourly  = {str(h): [] for h in range(24)}
        daily   = {}
        floor_map = {}
        for r in rows:
            h = str(r.timestamp.hour)
            hourly[h].append(r.occupancy_rate)
            d = r.timestamp.strftime('%Y-%m-%d')
            daily.setdefault(d, []).append(r.occupancy_rate)
            fl = str(r.floor)
            floor_map.setdefault(fl, []).append(r.occupancy_rate)

        hourly_trend = {h: round(float(np.mean(v)), 4) if v else 0.0 for h, v in hourly.items()}
        daily_trend  = {d: round(float(np.mean(v)), 4) for d, v in sorted(daily.items())[-14:]}
        floor_util   = {fl: round(float(np.mean(v)), 4) for fl, v in floor_map.items()}

        return {
            'total_current_occupancy': total_people,
            'total_capacity':          total_capacity,
            'avg_occupancy_rate':      round(avg_rate, 4),
            'avg_occupancy_pct':       round(avg_rate * 100, 1),
            'peak_occupancy_rate':     round(peak_rate, 4),
            'overcrowded_rooms':       overcrowded,
            'underutilized_rooms':     underutilized,
            'overcrowded_count':       len(overcrowded),
            'underutilized_count':     len(underutilized),
            'space_utilization_score': space_score,
            'workspace_efficiency_score': eff_score,
            'hourly_trend':            hourly_trend,
            'daily_trend':             daily_trend,
            'floor_utilization':       floor_util,
            'room_count':              len(current),
            'model_info':              ml.get_model_info(facility_id or 'ALL'),
        }

    # ── C. OVERCROWDING DETECTION ────────────────────────────
    def detect_overcrowding(self, facility_id: str = None):
        """Scan current occupancy, create OccupancyAlert records for overcrowded rooms."""
        current = self.get_current_occupancy(facility_id)
        new_alerts = []
        for r in current:
            if r['occupancy_rate'] < T_MODERATE:
                continue
            severity = 'Critical' if r['occupancy_rate'] >= T_CRITICAL else 'High'
            # Avoid duplicate active alerts for same room
            existing = (
                self.db.query(OccupancyAlert)
                .filter(OccupancyAlert.room_id == r['room_id'])
                .filter(OccupancyAlert.status == 'Active')
                .first()
            )
            if existing:
                # Update pct on existing alert
                existing.occupancy_pct = r['occupancy_pct']
                existing.people_count  = r['people_count']
                continue
            action = (
                f'Immediately redirect occupants from {r["room_name"]} to adjacent available spaces.'
                if severity == 'Critical'
                else f'Monitor {r["room_name"]} and consider rerouting if occupancy increases further.'
            )
            alert = OccupancyAlert(
                facility_id=r['facility_id'],
                room_id=r['room_id'],
                room_name=r['room_name'],
                floor=r['floor'],
                alert_type='Overcrowding',
                severity=severity,
                occupancy_pct=r['occupancy_pct'],
                people_count=r['people_count'],
                capacity=r['capacity'],
                status='Active',
                recommended_action=action,
            )
            self.db.add(alert)
            new_alerts.append(alert)
        self.db.commit()

        # Auto-resolve alerts for rooms that are now below threshold
        room_ids_ok = {r['room_id'] for r in current if r['occupancy_rate'] < T_MODERATE}
        if room_ids_ok:
            active = (
                self.db.query(OccupancyAlert)
                .filter(OccupancyAlert.status == 'Active')
                .filter(OccupancyAlert.room_id.in_(room_ids_ok))
                .all()
            )
            for a in active:
                a.status = 'Resolved'
                a.resolved_at = datetime.datetime.utcnow()
            self.db.commit()

        return [
            {c.name: getattr(a, c.name) for c in a.__table__.columns}
            for a in new_alerts
        ]

    def get_active_alerts(self, facility_id: str = None):
        """Return current active overcrowding alerts."""
        q = self.db.query(OccupancyAlert).filter(OccupancyAlert.status == 'Active')
        if facility_id:
            q = q.filter(OccupancyAlert.facility_id == facility_id)
        alerts = q.order_by(OccupancyAlert.triggered_at.desc()).all()
        return [{c.name: getattr(a, c.name) for c in a.__table__.columns} for a in alerts]

    # ── D. HEATMAPS ──────────────────────────────────────────
    def get_floor_heatmap(self, facility_id: str, floor: int = None):
        """Floor-plan tile grid: each room colored by current occupancy."""
        q = self.db.query(Room).filter(Room.facility_id == facility_id)
        if floor:
            q = q.filter(Room.floor == floor)
        rooms = q.order_by(Room.floor, Room.room_id).all()
        idx_per_floor = {}
        result = []
        for room in rooms:
            fl = room.floor
            idx_per_floor.setdefault(fl, 0)
            i = idx_per_floor[fl]
            idx_per_floor[fl] += 1
            reading = (
                self.db.query(OccupancyReading)
                .filter(OccupancyReading.room_id == room.room_id)
                .order_by(OccupancyReading.timestamp.desc())
                .first()
            )
            people = reading.people_count if reading else 0
            rate   = people / room.capacity if room.capacity > 0 else 0.0
            level = 'Normal'
            if rate >= T_CRITICAL:   level = 'Critical'
            elif rate >= T_HIGH:     level = 'Overcrowded'
            elif rate >= T_MODERATE: level = 'High'
            elif rate >= T_NORMAL:   level = 'Moderate'
            result.append({
                'room_id':       room.room_id,
                'room_name':     room.room_name,
                'room_type':     room.room_type,
                'floor':         fl,
                'zone':          room.zone,
                'x_pos':         i % 4,
                'y_pos':         i // 4,
                'x_grid':        room.x_grid,
                'y_grid':        room.y_grid,
                'occupancy_rate': round(rate, 4),
                'occupancy_pct':  round(rate * 100, 1),
                'level':          level,
                'people_count':   people,
                'capacity':       room.capacity,
            })
        return result

    def get_heatmap_matrix(self, facility_id: str = None, days: int = 7):
        """7-day × 24-hour matrix of average occupancy rate — for pattern analysis."""
        since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        q = self.db.query(OccupancyReading).filter(OccupancyReading.timestamp >= since)
        if facility_id:
            q = q.filter(OccupancyReading.facility_id == facility_id)
        rows = q.all()

        # matrix[day_of_week][hour] -> list of rates
        matrix = {d: {h: [] for h in range(24)} for d in range(7)}
        for r in rows:
            dow = r.timestamp.weekday()  # 0=Mon
            h   = r.timestamp.hour
            matrix[dow][h].append(r.occupancy_rate)

        DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        result = []
        for dow in range(7):
            row = {'day': DAY_NAMES[dow], 'day_index': dow, 'hours': {}}
            for h in range(24):
                vals = matrix[dow][h]
                row['hours'][str(h)] = round(float(np.mean(vals)), 4) if vals else 0.0
            result.append(row)
        return result

    # ── E. ML FORECASTING ────────────────────────────────────
    def get_forecast_ml(self, facility_id: str, hours_ahead: int = 24):
        """ML-powered 24h forecast using RandomForestRegressor."""
        # Train or reuse cached model
        if not ml.is_model_fresh(facility_id):
            since = datetime.datetime.utcnow() - datetime.timedelta(days=14)
            rows = (
                self.db.query(OccupancyReading)
                .filter(OccupancyReading.facility_id == facility_id)
                .filter(OccupancyReading.timestamp >= since)
                .order_by(OccupancyReading.timestamp.asc())
                .all()
            )
            ml.train_model(facility_id, rows)

        forecast = ml.predict_next_hours(facility_id, hours_ahead=hours_ahead)

        if not forecast:
            # Fallback: rolling-average based
            return self.get_forecast(facility_id, hours_ahead=hours_ahead)

        # Compute peak and low annotations
        peak = max(forecast, key=lambda x: x['predicted_occupancy_pct'])
        low  = min(forecast, key=lambda x: x['predicted_occupancy_pct'])

        return {
            'facility_id':  facility_id,
            'model_used':   'RandomForestRegressor',
            'model_info':   ml.get_model_info(facility_id),
            'forecast':     forecast,
            'peak': {
                'hour':   peak['hour'],
                'pct':    peak['predicted_occupancy_pct'],
                'label':  f"Peak: {peak['predicted_occupancy_pct']}% at {peak['hour']:02d}:00",
            },
            'low': {
                'hour':   low['hour'],
                'pct':    low['predicted_occupancy_pct'],
                'label':  f"Low: {low['predicted_occupancy_pct']}% at {low['hour']:02d}:00",
            },
        }

    def get_forecast(self, facility_id: str, room_id: str = None, hours_ahead: int = 24):
        """Fallback rolling-average forecast (used when ML model not ready)."""
        since = datetime.datetime.utcnow() - datetime.timedelta(days=14)
        q = (
            self.db.query(OccupancyReading)
            .filter(OccupancyReading.facility_id == facility_id)
            .filter(OccupancyReading.timestamp >= since)
        )
        if room_id:
            q = q.filter(OccupancyReading.room_id == room_id)
        rows = q.all()
        hourly_avg = {h: [] for h in range(24)}
        for r in rows:
            hourly_avg[r.timestamp.hour].append(r.occupancy_rate)
        avg_by_hour = {h: float(np.mean(v)) if v else 0.3 for h, v in hourly_avg.items()}
        now = datetime.datetime.utcnow()
        forecast = []
        for i in range(hours_ahead):
            ts   = now + datetime.timedelta(hours=i)
            base = avg_by_hour.get(ts.hour, 0.3)
            rate = min(1.0, max(0.0, base + random.gauss(0, 0.03)))
            forecast.append({
                'hour':                    ts.hour,
                'timestamp':               ts.isoformat(),
                'day_label':               ts.strftime('%a %d %b'),
                'predicted_occupancy_pct': round(rate * 100, 1),
                'predicted_occupancy_rate': round(rate, 4),
                'confidence':              0.72,
                'is_peak':                 rate > 0.75,
                'status':                  _status(rate),
            })
        return {
            'facility_id': facility_id,
            'room_id':     room_id,
            'model_used':  'rolling_average',
            'forecast':    forecast,
        }

    # ── F. RECOMMENDATIONS ───────────────────────────────────
    def get_recommendations(self, facility_id: str = None):
        analytics = self.get_analytics(facility_id)
        util      = self.get_utilization_report(facility_id)
        recs = []

        for r in analytics['overcrowded_rooms']:
            recs.append({
                'recommendation_id': f'REC-OCC-{r["room_id"]}',
                'priority': 'High',
                'category': 'Overcrowding',
                'reason': f'{r["room_name"]} is at {r["occupancy_pct"]}% capacity ({r["people_count"]}/{r["capacity"]} people).',
                'recommended_action': 'Redirect occupants to adjacent zones or open overflow capacity.',
                'expected_benefit': 'Immediate safety improvement and regulatory compliance.',
            })

        for r in analytics['underutilized_rooms']:
            recs.append({
                'recommendation_id': f'REC-UTIL-{r["room_id"]}',
                'priority': 'Low',
                'category': 'Space Efficiency',
                'reason': f'{r["room_name"]} is at only {r["occupancy_pct"]}% utilization.',
                'recommended_action': 'Switch to energy-saving HVAC/lighting mode or repurpose for hot-desking.',
                'expected_benefit': '15–25% energy cost reduction in unoccupied zones.',
            })

        if analytics['avg_occupancy_rate'] < 0.30:
            recs.append({
                'recommendation_id': 'REC-LOW-OVERALL',
                'priority': 'Medium',
                'category': 'Energy Efficiency',
                'reason': f'Facility-wide occupancy is only {analytics["avg_occupancy_pct"]}%.',
                'recommended_action': 'Reduce HVAC and lighting to minimal mode across unoccupied floors.',
                'expected_benefit': '20–30% reduction in energy costs.',
            })

        # Utilization-based: teams in underutilized spaces
        underutil_rooms = [u for u in util if u['utilization_label'] == 'Underutilized'][:3]
        for u in underutil_rooms:
            already = any(r['recommendation_id'] == f'REC-UTIL-{u["room_id"]}' for r in recs)
            if not already:
                recs.append({
                    'recommendation_id': f'REC-UTIL2-{u["room_id"]}',
                    'priority': 'Medium',
                    'category': 'Workspace Optimization',
                    'reason': f'{u["room_name"]} averages {u["avg_occupancy_pct"]}% (peak {u["peak_occupancy_pct"]}%) over the last 7 days.',
                    'recommended_action': 'Consider consolidating teams from this space into higher-utilization zones.',
                    'expected_benefit': 'Better collaboration density and reduced facilities overhead.',
                })

        return recs

    def check_and_publish_events(self, facility_id: str):
        analytics = self.get_analytics(facility_id)
        if analytics['overcrowded_count'] > 0:
            event_service.publish(
                facility_id=facility_id, agent='occupancy',
                event_type='OVERCROWDING', severity='HIGH',
                data={'overcrowded_rooms': analytics['overcrowded_count']},
            )
        if analytics['avg_occupancy_rate'] < 0.20:
            event_service.publish(
                facility_id=facility_id, agent='occupancy',
                event_type='LOW_OCCUPANCY', severity='MEDIUM',
                data={'avg_rate': analytics['avg_occupancy_rate']},
            )
        elif analytics['avg_occupancy_rate'] > 0.80:
            event_service.publish(
                facility_id=facility_id, agent='occupancy',
                event_type='PEAK_OCCUPANCY', severity='MEDIUM',
                data={'avg_rate': analytics['avg_occupancy_rate']},
            )

    # ── HEATMAP (legacy alias) ───────────────────────────────
    def get_heatmap(self, facility_id: str, floor: int = None):
        return self.get_floor_heatmap(facility_id, floor)
