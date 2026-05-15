import React from 'react';
const LoadingSpinner = ({ size = 'medium', message = 'Carregando...' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4',
  };
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${spinnerSize} border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
export default LoadingSpinner;