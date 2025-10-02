import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaBuilding, FaHeart, FaBell, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

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

  // Fetch live links
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

  // Auto-slide every 5s
  useEffect(() => {
    const interval = setInterval(() => paginate(1), 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const paginate = (dir) => {
    setSlide(([prev, _]) => [(prev + dir + numSlides) % numSlides, dir]);
  };

  // Feature card animation
  const featureCardVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // Live marquee
  const LiveMarquee = ({ links }) => {
    if (!links || links.length === 0) return null;
    return (
      <div className="marquee-container bg-pink-600 text-white py-2 overflow-hidden">
        <div className="marquee-content flex items-center animate-marquee">
          {links.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center mx-4">
              <img src="/live_icon.png" alt="Live" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/24x24/FF0000/FFFFFF?text=LIVE" }} className="h-6 w-6 mr-2 animate-pulse" />
              <h3 className="text-xl font-bold whitespace-nowrap">We are LIVE! Join the event: {link.name}</h3>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Live video
  const LiveVideoSection = ({ links }) => {
    const videoLink = links.find(link => link.youtubeEmbedUrl);
    if (!videoLink) return null;
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="bg-gray-100 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">Watch Live: {videoLink.name}</h2>
          <div className="relative overflow-hidden shadow-2xl rounded-lg" style={{ paddingBottom: "56.25%" }}>
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

  // Carousel
  const Carousel = () => (
    <div className="relative overflow-hidden w-full h-[60vh] md:h-[70vh] bg-gray-900">
      {carouselImages.map((image, index) => {
        let pos = index - currentSlide;
        if (pos < -1) pos += numSlides;
        if (pos > 1) pos -= numSlides;

        return (
          <motion.div
            key={image.id}
            initial={{ x: `${pos * 100}%` }}
            animate={{ x: `${pos * 100}%` }}
            transition={{ duration: 9, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image.src})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20 text-center p-4 max-w-2xl mx-auto text-white">
              <div className="drop-shadow-lg">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">{image.title}</h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8">{image.subtitle}</p>
                <Link
                  to="/calendar"
                  className="inline-block px-8 py-3 bg-white text-pink-600 text-lg font-semibold rounded-lg shadow-xl hover:bg-pink-500 hover:text-white transition-all duration-300 transform hover:scale-[1.05]"
                >
                  View Event Calendar
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Navigation Arrows */}
      <button onClick={() => paginate(-1)} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition z-30">‹</button>
      <button onClick={() => paginate(1)} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition z-30">›</button>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
        {carouselImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlide([idx, idx > currentSlide ? 1 : -1])}
            className={`h-3 w-3 rounded-full transition-all duration-300 transform hover:scale-125 ${idx === currentSlide ? "bg-pink-600 w-5" : "bg-white bg-opacity-70"}`}
          />
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center mt-10 text-xl text-pink-500"><FaSpinner className="animate-spin inline mr-2" /> Loading...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <LiveMarquee links={liveLinks} />
      <Carousel />
      <LiveVideoSection links={liveLinks} />

      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Key Features */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-800 border-b-2 border-pink-500 inline-block pb-1">Key Features</h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" initial="hidden" animate="visible">
            <motion.div variants={featureCardVariants} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center">
              <div className="bg-pink-100 p-4 rounded-full mb-4"><FaCalendarAlt className="text-4xl text-pink-500" /></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Event Calendar</h3>
              <p className="text-gray-600">Stay updated on all our spiritual and community events.</p>
            </motion.div>
            <motion.div variants={featureCardVariants} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center">
              <div className="bg-pink-100 p-4 rounded-full mb-4"><FaBuilding className="text-4xl text-pink-500" /></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Accommodation Booking</h3>
              <p className="text-gray-600">Effortlessly request and manage stay for any event.</p>
            </motion.div>
            <motion.div variants={featureCardVariants} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-pink-500 flex flex-col items-center">
              <div className="bg-pink-100 p-4 rounded-full mb-4"><FaHeart className="text-4xl text-pink-500" /></div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Seamless Experience</h3>
              <p className="text-gray-600">A clean and intuitive interface designed for all users.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Quick Links */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-10 text-gray-800 border-b-2 border-pink-500 inline-block pb-1">Quick Links</h2>
          <div className="flex justify-center">
            <Link to="/my-bookings" className="w-full max-w-xs block">
              <motion.div whileHover={{ scale: 1.03 }} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform border-t-4 border-pink-500 flex flex-col items-center">
                <div className="bg-pink-100 p-4 rounded-full mb-4"><FaBell className="text-4xl text-pink-500" /></div>
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
