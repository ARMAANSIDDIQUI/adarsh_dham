import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = true }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes />
                    </button>
                    <div className="flex flex-col items-center text-center">
                        <div className={`p-4 rounded-full mb-4 ${isDanger ? 'bg-red-100 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            <FaExclamationTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">{title || "Confirm Action"}</h3>
                        <p className="text-gray-600 mb-6 text-sm">{message}</p>
                    </div>
                    <div className="flex justify-end gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2 font-medium text-white rounded-lg shadow-sm transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primaryDark'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmModal;
