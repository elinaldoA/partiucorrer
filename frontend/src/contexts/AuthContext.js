
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';
const AuthContext = createContext(null);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
          try {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
          } catch {
            try {
              await authService.refreshToken();
              const refreshedUser = JSON.parse(localStorage.getItem('user'));
              setUser(refreshedUser);
              setIsAuthenticated(true);
            } catch {
              localStorage.clear();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { user, token } = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return false;
    }
  }, []);
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      toast.success('Logout realizado com sucesso!');
    }
  }, []);
  const updateUser = useCallback((userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    setError,
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};