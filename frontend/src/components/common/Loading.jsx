import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-neutral z-[9999]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <div className="relative w-32 h-32 mb-6">
                    {/* Pulsing background effect */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-card rounded-full shadow-soft flex items-center justify-center border-4 border-primary">
                        <img 
                            src="/VM401196.png" 
                            alt="Shri Adarsh Dham Logo" 
                            className="w-20 h-20 object-contain"
                        />
                    </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-primaryDark mb-2 tracking-wide">
                    Shri Adarsh Dham
                </h1>
                <p className="text-accent font-medium text-sm tracking-widest uppercase">
                    Spiritual Sanctuary
                </p>

                {/* Custom Loader */}
                <div className="mt-8 flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-primaryDark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Loading;
