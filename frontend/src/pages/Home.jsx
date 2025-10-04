import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaBuilding, FaHeart, FaBell, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Carousel Images
const carouselImages = [
  { id: 1, src: "/VM401196.JPG", title: "Discover Spiritual Serenity", subtitle: "Experience the divine architecture and peaceful environment of Adarsh Dham." },
  { id: 2, src: "/VM401204.JPG", title: "Join Our Vibrant Celebrations", subtitle: "Never miss a festival! Check our calendar and participate in sacred events." },
  { id: 3, src: "/VM401208.JPG", title: "Comfortable & Devotional Stay", subtitle: "Easily book peaceful accommodation for yourself and your family during your visit." },
];

const Home = () => {
    const { isAuthenticated } = useSelector(state => state.auth);
    const [liveLinks, setLiveLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [[currentSlide, direction], setSlide] = useState([0, 0]);
    const numSlides = carouselImages.length;

    useEffect(() => {
        const fetchLiveLinks = async () => {
            try {
                const apiUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${apiUrl}/api/satsang/live-links/active`);
                setLiveLinks(response.data || []);
            } catch (error) {
                console.error("Error fetching live links:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveLinks();
        const interval = setInterval(fetchLiveLinks, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => paginate(1), 5000);
        return () => clearInterval(interval);
    }, [currentSlide]);

    const paginate = (dir) => {
        setSlide(([prev, _]) => [(prev + dir + numSlides) % numSlides, dir]);
    };

    const featureCardVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    const LiveMarquee = ({ links }) => {
        if (!links || links.length === 0) return null;
        return (
            <div className="marquee-container bg-highlight text-white py-2 overflow-hidden">
                <div className="marquee-content flex items-center animate-marquee">
                    {links.map((link, index) => (
                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center mx-4">
                            <img src="/live_icon.png" alt="Live" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/FF0000/FFFFFF?text=LIVE" }} className="h-6 w-6 mr-2 animate-pulse" />
                            <h3 className="text-xl font-bold font-heading whitespace-nowrap">{link.name}</h3>
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    const LiveVideoSection = ({ links }) => {
        const videoLink = links.find(link => link.youtubeEmbedUrl);
        if (!videoLink) return null;
        return (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="bg-neutral py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-8 text-primaryDark">Watch Live: {videoLink.name}</h2>
                    <div className="relative overflow-hidden shadow-soft rounded-2xl" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={videoLink.youtubeEmbedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </motion.section>
        );
    };

    const Carousel = () => (
        <div className="relative overflow-hidden w-full h-[60vh] md:h-[70vh] bg-primaryDark">
            {carouselImages.map((image, index) => {
                let pos = index - currentSlide;
                if (pos < -1) pos += numSlides;
                if (pos > 1) pos -= numSlides;
                return (
                    <motion.div
                        key={image.id}
                        initial={{ x: `${pos * 100}%` }}
                        animate={{ x: `${pos * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${image.src})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 text-center p-4 max-w-2xl mx-auto text-white">
                            <div className="drop-shadow-lg">
                                <h1 className="text-4xl md:text-6xl font-extrabold font-heading leading-tight mb-4">{image.title}</h1>
                                <p className="text-lg md:text-xl text-neutral mb-8">{image.subtitle}</p>
                                <Link
                                    to="/calendar"
                                    className="inline-block px-8 py-3 bg-card text-primaryDark text-lg font-semibold rounded-lg shadow-soft hover:bg-neutral hover:text-highlight transition-all duration-300 transform hover:scale-[1.05]"
                                >
                                    View Event Calendar
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
            <button onClick={() => paginate(-1)} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition z-30">‹</button>
            <button onClick={() => paginate(1)} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 transition z-30">›</button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
                {carouselImages.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSlide([idx, idx > currentSlide ? 1 : -1])}
                        className={`h-3 w-3 rounded-full transition-all duration-300 transform hover:scale-125 ${idx === currentSlide ? "bg-primary w-5" : "bg-neutral bg-opacity-70"}`}
                    />
                ))}
            </div>
        </div>
    );

    if (loading) {
        return <div className="text-center mt-10 text-xl text-primary font-body"><FaSpinner className="animate-spin inline mr-2" /> Loading...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-neutral font-body">
            <LiveMarquee links={liveLinks} />
            <Carousel />
            <LiveVideoSection links={liveLinks} />

            <main className="container mx-auto px-4 py-12 md:py-16">
                <section className="text-center">
                    <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">Key Features</h2>
                    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                        <motion.div variants={featureCardVariants} className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center">
                            <div className="bg-background p-4 rounded-full mb-4"><FaCalendarAlt className="text-4xl text-primary" /></div>
                            <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">Event Calendar</h3>
                            <p className="text-gray-700">Stay updated on all our spiritual and community events.</p>
                        </motion.div>
                        <motion.div variants={featureCardVariants} className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center">
                            <div className="bg-background p-4 rounded-full mb-4"><FaBuilding className="text-4xl text-primary" /></div>
                            <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">Accommodation Booking</h3>
                            <p className="text-gray-700">Effortlessly request and manage stay for any event.</p>
                        </motion.div>
                        <motion.div variants={featureCardVariants} className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center">
                            <div className="bg-background p-4 rounded-full mb-4"><FaHeart className="text-4xl text-primary" /></div>
                            <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">Seamless Experience</h3>
                            <p className="text-gray-700">A clean and intuitive interface designed for all users.</p>
                        </motion.div>
                    </motion.div>
                </section>

                <section className="mt-20 text-center">
                    <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">Quick Links</h2>
                    <div className="flex justify-center">
                        <Link to="/my-bookings" className="w-full max-w-xs block">
                            <motion.div whileHover={{ scale: 1.03 }} className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform border-t-4 border-primary flex flex-col items-center">
                                <div className="bg-background p-4 rounded-full mb-4"><FaBell className="text-4xl text-primary" /></div>
                                <h3 className="text-xl font-semibold font-heading text-primaryDark">My Bookings</h3>
                            </motion.div>
                        </Link>
                    </div>
                </section>
            </main>
        </motion.div>
    );
};

export default Home;