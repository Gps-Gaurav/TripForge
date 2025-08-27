// components/BusSeats/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, isDark }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`relative rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close button */}
            <button
              className={`absolute top-3 right-3 text-2xl font-bold rounded-full px-2 transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Title */}
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
