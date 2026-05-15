import api from './api';
const subscriptionService = {
  async getCurrentPlan() {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },
  async getPlans() {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },
  async createPreference(planId) {
    const response = await api.post('/subscriptions/create-preference', { plan_id: planId });
    return response.data;
  },
  async cancelSubscription() {
    const response = await api.post('/subscriptions/cancel');
    return response.data;
  },
};
export default subscriptionService;