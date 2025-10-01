import React from 'react';

const Loader = ({ size = 'medium', text = '' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`loader-spinner ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default Loader;
