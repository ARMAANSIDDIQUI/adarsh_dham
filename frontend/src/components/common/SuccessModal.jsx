import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCheckmarkCircle } from 'react-icons/io5';

const SuccessModal = ({ isOpen, onClose, title, message }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 10000); // 10 seconds auto-close

            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            const handleTouchOrClick = () => {
                onClose();
            };
            window.addEventListener('click', handleTouchOrClick);
            window.addEventListener('touchstart', handleTouchOrClick);

            return () => {
                window.removeEventListener('click', handleTouchOrClick);
                window.removeEventListener('touchstart', handleTouchOrClick);
            };
        }
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-card rounded-2xl shadow-2xl border-4 border-primary max-w-sm w-full mx-4 text-center relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-primary/10 p-6 text-center border-b border-primary/20">
                            <div className="flex justify-center mb-4">
                                <div className="rounded-full bg-white p-2 shadow-sm">
                                    <IoCheckmarkCircle className="text-5xl text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold font-heading text-primaryDark">
                                {title}
                            </h3>
                        </div>

                        <div className="p-8">
                            <p className="text-gray-700 font-medium text-lg">
                                {message}
                            </p>
                        </div>

                        <div className="w-full bg-primary/10 h-2">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 10, ease: "linear" }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessModal;
