import axios from 'axios';

const BASE = 'http://localhost:8000/api/security';

// Standard client — 20 s
const client = axios.create({ baseURL: BASE, timeout: 20000 });

// Slow client — 90 s for Isolation Forest training (first call only; model cached afterwards)
const slowClient = axios.create({ baseURL: BASE, timeout: 90000 });

const get = async (path, params = {}, useSlowClient = false) => {
    const c = useSlowClient ? slowClient : client;
    try { const r = await c.get(path, { params }); return r.data; }
    catch (e) { console.warn('[securityService]', path, e.message); return null; }
};
const post = async (path, params = {}) => {
    try { const r = await client.post(path, null, { params }); return r.data; }
    catch (e) { console.warn('[securityService]', path, e.message); return null; }
};

// ── Existing endpoints ────────────────────────────────────────────────────────
export const fetchSecurityAlerts    = (facilityId, status, severity) =>
    get('/alerts', { facility_id: facilityId, status, severity });
export const fetchSecurityIncidents = (facilityId, status) =>
    get('/incidents', { facility_id: facilityId, status });
export const fetchAccessLogs        = (facilityId, result, limit = 100) =>
    get('/access-logs', { facility_id: facilityId, result, limit });
export const fetchVisitors          = (facilityId, status) =>
    get('/visitors', { facility_id: facilityId, status });
export const fetchCCTVEvents        = (facilityId, limit = 50) =>
    get('/events', { facility_id: facilityId, limit });
export const fetchRiskSummary       = (facilityId) =>
    get('/risk', { facility_id: facilityId });
export const fetchSecurityAnalytics = (facilityId, days = 7) =>
    get('/analytics', { facility_id: facilityId, days });
export const runSecurityAnalysis    = (facilityId) =>
    post('/analyze', { facility_id: facilityId });

// ── Phase B — new endpoints ───────────────────────────────────────────────────
export const fetchUnauthorizedAccess = (facilityId, hours = 24) =>
    get('/unauthorized', { facility_id: facilityId, hours });

/** Uses 90 s timeout — IsolationForest training is slow on first call */
export const fetchAnomalies          = (facilityId, days = 14) =>
    get('/anomalies', { facility_id: facilityId, days }, true /* slowClient */);

export const fetchStoredAnomalies    = (facilityId) =>
    get('/anomalies/stored', { facility_id: facilityId });
export const fetchVisitorViolations  = (facilityId) =>
    get('/visitor-violations', { facility_id: facilityId });
export const fetchInvestigation      = (facilityId, zoneId, timestamp = null, windowHours = 2) =>
    get('/investigation', { facility_id: facilityId, zone_id: zoneId, timestamp, window_hours: windowHours });
