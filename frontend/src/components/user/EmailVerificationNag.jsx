import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaUserShield } from 'react-icons/fa';

const EmailVerificationNag = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Check if user has email
        if (user.email) return;

        // Check last nag time
        const checkAndShow = () => {
            const lastNag = localStorage.getItem('emailVerificationNagTime');
            const now = Date.now();
            const tenMinutes = 10 * 60 * 1000;

            if (!lastNag || (now - parseInt(lastNag)) > tenMinutes) {
                setIsVisible(true);
                localStorage.setItem('emailVerificationNagTime', now.toString());
            }
        };

        checkAndShow();
        const interval = setInterval(checkAndShow, 60 * 1000); // Check every minute if 10 mins passed

        return () => clearInterval(interval);

    }, [isAuthenticated, user]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleNavigate = () => {
        setIsVisible(false);
        navigate('/profile');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4 font-body">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-card w-full max-w-md p-6 rounded-2xl shadow-2xl border border-primary/20 relative"
                    >
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FaTimes />
                        </button>

                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                                <FaUserShield className="text-amber-500 text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-primaryDark mb-2 font-heading">Secure Your Account</h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                Adding a verified email is crucial for account recovery. If you lose your password, verified email is the only way to reset it instantly.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleClose}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Later
                                </button>
                                <button
                                    onClick={handleNavigate}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark shadow-soft text-sm font-bold transition-colors"
                                >
                                    Add Email Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EmailVerificationNag;
