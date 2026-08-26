"""Security Agent — Phase B: unauthorized access, anomaly detection, visitor tracking, incidents."""
import logging, datetime, json
import numpy as np
from sqlalchemy.orm import Session
from app.models.security_models import (
    AccessLog, Visitor, CCTVEvent, SecurityIncident, SecurityAlert,
    AnomalyLog, VisitorZoneViolation,
)
from app.services.risk_service import risk_service
from app.services.event_service import event_service
from app.services import security_ml_service as ml

logger = logging.getLogger('facilityops.security_agent')

HIGH_RISK_ZONES = {'Server Room', 'Data Centre', 'Restricted Area', 'Laboratory'}
AFTER_HOURS_START = 20  # 8 PM
AFTER_HOURS_END   = 7   # 7 AM


def _to_dict(obj):
    d = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
    for k, v in d.items():
        if hasattr(v, 'isoformat'): d[k] = v.isoformat()
    return d


def _is_after_hours(ts: datetime.datetime) -> bool:
    h = ts.hour
    return h >= AFTER_HOURS_START or h < AFTER_HOURS_END


def _severity_from_score(score: float) -> str:
    if score >= 85: return 'Critical'
    if score >= 70: return 'High'
    if score >= 50: return 'Medium'
    return 'Low'


class SecurityAgent:
    def __init__(self, db: Session):
        self.db = db

    # ── A. UNAUTHORIZED ACCESS DETECTION ─────────────────────
    def get_unauthorized_access(self, facility_id: str = None,
                                hours: int = 24, limit: int = 100):
        """Rule-based: flag every Denied access event with risk score + reason."""
        since = datetime.datetime.utcnow() - datetime.timedelta(hours=hours)
        q = (
            self.db.query(AccessLog)
            .filter(AccessLog.result == 'Denied')
            .filter(AccessLog.timestamp >= since)
            .order_by(AccessLog.timestamp.desc())
        )
        if facility_id: q = q.filter(AccessLog.facility_id == facility_id)
        logs = q.limit(limit).all()

        results = []
        for log in logs:
            is_hr  = _is_after_hours(log.timestamp)
            is_hrz = any(z.lower() in log.zone_id.lower() for z in HIGH_RISK_ZONES)
            score  = 50
            if is_hr:  score += 25
            if is_hrz: score += 20
            if log.user_type == 'Visitor': score += 10
            score = min(100, score)
            reasons = []
            if is_hr:  reasons.append('after-hours')
            if is_hrz: reasons.append('high-risk zone')
            if log.user_type == 'Visitor': reasons.append('visitor')
            d = _to_dict(log)
            d['risk_score']    = score
            d['severity']      = _severity_from_score(score)
            d['risk_reasons']  = reasons or ['access denied']
            d['is_after_hours'] = is_hr
            d['is_high_risk_zone'] = is_hrz
            results.append(d)
        return results

    # ── B. ANOMALY DETECTION (Isolation Forest) ───────────────
    def run_anomaly_detection(self, facility_id: str = None, days: int = 14):
        """Train Isolation Forest on access history, then score recent events."""
        since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        q = (
            self.db.query(AccessLog)
            .filter(AccessLog.timestamp >= since)
            .order_by(AccessLog.timestamp.asc())
        )
        if facility_id: q = q.filter(AccessLog.facility_id == facility_id)
        logs = q.all()

        fac = facility_id or 'ALL'
        if not ml.is_model_fresh(fac):
            ml.train_model(fac, logs)

        anomalies = ml.detect_anomalies(fac, logs)

        # Persist new anomalies to DB (avoid duplicates by access_id)
        existing_ids = {
            row[0] for row in
            self.db.query(AnomalyLog.anomaly_id).all()
        }
        # Use access_id stored in description as dedup key — simpler: clear old + re-insert
        # For simplicity, only insert if no anomaly_logs exist for this facility today
        today = datetime.datetime.utcnow().date()
        today_count = (
            self.db.query(AnomalyLog)
            .filter(AnomalyLog.facility_id == (facility_id or 'ALL'))
            .filter(AnomalyLog.timestamp >= datetime.datetime.combine(today, datetime.time.min))
            .count()
        )
        if today_count == 0 and anomalies:
            for a in anomalies[:50]:  # cap at 50 new records
                rec = AnomalyLog(
                    facility_id=a['facility_id'],
                    user_id=a['user_id'],
                    zone_id=a['zone_id'],
                    timestamp=datetime.datetime.fromisoformat(a['timestamp']),
                    anomaly_score=a['anomaly_score'],
                    anomaly_type=a['anomaly_type'],
                    description=a['description'],
                    hour_of_day=a['hour_of_day'],
                    day_of_week=a['day_of_week'],
                    is_weekend=a['is_weekend'],
                    zone_risk_level=a['zone_risk_level'],
                    status='New',
                )
                self.db.add(rec)
            self.db.commit()

        # Build scatter data
        anomaly_access_ids = {a['access_id'] for a in anomalies}
        scatter = ml.get_scatter_data(fac, logs[-500:], anomaly_access_ids)  # limit scatter pts

        return {
            'model_info':     ml.get_model_info(fac),
            'total_analyzed': len(logs),
            'anomalies_found': len(anomalies),
            'anomalies':      anomalies[:100],
            'scatter_data':   scatter,
        }

    def get_stored_anomalies(self, facility_id: str = None, limit: int = 50):
        """Return previously detected anomalies from DB."""
        q = self.db.query(AnomalyLog).order_by(AnomalyLog.timestamp.desc())
        if facility_id: q = q.filter(AnomalyLog.facility_id == facility_id)
        return [_to_dict(a) for a in q.limit(limit).all()]

    # ── C. VISITOR ZONE TRACKING ──────────────────────────────
    def check_visitor_zones(self, facility_id: str = None):
        """Validate that active visitors are only in authorized zones."""
        q = self.db.query(Visitor).filter(Visitor.status == 'active')
        if facility_id: q = q.filter(Visitor.facility_id == facility_id)
        visitors = q.all()

        violations = []
        for v in visitors:
            if not v.current_zone:
                continue
            allowed = json.loads(v.allowed_zones) if v.allowed_zones else None
            if allowed is None:
                continue  # no restriction defined
            if v.current_zone not in allowed:
                # Check for existing open violation
                existing = (
                    self.db.query(VisitorZoneViolation)
                    .filter(VisitorZoneViolation.visitor_id == v.visitor_id)
                    .filter(VisitorZoneViolation.zone_id == v.current_zone)
                    .filter(VisitorZoneViolation.status == 'Open')
                    .first()
                )
                if not existing:
                    viol = VisitorZoneViolation(
                        facility_id=v.facility_id,
                        visitor_id=v.visitor_id,
                        visitor_name=v.visitor_name,
                        zone_id=v.current_zone,
                        authorized_zones=v.allowed_zones or '[]',
                        violation_type='Unauthorized Zone',
                        risk_score=75.0,
                        status='Open',
                    )
                    self.db.add(viol)
                    violations.append(_to_dict(viol) if hasattr(viol, '__table__') else {'visitor_id': v.visitor_id, 'visitor_name': v.visitor_name, 'zone_id': v.current_zone})
                else:
                    violations.append(_to_dict(existing))
        if violations:
            self.db.commit()
        return violations

    def get_visitor_violations(self, facility_id: str = None):
        q = self.db.query(VisitorZoneViolation).filter(VisitorZoneViolation.status == 'Open')
        if facility_id: q = q.filter(VisitorZoneViolation.facility_id == facility_id)
        return [_to_dict(v) for v in q.order_by(VisitorZoneViolation.timestamp.desc()).all()]

    # ── D. INCIDENT INVESTIGATION ─────────────────────────────
    def get_incident_timeline(self, zone_id: str, facility_id: str,
                              ts_center: datetime.datetime = None,
                              window_hours: int = 2):
        """Pull all events around a timestamp/zone for investigation."""
        if ts_center is None:
            ts_center = datetime.datetime.utcnow()
        start = ts_center - datetime.timedelta(hours=window_hours)
        end   = ts_center + datetime.timedelta(hours=window_hours)

        access = (
            self.db.query(AccessLog)
            .filter(AccessLog.facility_id == facility_id)
            .filter(AccessLog.zone_id == zone_id)
            .filter(AccessLog.timestamp.between(start, end))
            .order_by(AccessLog.timestamp)
            .limit(50).all()
        )
        cctv = (
            self.db.query(CCTVEvent)
            .filter(CCTVEvent.facility_id == facility_id)
            .filter(CCTVEvent.zone_id == zone_id)
            .filter(CCTVEvent.timestamp.between(start, end))
            .order_by(CCTVEvent.timestamp)
            .limit(50).all()
        )
        incidents = (
            self.db.query(SecurityIncident)
            .filter(SecurityIncident.facility_id == facility_id)
            .filter(SecurityIncident.zone_id == zone_id)
            .filter(SecurityIncident.timestamp.between(start, end))
            .order_by(SecurityIncident.timestamp)
            .all()
        )

        timeline = []
        for log in access:
            timeline.append({
                'time': log.timestamp.isoformat(),
                'type': 'access',
                'icon': 'shield',
                'user': log.user_id,
                'description': f'{log.result} — {log.user_type} ({log.access_method}, {log.direction})',
                'severity': 'High' if log.result == 'Denied' else 'Low',
                'result': log.result,
            })
        for ev in cctv:
            timeline.append({
                'time': ev.timestamp.isoformat(),
                'type': 'cctv',
                'icon': 'camera',
                'description': f'CCTV: {ev.event_type} ({ev.person_count} person(s), {ev.confidence:.0%} conf)',
                'severity': ev.severity,
                'camera_id': ev.camera_id,
            })
        for inc in incidents:
            timeline.append({
                'time': inc.timestamp.isoformat(),
                'type': 'incident',
                'icon': 'alert',
                'description': f'INCIDENT: {inc.incident_type} — {inc.description[:80]}',
                'severity': inc.severity,
                'incident_id': inc.incident_id,
            })
        timeline.sort(key=lambda x: x['time'])
        return {
            'zone_id':     zone_id,
            'facility_id': facility_id,
            'window_start': start.isoformat(),
            'window_end':   end.isoformat(),
            'timeline':    timeline,
            'access_events': len(access),
            'cctv_events':   len(cctv),
            'incidents':     len(incidents),
        }

    # ── EXISTING METHODS (preserved) ─────────────────────────
    def get_alerts(self, facility_id: str = None, status: str = None, severity: str = None, limit: int = 50):
        q = self.db.query(SecurityAlert).order_by(SecurityAlert.timestamp.desc())
        if facility_id: q = q.filter(SecurityAlert.facility_id == facility_id)
        if status:      q = q.filter(SecurityAlert.status == status)
        if severity:    q = q.filter(SecurityAlert.severity == severity)
        return [_to_dict(a) for a in q.limit(limit).all()]

    def get_incidents(self, facility_id: str = None, status: str = None, limit: int = 50):
        q = self.db.query(SecurityIncident).order_by(SecurityIncident.timestamp.desc())
        if facility_id: q = q.filter(SecurityIncident.facility_id == facility_id)
        if status:      q = q.filter(SecurityIncident.investigation_status == status)
        return [_to_dict(i) for i in q.limit(limit).all()]

    def get_incident_detail(self, incident_id: int):
        incident = self.db.query(SecurityIncident).filter(SecurityIncident.incident_id == incident_id).first()
        if not incident: return None
        w_start = incident.timestamp - datetime.timedelta(hours=2)
        w_end   = incident.timestamp + datetime.timedelta(hours=2)
        related_logs = (
            self.db.query(AccessLog)
            .filter(AccessLog.facility_id == incident.facility_id,
                    AccessLog.zone_id == incident.zone_id,
                    AccessLog.timestamp.between(w_start, w_end))
            .order_by(AccessLog.timestamp).limit(20).all()
        )
        related_cctv = (
            self.db.query(CCTVEvent)
            .filter(CCTVEvent.facility_id == incident.facility_id,
                    CCTVEvent.zone_id == incident.zone_id,
                    CCTVEvent.timestamp.between(w_start, w_end))
            .order_by(CCTVEvent.timestamp).limit(20).all()
        )
        timeline = []
        for log in related_logs:
            timeline.append({
                'time': log.timestamp.isoformat(), 'type': 'access_log', 'icon': 'shield',
                'description': f'{log.result} access ({log.direction}) for {log.user_type} via {log.access_method}',
                'severity': 'High' if log.result == 'Denied' else 'Low',
            })
        for ev in related_cctv:
            timeline.append({
                'time': ev.timestamp.isoformat(), 'type': 'cctv_event', 'icon': 'camera',
                'description': f'CCTV: {ev.event_type} ({ev.person_count} person(s), confidence {ev.confidence:.0%})',
                'severity': ev.severity,
            })
        timeline.append({
            'time': incident.timestamp.isoformat(), 'type': 'incident', 'icon': 'alert',
            'description': f'Security Incident Created: {incident.incident_type}',
            'severity': incident.severity,
        })
        timeline.sort(key=lambda x: x['time'])
        return {
            'incident': _to_dict(incident),
            'timeline': timeline,
            'related_access_logs': [_to_dict(l) for l in related_logs],
            'related_cctv_events': [_to_dict(e) for e in related_cctv],
        }

    def update_incident_status(self, incident_id: int, status: str, assigned_to: str = None):
        incident = self.db.query(SecurityIncident).filter(SecurityIncident.incident_id == incident_id).first()
        if not incident: return None
        incident.investigation_status = status
        if assigned_to: incident.assigned_to = assigned_to
        if status in ('Resolved', 'False Positive'):
            incident.resolved_at = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(incident)
        return _to_dict(incident)

    def get_analytics(self, facility_id: str = None, days: int = 7):
        since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        q = self.db.query(AccessLog).filter(AccessLog.timestamp >= since)
        if facility_id: q = q.filter(AccessLog.facility_id == facility_id)
        logs = q.all()
        total  = len(logs)
        denied = sum(1 for l in logs if l.result == 'Denied')
        allowed = total - denied
        by_zone = {}
        by_hour = {str(h): 0 for h in range(24)}
        denied_by_hour = {str(h): 0 for h in range(24)}
        allowed_by_hour = {str(h): 0 for h in range(24)}
        for l in logs:
            by_zone[l.zone_id] = by_zone.get(l.zone_id, 0) + 1
            by_hour[str(l.timestamp.hour)] += 1
            if l.result == 'Denied':  denied_by_hour[str(l.timestamp.hour)] += 1
            else:                     allowed_by_hour[str(l.timestamp.hour)] += 1
        vq = self.db.query(Visitor)
        if facility_id: vq = vq.filter(Visitor.facility_id == facility_id)
        visitors = vq.all()
        active_v = sum(1 for v in visitors if v.status == 'active')
        cctv_q = self.db.query(CCTVEvent).filter(CCTVEvent.timestamp >= since)
        if facility_id: cctv_q = cctv_q.filter(CCTVEvent.facility_id == facility_id)
        cctv_events = cctv_q.all()
        by_type = {}
        for e in cctv_events:
            by_type[e.event_type] = by_type.get(e.event_type, 0) + 1
        risk_index = min(100, int((denied / total * 100) * 2 + len([e for e in cctv_events if e.severity == 'High']) * 5)) if total > 0 else 0
        return {
            'total_access_events':  total,
            'allowed_count':        allowed,
            'denied_count':         denied,
            'denial_rate_pct':      round(denied / total * 100, 1) if total else 0,
            'events_by_zone':       by_zone,
            'events_by_hour':       by_hour,
            'denied_by_hour':       denied_by_hour,
            'allowed_by_hour':      allowed_by_hour,
            'cctv_events_by_type':  by_type,
            'total_cctv_events':    len(cctv_events),
            'total_visitors':       len(visitors),
            'active_visitors':      active_v,
            'security_risk_index':  risk_index,
        }

    def get_visitors(self, facility_id: str = None, status: str = None):
        q = self.db.query(Visitor).order_by(Visitor.check_in_time.desc())
        if facility_id: q = q.filter(Visitor.facility_id == facility_id)
        if status:      q = q.filter(Visitor.status == status)
        return [_to_dict(v) for v in q.limit(100).all()]

    def get_access_logs(self, facility_id: str = None, result: str = None, limit: int = 100):
        q = self.db.query(AccessLog).order_by(AccessLog.timestamp.desc())
        if facility_id: q = q.filter(AccessLog.facility_id == facility_id)
        if result:      q = q.filter(AccessLog.result == result)
        return [_to_dict(l) for l in q.limit(limit).all()]

    def get_cctv_events(self, facility_id: str = None, limit: int = 50):
        q = self.db.query(CCTVEvent).order_by(CCTVEvent.timestamp.desc())
        if facility_id: q = q.filter(CCTVEvent.facility_id == facility_id)
        return [_to_dict(e) for e in q.limit(limit).all()]

    def get_risk_summary(self, facility_id: str = None):
        analytics    = self.get_analytics(facility_id)
        recent_alerts = self.get_alerts(facility_id=facility_id, limit=10)
        critical = sum(1 for a in recent_alerts if a['severity'] == 'Critical')
        high     = sum(1 for a in recent_alerts if a['severity'] == 'High')
        score    = min(100, critical * 25 + high * 10 + analytics['denied_count'])
        return {
            'risk_score':            score,
            'severity':              _severity_from_score(score),
            'critical_alerts':       critical,
            'high_alerts':           high,
            'recent_alerts':         recent_alerts[:5],
            'denied_access_events':  analytics['denied_count'],
            'security_risk_index':   analytics['security_risk_index'],
        }

    def analyze_and_create_alerts(self, facility_id: str = None):
        since = datetime.datetime.utcnow() - datetime.timedelta(hours=1)
        q = self.db.query(AccessLog).filter(
            AccessLog.result == 'Denied', AccessLog.timestamp >= since,
        )
        if facility_id: q = q.filter(AccessLog.facility_id == facility_id)
        denied_logs = q.all()
        user_failures = {}
        for log in denied_logs:
            user_failures.setdefault(log.user_id, []).append(log)
        created = 0
        for uid, logs in user_failures.items():
            if len(logs) >= 3:
                fac  = logs[0].facility_id
                score = risk_service.calculate_risk_score({'unauthorized_access': True, 'repeated_failures': len(logs)})
                existing = (
                    self.db.query(SecurityAlert)
                    .filter(SecurityAlert.facility_id == fac,
                            SecurityAlert.alert_type == 'Repeated Failed Login',
                            SecurityAlert.timestamp >= since).first()
                )
                if not existing:
                    alert = SecurityAlert(
                        facility_id=fac, zone_id=logs[0].zone_id,
                        alert_type='Repeated Failed Login',
                        severity=risk_service.get_severity(score),
                        risk_score=score, user_id=uid,
                        message=f'User {uid} had {len(logs)} failed access attempts in the last hour.',
                        recommended_action='Verify identity and temporarily suspend access card.',
                        status='Open',
                    )
                    self.db.add(alert)
                    event_service.publish(
                        facility_id=fac, agent='security',
                        event_type='REPEATED_FAILURES', severity='HIGH',
                        data={'user_id': uid, 'failure_count': len(logs)},
                    )
                    created += 1
        if created: self.db.commit()
        return {'alerts_created': created}
