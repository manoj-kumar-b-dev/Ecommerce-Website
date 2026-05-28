import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-10 w-10 border-4',
    large: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-gray-200 border-t-primary ${sizeClasses[size]}`} />
    </div>
  );
};

export default LoadingSpinner;