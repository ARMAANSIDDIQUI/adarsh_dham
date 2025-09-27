import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaBuilding, FaHeart, FaBell, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// You can replace this with the actual path to your background image
const heroImageUrl = 'https://images.unsplash.com/photo-1540322388339-291b1a784c47?q=80&w=2070&auto=format&fit=crop';

const Home = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const [liveLinks, setLiveLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    const featureCardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    useEffect(() => {
        const fetchLiveLinks = async () => {
            try {
                // Correctly using your provided environment variable names
                const apiUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${apiUrl}/api/satsang/live-links/active`);
                setLiveLinks(response.data || []);
            } catch (error) {
                console.error('Error fetching live links:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchLiveLinks();
        
        const interval = setInterval(fetchLiveLinks, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, []);

    const LiveMarquee = ({ links }) => {
        if (!links || links.length === 0) return null;
        
        return (
            <div className="marquee-container bg-pink-600 text-white py-2 overflow-hidden">
                <div className="marquee-content flex items-center">
                    {links.map((link, index) => (
                        <a 
                            key={index} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center mx-4"
                        >
                            <img src="/live_icon.png" alt="Live" className="h-6 w-6 mr-2 animate-pulse" />
                            <h3 className="text-xl font-bold whitespace-nowrap">
                                We are LIVE! Join the event: {link.name}
                            </h3>
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center mt-10 text-xl text-pink-500"><FaSpinner className="animate-spin inline mr-2" /> Loading...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
            <LiveMarquee links={liveLinks} />
            
            <div 
                className="relative flex items-center justify-center h-[60vh] md:h-[70vh] bg-cover bg-center text-white" 
                style={{ backgroundImage: `url(${heroImageUrl})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center p-4 max-w-xl mx-auto"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 drop-shadow-md">
                        Welcome to Adarsh Dham
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-8 drop-shadow-sm">
                        Your spiritual home for events and a peaceful stay. Manage your accommodation easily.
                    </p>
                    <Link 
                        to="/calendar" 
                        className="inline-block px-8 py-3 bg-white text-pink-600 text-lg font-semibold rounded-lg shadow-xl hover:bg-pink-500 hover:text-white transition-colors duration-300 transform hover:scale-[1.02]"
                    >
                        View Event Calendar
                    </Link>
                </motion.div>
            </div>

            <main className="container mx-auto px-4 py-12 md:py-16">
                <section className="text-center">
                    <h2 className="text-3xl font-bold mb-10 text-gray-800 border-b-2 border-pink-500 inline-block pb-1">Key Features</h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div 
                            variants={featureCardVariants}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center"
                        >
                            <div className="bg-pink-100 p-4 rounded-full mb-4">
                                <FaCalendarAlt className="text-4xl text-pink-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Event Calendar</h3>
                            <p className="text-gray-600">Stay updated on all our spiritual and community events.</p>
                        </motion.div>
                        <motion.div 
                            variants={featureCardVariants}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center"
                        >
                            <div className="bg-pink-100 p-4 rounded-full mb-4">
                                <FaBuilding className="text-4xl text-pink-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Accommodation Booking</h3>
                            <p className="text-gray-600">Effortlessly request and manage stay for any event.</p>
                        </motion.div>
                        <motion.div 
                            variants={featureCardVariants}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center"
                        >
                            <div className="bg-pink-100 p-4 rounded-full mb-4">
                                <FaHeart className="text-4xl text-pink-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-800">Seamless Experience</h3>
                            <p className="text-gray-600">A clean and intuitive interface designed for all users.</p>
                        </motion.div>
                    </motion.div>
                </section>

                <section className="mt-20 text-center">
                    <h2 className="text-3xl font-bold mb-10 text-gray-800 border-b-2 border-pink-500 inline-block pb-1">Quick Links</h2>
                    <div className="flex justify-center">
                        <Link to="/my-bookings" className="w-full max-w-xs block">
                            <motion.div 
                                whileHover={{ scale: 1.03 }}
                                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform border-t-4 border-pink-500 flex flex-col items-center"
                            >
                                <div className="bg-pink-100 p-4 rounded-full mb-4">
                                    <FaBell className="text-4xl text-pink-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">My Bookings</h3>
                            </motion.div>
                        </Link>
                    </div>
                </section>
            </main>
        </motion.div>
    );
};

export default Home;