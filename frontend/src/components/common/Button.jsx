import React from 'react';

const Button = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-lg font-semibold text-white shadow-md bg-pink-500 hover:bg-pink-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
