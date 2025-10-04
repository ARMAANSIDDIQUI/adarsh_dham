// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaCalendarAlt,
  FaBuilding,
  FaHeart,
  FaBell,
  FaSpinner,
} from "react-icons/fa";

// Carousel Images
const carouselImages = [
  {
    id: 1,
    src: "/VM401196.JPG",
    title: "Discover Spiritual Serenity",
    subtitle:
      "Experience the divine architecture and peaceful environment of Adarsh Dham.",
  },
  {
    id: 2,
    src: "/VM401204.JPG",
    title: "Join Our Vibrant Celebrations",
    subtitle:
      "Never miss a festival! Check our calendar and participate in sacred events.",
  },
  {
    id: 3,
    src: "/VM401208.JPG",
    title: "Comfortable & Devotional Stay",
    subtitle:
      "Easily book peaceful accommodation for yourself and your family during your visit.",
  },
];

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liveLinks, setLiveLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const numSlides = carouselImages.length;

  // Fetch live links
  useEffect(() => {
    const fetchLiveLinks = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_BACKEND_URL ||
          import.meta.env.VITE_BACKEND_URL;
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

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => slide(1), 10000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const slide = (dir) => {
    setDirection(dir);
    setCurrentSlide((prev) => (prev + dir + numSlides) % numSlides);
  };

  // Framer Motion variants for sliding
  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 1,
    }),
    center: { x: "0%", opacity: 1 },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 1,
    }),
  };

  // Feature card animation
  const featureCardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Live marquee component
  const LiveMarquee = ({ links }) => {
    if (!links || links.length === 0) return null;
    return (
      <div className="marquee-container bg-highlight text-white py-2 overflow-hidden">
        <div className="marquee-content flex items-center animate-marquee">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center mx-4"
            >
              <img
                src="/live_icon.png"
                alt="Live"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/24x24/FF0000/FFFFFF?text=LIVE";
                }}
                className="h-6 w-6 mr-2 animate-pulse"
              />
              <h3 className="text-xl font-bold font-heading whitespace-nowrap">
                {link.name}
              </h3>
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Live video section component
  const LiveVideoSection = ({ links }) => {
    const videoLink = links.find((link) => link.youtubeEmbedUrl);
    if (!videoLink) return null;
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-neutral py-12 md:py-16"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-8 text-primaryDark">
            Watch Live: {videoLink.name}
          </h2>
          <div
            className="relative overflow-hidden shadow-soft rounded-2xl"
            style={{ paddingBottom: "56.25%" }}
          >
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

  if (loading) {
    return (
      <div className="text-center mt-10 text-xl text-primary font-body">
        <FaSpinner className="animate-spin inline mr-2" /> Loading...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral font-body"
    >
      <LiveMarquee links={liveLinks} />

      {/* Carousel */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden "      >
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 120, damping: 20 },
              opacity: { duration: 0.2 },
            }}
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${carouselImages[currentSlide].src})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center z-20 text-center p-4 max-w-2xl mx-auto text-white">
              <div className="drop-shadow-lg">
                <h1 className="text-4xl md:text-6xl font-extrabold font-heading leading-tight mb-4">
                  {carouselImages[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl text-neutral mb-8">
                  {carouselImages[currentSlide].subtitle}
                </p>
                <Link
                  to="/calendar"
                  className="inline-block px-8 py-3 bg-card text-primaryDark text-lg font-semibold rounded-lg shadow-soft hover:bg-neutral hover:text-highlight transition-all duration-300 transform hover:scale-[1.05]"
                >
                  View Event Calendar
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel arrows */}
        <button
        onClick={() => slide(1)} // LEFT arrow now moves to next slide
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 z-30"
        >
        ‹
        </button>
        <button
        onClick={() => slide(-1)} // RIGHT arrow now moves to previous slide
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 z-30"
        >
        ›
        </button>


        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-3 w-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                idx === currentSlide ? "bg-primary w-5" : "bg-neutral bg-opacity-70"
              }`}
            />
          ))}
        </div>
      </section>

      <LiveVideoSection links={liveLinks} />

      {/* Features Section */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <section className="text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            Key Features
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div
              variants={featureCardVariants}
              className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center"
            >
              <div className="bg-background p-4 rounded-full mb-4">
                <FaCalendarAlt className="text-4xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">
                Event Calendar
              </h3>
              <p className="text-gray-700">
                Stay updated on all our spiritual and community events.
              </p>
            </motion.div>

            <motion.div
              variants={featureCardVariants}
              className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center"
            >
              <div className="bg-background p-4 rounded-full mb-4">
                <FaBuilding className="text-4xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">
                Accommodation Booking
              </h3>
              <p className="text-gray-700">
                Effortlessly request and manage stay for any event.
              </p>
            </motion.div>

            <motion.div
              variants={featureCardVariants}
              className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-primary flex flex-col items-center"
            >
              <div className="bg-background p-4 rounded-full mb-4">
                <FaHeart className="text-4xl text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-heading mb-2 text-primaryDark">
                Seamless Experience
              </h3>
              <p className="text-gray-700">
                A clean and intuitive interface designed for all users.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Quick Links */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            Quick Links
          </h2>
          <div className="flex flex-wrap justify-center gap-6 text-primary font-semibold">
            <Link to="/my-bookings" className="hover:underline">
              My Bookings
            </Link>
            <Link to="/events" className="hover:underline">
              Events
            </Link>
            <Link to="/calendar" className="hover:underline">
              Calendar
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primaryDark text-white py-10 px-4 md:px-20 text-center">
        <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
        <p className="flex items-center justify-center gap-2 mb-2">
          <FaBell /> +91 98765 43210
        </p>
        <p className="flex items-center justify-center gap-2 mb-2">
          <FaCalendarAlt /> contact@adarshdham.org
        </p>
        <p className="text-sm mt-4 text-gray-300">
          © {new Date().getFullYear()} Adarsh Dham. All rights reserved.
        </p>
      </footer>
    </motion.div>
  );
};

export default Home;
