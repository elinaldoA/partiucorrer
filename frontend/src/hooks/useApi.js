import { useState, useCallback } from 'react';
import { errorHandler } from '../utils/errorHandler';
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (error) {
      const errorCode = errorHandler.handle(error);
      setError(error.message || 'Erro desconhecido');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  return { data, loading, error, execute, reset };
};