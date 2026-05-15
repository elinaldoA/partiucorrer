
import api from './api';
const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user } = response.data;
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));
    return { user, token, refreshToken };
  },
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    const { token, refreshToken, user } = response.data;
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));
    return { user, token };
  },
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
    }
  },
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return response.data;
  },
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  async resetPassword(token, password) {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    const response = await api.post('/auth/refresh-token', { refreshToken });
    const { token, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem('token', token);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return token;
  },
};
export default authService;