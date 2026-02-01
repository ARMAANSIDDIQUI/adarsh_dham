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

    // Handle click anywhere to close
    useEffect(() => {
        if (isOpen) {
            const handleTouchOrClick = () => {
                onClose();
            };

            // We add a slight delay to avoid immediate closing if the submit click bubbles up
            // though typically the modal is in a portal or overlay.
            // Better: put the onClick on the backdrop.
            // But the user said "touching the screen" which implies anywhere.
            window.addEventListener('click', handleTouchOrClick);
            window.addEventListener('touchstart', handleTouchOrClick);

            return () => {
                window.removeEventListener('click', handleTouchOrClick);
                window.removeEventListener('touchstart', handleTouchOrClick);
            };
        }
    }, [isOpen, onClose]);

    // Prevent internal clicks from closing immediately if we rely on window listeners, 
    // but if we want "touching the screen" (anywhere), we might just want to let it close.
    // However, usually we want to block the click propagation from the *trigger* event.
    // The trigger event (submit) happened *before* this component mounted/became open.
    // So adding the listener in useEffect should be fine as it runs after render.

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
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center relative border border-white/20"
                        onClick={(e) => e.stopPropagation()} // Optional: if we want clicking INSIDE to NOT close. But requirement says "touching the screen". Usually this means "anywhere". Valid interpretation: "Anywhere" includes the modal.
                    >
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-green-100 p-4">
                                <IoCheckmarkCircle className="text-6xl text-green-500" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold font-heading text-gray-800 dark:text-white mb-3">
                            {title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                            {message}
                        </p>

                        <div className="mt-6 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 10, ease: "linear" }}
                                className="h-full bg-green-500"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessModal;
