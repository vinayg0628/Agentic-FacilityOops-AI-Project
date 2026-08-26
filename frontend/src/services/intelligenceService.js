import axios from 'axios';
const API = 'http://localhost:8000/api';
const client = axios.create({ baseURL: API, timeout: 10000 });

export const fetchCrossAgentEvents = async (facilityId=null, agent=null, limit=100) => {
    try {
        const r = await client.get('/intelligence/events', { params: { facility_id: facilityId, agent, limit } });
        return r.data;
    } catch { return []; }
};

export const fetchIntelligenceInsights = async (facilityId=null) => {
    try {
        const r = await client.get('/intelligence/insights', { params: { facility_id: facilityId } });
        return r.data;
    } catch { return []; }
};

export const fetchIntelligenceRecommendations = async (facilityId=null) => {
    try {
        const r = await client.get('/intelligence/recommendations', { params: { facility_id: facilityId } });
        return r.data;
    } catch { return []; }
};
