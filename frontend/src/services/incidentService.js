import axios from 'axios';
const API = 'http://localhost:8000/api';
const client = axios.create({ baseURL: API, timeout: 10000 });

export const fetchIncidents = async (facilityId=null, status=null) => {
    try {
        const r = await client.get('/incidents', { params: { facility_id: facilityId, status } });
        return r.data;
    } catch { return []; }
};

export const fetchIncidentDetail = async (id) => {
    try {
        const r = await client.get(`/incidents/${id}`);
        return r.data;
    } catch { return null; }
};

export const updateIncidentStatus = async (id, status, assignedTo=null) => {
    try {
        const r = await client.put(`/incidents/${id}`, { status, assigned_to: assignedTo });
        return r.data;
    } catch { return null; }
};
