import React from 'react';
const ErrorFallback = ({ error, onReset, onReload }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="card max-w-md w-full text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Algo deu errado
        </h2>
        <p className="text-gray-600 mb-6">
          Desculpe, ocorreu um erro inesperado. Nossa equipe já foi notificada.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">Detalhes do erro:</p>
            <pre className="text-xs text-red-600 overflow-auto max-h-32">
              {error.message}
            </pre>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={onReset}
            className="btn-primary w-full"
          >
            Tentar novamente
          </button>
          <button
            onClick={onReload}
            className="btn-secondary w-full"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
};
export default ErrorFallback;