import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaCalendarAlt,
  FaBuilding,
  FaHeart,
  FaLandmark,
  FaBell,
  FaOm, // Corrected from Faom
  FaSpinner,
  // Added icons needed for the internal Footer
  FaYoutube,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
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

// --- Internal Footer Component ---
// This is the Footer component code, placed directly inside Home.jsx
// You can now modify this component without affecting the global Footer.
const Footer = () => {
  // Contact and Navigation data
  const contactInfo = [
    { icon: FaPhone, text: "+91 98370 50318", href: "tel:+919837050318" },
    {
      icon: FaEnvelope,
      text: "ssdn.kashipur@gmail.com",
      href: "mailto:ssdn.kashipur@gmail.com",
    },
    {
      icon: FaMapMarkerAlt,
      text: "View Location on Map",
      href: "https://maps.app.goo.gl/6PoBTt7PZsXmXT5n8?g_st=awb",
      target: "_blank",
    },
  ];

  const socialLinks = [
    {
      icon: FaYoutube,
      text: "YouTube",
      href: "https://youtube.com/@kashipuradarshdham1181?si=lpXByVnZyHzhI2tN",
      target: "_blank",
    },
  ];

  const mainNavLinks = [
    { text: "Home", to: "/" },
    { text: "Calendar", to: "/calendar" },
    { text: "Events List", to: "/events" },
    { text: "Contact Us", to: "/contact" },
  ];

  return (
    <footer className="bg-primaryDarkFooter text-neutral py-10 px-4 md:px-6 font-body">
      <div className="max-w-7xl mx-auto">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-white/20 pb-8 mb-8 text-left">
          {/* Column 1: Logo/Title */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold font-heading text-white mb-4">
              Adarsh Dham
            </h3>
            <p className="text-sm text-neutral/80">
              Dedicated to spiritual guidance and community welfare in
              Uttarakhand.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          {/* <div>
            <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {mainNavLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral/80 hover:text-accent transition-colors duration-200"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Column 3: Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                // Determine additional classes for the icon (only rotation for FaPhone)
                const iconClasses = item.icon === FaPhone ? "rotate-90" : "";

                return (
                  <li key={index} className="flex items-start text-sm">
                    {/* FIX: Apply rotation class directly here, using item.icon as the component reference */}
                    <item.icon
                      className={`w-4 h-4 mr-3 mt-1 flex-shrink-0 text-accent ${iconClasses}`}
                    />
                    <a
                      href={item.href}
                      target={item.target || "_self"}
                      rel={item.target === "_blank" ? "noopener noreferrer" : ""}
                      className="text-neutral/80 hover:text-accent transition-colors duration-200 break-all"
                    >
                      {item.text}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Social Media & Connect */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
              Connect
            </h4>

            <div className="flex space-x-4 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Link to Adarsh Dham ${link.text}`}
                  className="text-white hover:text-accent transition-colors duration-200 p-2 rounded-full border border-white/50 hover:border-accent"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <div className="flex flex-col space-y-2 text-sm font-medium"></div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm font-light text-neutral/60">
            &copy; {new Date().getFullYear()} Adarsh Dham. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
// --- End of Internal Footer Component ---

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liveLinks, setLiveLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const numSlides = carouselImages.length;

  // Preload images
  useEffect(() => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = (err) => reject(err);
      });
    };

    const loadAllImages = async () => {
      try {
        const promises = carouselImages.map((image) => loadImage(image.src));
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error("Failed to load carousel images:", error);
        setImagesLoaded(true);
      }
    };

    loadAllImages();
  }, []);

  // Fetch live links
  useEffect(() => {
    const fetchLiveLinks = async () => {
      try {
        const apiUrl =
          process.env.REACT_APP_BACKEND_URL ||
          import.meta.env.REACT_BACKEND_URL;
        const response = await axios.get(
          `${apiUrl}/api/satsang/live-links/active`
        );
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

  // Auto-slide every 10 seconds — disabled if live video exists
  useEffect(() => {
    if (!imagesLoaded) return;

    const hasLiveVideo = liveLinks.some((link) => link.youtubeEmbedUrl);
    if (hasLiveVideo) return;

    const interval = setInterval(() => slide(1), 10000);
    return () => clearInterval(interval);
  }, [currentSlide, imagesLoaded, liveLinks]); // eslint-disable-line react-hooks/exhaustive-deps

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
    center: {
      x: "0%",
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 20 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 120, damping: 20 },
        opacity: { duration: 0.2 },
      },
    }),
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

  if (loading || !imagesLoaded) {
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
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
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
                {/* <Link
                    to="/calendar"
                    className="inline-block px-8 py-3 bg-card text-primaryDark text-lg font-semibold rounded-lg shadow-soft hover:bg-neutral hover:text-highlight transition-all duration-300 transform hover:scale-[1.05]"
                  >
                    View Event Calendar
                  </Link> */}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel arrows */}
        <button
          onClick={() => slide(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/30 rounded-full text-white hover:bg-black/50 z-30"
        >
          ‹
        </button>
        <button
          onClick={() => slide(1)}
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
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Wrapped first feature in a Link */}
            <Link to="/calendar" className="w-full block">
              <motion.div
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
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
            </Link>

            {/* Wrapped second feature in a Link */}
            <Link to="/events" className="w-full block">
              <motion.div
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
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
            </Link>
          </motion.div>
        </section>
        {/* Mandir Darshan Timings Section */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            Mandir Darshan Timings
          </h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            // Corrected classes for proper centering and spacing
            className="bg-card p-8 rounded-2xl shadow-soft border-t-4 border-primary flex flex-col items-center mx-auto max-w-sm"
          >
            <div className="bg-background p-4 rounded-full mb-4">
              {/* Corrected icon to a valid one from react-icons/fa */}
              <FaLandmark className="text-4xl text-primary" />
            </div>
            <div className="text-lg font-semibold text-primaryDark space-y-2">
              <p>7:00 AM - 12:00 PM</p>
              <p>4:00 PM - 6:00 PM</p>
            </div>
          </motion.div>
        </section>

        {/* Quick Links */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/my-bookings" className="w-full block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform border-t-4 border-primary flex flex-col items-center"
              >
                <div className="bg-background p-4 rounded-full mb-4">
                  <FaBell className="text-4xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-heading text-primaryDark">
                  My Bookings
                </h3>
              </motion.div>
            </Link>

            <Link to="/events" className="w-full block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform border-t-4 border-primary flex flex-col items-center"
              >
                <div className="bg-background p-4 rounded-full mb-4">
                  <FaCalendarAlt className="text-4xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-heading text-primaryDark">
                  Events
                </h3>
              </motion.div>
            </Link>

            <Link to="/calendar" className="w-full block">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-card p-8 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 transform border-t-4 border-primary flex flex-col items-center"
              >
                <div className="bg-background p-4 rounded-full mb-4">
                  <FaCalendarAlt className="text-4xl text-primary" />
                </div>
                <h3 className="text-xl font-semibold font-heading text-primaryDark">
                  Calendar
                </h3>
              </motion.div>
            </Link>
          </div>
        </section>
      </main>

      {/* Render the internal Footer component */}
      <Footer />
    </motion.div>
  );
};

export default Home;
