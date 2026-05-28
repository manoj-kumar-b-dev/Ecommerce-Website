import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-5 w-5',
    medium: 'h-10 w-10',
    large: 'h-14 w-14',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 rounded-full border-2 border-gray-200`} />
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin`} />
      </div>
    </div>
  );
};

export default LoadingSpinner;