// components/BusSeats/Modal.jsx
import React from 'react';

const Modal = ({ isOpen, onClose, title, children, isDark }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative rounded-lg shadow-lg p-6 max-w-md w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-xl font-bold"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
