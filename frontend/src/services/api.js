import axios from 'axios';
import toast from 'react-hot-toast';
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 15000,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
};
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      if (!isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('Token expirado detectado no interceptor de request');
      }
    }
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      console.error('❌ Critical error without config:', error);
      toast.error('Erro de conexão com o servidor');
      return Promise.reject(error);
    }
    if (originalRequest.url === '/auth/refresh-token' || 
        originalRequest.url === '/auth/login') {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          handleForceLogout('Sessão expirada. Faça login novamente.');
          return Promise.reject(new Error('No refresh token available'));
        }
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );
        const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;
        if (!newAccessToken) {
          throw new Error('Invalid token response from server');
        }
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        window.dispatchEvent(new CustomEvent('token-refreshed', { 
          detail: { token: newAccessToken } 
        }));
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Token renovado com sucesso');
        }
        return api(originalRequest);
      } catch (refreshError) {
        const errorMessage = refreshError.response?.data?.message || 
                            'Sessão expirada. Por favor, faça login novamente.';
        processQueue(refreshError, null);
        handleForceLogout(errorMessage);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    handleApiError(error);
    return Promise.reject(error);
  }
);
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    return timeUntilExpiry < 30000; 
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; 
  }
}
function handleForceLogout(message = 'Sessão expirada') {
  localStorage.clear();
  toast.error(message, {
    duration: 5000,
    icon: '🔒',
  });
  window.dispatchEvent(new CustomEvent('force-logout'));
  setTimeout(() => {
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, 1500);
}
function handleApiError(error) {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      toast.error('Requisição muito lenta. Verifique sua conexão.');
    } else if (!navigator.onLine) {
      toast.error('Sem conexão com a internet');
    } else {
      toast.error('Erro de conexão com o servidor');
    }
    return;
  }
  const { status, data } = error.response;
  if (status === 401) return;
  switch (status) {
    case 400:
      toast.error(data?.message || 'Dados inválidos');
      break;
    case 403:
      toast.error('Você não tem permissão para realizar esta ação');
      break;
    case 404:
      toast.error(data?.message || 'Recurso não encontrado');
      break;
    case 409:
      toast.error(data?.message || 'Conflito de dados');
      break;
    case 413:
      toast.error('Arquivo muito grande');
      break;
    case 422:
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        toast.error(firstError || 'Dados inválidos');
      } else {
        toast.error(data?.message || 'Erro de validação');
      }
      break;
    case 429:
      toast.error('Muitas requisições. Aguarde um momento.');
      break;
    case 500:
      toast.error('Erro interno do servidor. Tente novamente.');
      console.error('Server Error 500:', data);
      break;
    case 502:
    case 503:
      toast.error('Serviço temporariamente indisponível');
      break;
    default:
      toast.error(data?.message || 'Erro inesperado');
  }
}
api.checkTokenValidity = () => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) return false;
  return !isTokenExpired(token);
};
api.forceRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new Error('No refresh token');
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/auth/refresh-token`,
      { refreshToken }
    );
    const { token, refreshToken: newRefreshToken } = response.data;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    if (newRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    }
    return token;
  } catch (error) {
    handleForceLogout();
    throw error;
  }
};
api.getFileUploadConfig = () => ({
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000, 
});
api.withRetry = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i < maxRetries - 1 && 
          (!error.response || error.response.status >= 500)) {
        await new Promise(resolve => 
          setTimeout(resolve, API_CONFIG.RETRY_DELAY * (i + 1))
        );
        continue;
      }
      throw error;
    }
  }
};
window.addEventListener('online', () => {
  toast.success('Conexão restaurada!', { icon: '🌐' });
});
window.addEventListener('offline', () => {
  toast.error('Você está offline', { icon: '📡' });
});
window.addEventListener('beforeunload', () => {
  isRefreshing = false;
  failedQueue = [];
});
export default api;