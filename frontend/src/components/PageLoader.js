import React from 'react';
const PageLoader = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh]">
      <div className="relative">
        {}
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        {}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">🏃</span>
        </div>
        {}
        <div className="absolute -inset-4 border-4 border-transparent border-t-blue-400/30 rounded-full animate-spin-slow"></div>
      </div>
      {}
      <p className="mt-6 text-gray-600 dark:text-gray-400 animate-pulse font-medium">
        {message}
      </p>
      {}
      <div className="flex space-x-1 mt-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};
export default PageLoader;