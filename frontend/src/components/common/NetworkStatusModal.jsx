import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

const NetworkStatusModal = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // If online, don't render anything
    if (isOnline) return null;

    return (
        <AnimatePresence>
            {!isOnline && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-body">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border-4 border-red-400 overflow-hidden"
                    >
                        <div className="bg-red-50 p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-sm">
                                <FaWifi size={32} className="relative z-10" />
                                <FaExclamationTriangle size={16} className="absolute top-3 right-3 text-red-600 bg-red-100 rounded-full border-2 border-red-50" />
                            </div>
                            
                            <h2 className="text-2xl font-bold font-heading text-red-600 mb-2">
                                No Internet Connection
                            </h2>
                            <p className="text-gray-700 text-sm leading-relaxed mb-6">
                                It seems you are offline. Please check your internet connection and try again. The application requires an active connection to function correctly.
                            </p>

                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <span>Reload Page</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NetworkStatusModal;
