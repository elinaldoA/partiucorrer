import api from './api';
const runService = {
  async getRuns(params = {}) {
    const response = await api.get('/runs', { params });
    return response.data;
  },
  async getRunById(id) {
    const response = await api.get(`/runs/${id}`);
    return response.data;
  },
  async saveRun(runData) {
    const response = await api.post('/runs', runData);
    return response.data;
  },
  async deleteRun(id) {
    const response = await api.delete(`/runs/${id}`);
    return response.data;
  },
  async getStats() {
    const response = await api.get('/runs/stats');
    return response.data;
  },
  async exportGPX(id) {
    const response = await api.get(`/runs/${id}/export-gpx`, {
      responseType: 'blob'
    });
    return response.data;
  },
};
export default runService;