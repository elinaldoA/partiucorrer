import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const NotFound = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="text-center animate-scaleIn">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <div className="space-y-3">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>🏠</span>
            <span>{isAuthenticated ? 'Voltar ao Dashboard' : 'Ir para Login'}</span>
          </Link>
          <br />
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <span>⬅️</span>
            <span>Voltar para página anterior</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default NotFound;