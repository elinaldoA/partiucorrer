import api from './api';
const groupService = {
  async getGroups() {
    const response = await api.get('/groups');
    return response.data;
  },
  async createGroup(data) {
    const response = await api.post('/groups', data);
    return response.data;
  },
  async joinGroup(code) {
    const response = await api.post(`/groups/${code}/join`);
    return response.data;
  },
  async leaveGroup(id) {
    const response = await api.post(`/groups/${id}/leave`);
    return response.data;
  },
  async getGroupMembers(id) {
    const response = await api.get(`/groups/${id}/members`);
    return response.data;
  },
  async getGroupMessages(id) {
    const response = await api.get(`/groups/${id}/messages`);
    return response.data;
  },
  async sendMessage(id, message) {
    const response = await api.post(`/groups/${id}/messages`, { message });
    return response.data;
  },
};
export default groupService;