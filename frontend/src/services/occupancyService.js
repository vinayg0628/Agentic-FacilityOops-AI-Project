import axios from 'axios';

const BASE = 'http://localhost:8000/api/occupancy';

// Fast client — 20s for all standard endpoints
const client = axios.create({ baseURL: BASE, timeout: 20000 });

// Slow client — 90s for ML forecast (trains RandomForest on first call after restart)
const slowClient = axios.create({ baseURL: BASE, timeout: 90000 });

const get = async (path, params = {}, useSlowClient = false) => {
    const c = useSlowClient ? slowClient : client;
    try {
        const r = await c.get(path, { params });
        return r.data;
    } catch (e) {
        console.warn('[occupancyService]', path, e.message);
        return null;
    }
};

export const fetchCurrentOccupancy  = (facilityId) => get('', { facility_id: facilityId });
export const fetchLiveOccupancy     = (facilityId) => get('/live', { facility_id: facilityId });
export const fetchOccupancyAnalytics = (facilityId, days = 7) => get('/analytics', { facility_id: facilityId, days });
export const fetchUtilizationReport = (facilityId, days = 7) => get('/utilization', { facility_id: facilityId, days });
export const fetchFloorHeatmap      = (facilityId, floor = null) => get('/heatmap/floor', { facility_id: facilityId, ...(floor ? { floor } : {}) });
export const fetchHeatmapMatrix     = (facilityId, days = 7) => get('/heatmap/matrix', { facility_id: facilityId, days });
export const fetchActiveAlerts      = (facilityId) => get('/alerts/active', { facility_id: facilityId });
export const fetchRecommendations   = (facilityId) => get('/recommendations', { facility_id: facilityId });
export const fetchRooms             = (facilityId, floor = null) => get('/rooms', { facility_id: facilityId, ...(floor ? { floor } : {}) });

/** Uses 90s timeout — RandomForestRegressor trains on first call after restart */
export const fetchMLForecast        = (facilityId, hoursAhead = 24) =>
    get('/forecast/ml', { facility_id: facilityId, hours_ahead: hoursAhead }, true /* slowClient */);
