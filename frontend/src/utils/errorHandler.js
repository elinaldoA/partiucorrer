import toast from 'react-hot-toast';
export const errorHandler = {
  handle(error, customMessage = '') {
    console.error('Error:', error);
    if (!error.response) {
      toast.error('Erro de conexão. Verifique sua internet.');
      return 'NETWORK_ERROR';
    }
    const { status, data } = error.response;
    switch (status) {
      case 400:
        toast.error(data.message || customMessage || 'Dados inválidos');
        return 'BAD_REQUEST';
      case 401:
        toast.error('Sessão expirada. Faça login novamente.');
        return 'UNAUTHORIZED';
      case 403:
        toast.error('Você não tem permissão para realizar esta ação.');
        return 'FORBIDDEN';
      case 404:
        toast.error(data.message || 'Recurso não encontrado');
        return 'NOT_FOUND';
      case 409:
        toast.error(data.message || 'Conflito de dados');
        return 'CONFLICT';
      case 422:
        toast.error(data.message || 'Dados inválidos');
        return 'VALIDATION_ERROR';
      case 429:
        toast.error('Muitas requisições. Tente novamente em alguns minutos.');
        return 'RATE_LIMIT';
      case 500:
      case 502:
      case 503:
        toast.error('Erro no servidor. Tente novamente mais tarde.');
        return 'SERVER_ERROR';
      default:
        toast.error(customMessage || 'Erro inesperado');
        return 'UNKNOWN_ERROR';
    }
  },
  async withRetry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        if (error.response?.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          continue;
        }
        throw error;
      }
    }
  },
};