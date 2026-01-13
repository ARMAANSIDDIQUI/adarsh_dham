import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { usePWA } from '../../context/PWAContext';

const InstallPWAPrompt = () => {
    const { isInstallable, installPWA } = usePWA();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // If not installable (already installed or event not fired), don't do anything
        if (!isInstallable) return;

        // Check frequency (Once a day)
        const lastShown = localStorage.getItem('pwa_prompt_last_shown');
        const lastShownTime = lastShown ? parseInt(lastShown, 10) : 0;
        const twoHours = 2 * 60 * 60 * 1000;

        if (Date.now() - lastShownTime < twoHours) {
            return; // Shown within the last 2 hours
        }

        // Delay showing the prompt
        const timer = setTimeout(() => {
            setShowPrompt(true);
            localStorage.setItem('pwa_prompt_last_shown', Date.now().toString());
        }, 12000);

        return () => clearTimeout(timer);
    }, [isInstallable]);

    const handleInstallClick = () => {
        installPWA();
        setShowPrompt(false);
    };

    const handleClose = () => {
        setShowPrompt(false);
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.5 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-8 md:w-96 z-[9999] font-body"
                >
                    <div className="bg-card p-5 rounded-2xl shadow-2xl border-2 border-primary/30 flex flex-col relative">
                        <button 
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                        
                        <div className="flex items-center space-x-4 mb-3">
                            <div className="bg-primary/20 p-3 rounded-full">
                                <img 
                                    src="VM401196.png" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = "VM401196.JPG"; }}
                                    alt="App Icon" 
                                    className="w-10 h-10 object-contain" 
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold font-heading text-primaryDark">Install App</h3>
                                <p className="text-xs text-gray-600">Get a better experience with our app!</p>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-4">
                            Install Shri Adarsh Dham on your device for quick access and a smoother experience.
                        </p>

                        <button
                            onClick={handleInstallClick}
                            className="w-full py-2 bg-primaryDark hover:bg-highlight text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                        >
                            <FaDownload className="text-sm" />
                            <span>Install Now</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InstallPWAPrompt;