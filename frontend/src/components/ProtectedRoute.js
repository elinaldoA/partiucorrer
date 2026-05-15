import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageLoader from './PageLoader';
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <PageLoader />;
  }
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Faça login para acessar esta página' 
        }} 
        replace 
      />
    );
  }
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
};
export default ProtectedRoute;