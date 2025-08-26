// src/components/ConfirmationDialog.jsx
import React from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm w-full`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Confirm Cancellation</h3>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
        <div className="flex justify-end space-x-4">
          <button className={`px-4 py-2 ${isDark ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`} onClick={onClose}>Keep Booking</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={onConfirm}>Cancel Booking</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
