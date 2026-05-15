import api from './api';
const competitionService = {
  async getCompetitions() {
    const response = await api.get('/competitions');
    return response.data;
  },
  async getMyCompetitions() {
    const response = await api.get('/competitions/my');
    return response.data;
  },
  async createCompetition(data) {
    const response = await api.post('/competitions', data);
    return response.data;
  },
  async joinCompetition(id) {
    const response = await api.post(`/competitions/${id}/join`);
    return response.data;
  },
  async leaveCompetition(id) {
    const response = await api.post(`/competitions/${id}/leave`);
    return response.data;
  },
  async getRanking(id) {
    const response = await api.get(`/competitions/${id}/ranking`);
    return response.data;
  },
};
export default competitionService;