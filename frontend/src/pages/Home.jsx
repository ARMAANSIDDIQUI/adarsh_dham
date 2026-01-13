import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "../hooks/useTranslation";
import {
  FaCalendarAlt,
  FaBuilding,
  FaLandmark,
  FaBell,
  FaSpinner,
  FaYoutube,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaArrowRight
} from "react-icons/fa";

// --- Internal Footer Component ---
const Footer = () => {
  const t = useTranslation();
  
  const contactInfo = [
    { icon: FaPhone, text: "+91 98370 50318", href: "tel:+919837050318" },
    {
      icon: FaEnvelope,
      text: "ssdn.kashipur@gmail.com",
      href: "mailto:ssdn.kashipur@gmail.com",
    },
    {
      icon: FaMapMarkerAlt,
      text: t.home.footer.viewMap,
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

  return (
    <footer className="bg-primaryDarkFooter text-neutral py-10 px-4 md:px-6 font-body">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-white/20 pb-8 mb-8 text-left">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold font-heading text-white mb-4">
              Shri Adarsh Dham
            </h3>
            <p className="text-sm text-neutral/80">
              {t.home.footer.desc}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
              {t.home.footer.getInTouch}
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => {
                const iconClasses = item.icon === FaPhone ? "rotate-90" : "";
                return (
                  <li key={index} className="flex items-start text-sm">
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

          <div>
            <h4 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider">
              {t.home.footer.connect}
            </h4>
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Link to Shri Adarsh Dham ${link.text}`}
                  className="text-white hover:text-accent transition-colors duration-200 p-2 rounded-full border border-white/50 hover:border-accent"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-light text-neutral/60">
            &copy; {new Date().getFullYear()} Shri Adarsh Dham. {t.home.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
};

// --- Upcoming Event Modal ---
const UpcomingEventModal = ({ isOpen, onClose, event }) => {
  const navigate = useNavigate();
  const t = useTranslation();

  if (!isOpen || !event) return null;

  const handleBookNow = () => {
    onClose();
    navigate(`/booking/${event._id || event.id}`);
  };

  const bs = event.bookingStartDate ? new Date(event.bookingStartDate).toLocaleDateString('en-GB') : "TBA";
  const be = event.bookingEndDate ? new Date(event.bookingEndDate).toLocaleDateString('en-GB') : "TBA";
  const start = new Date(event.startDate).toLocaleDateString('en-GB');
  const end = new Date(event.endDate).toLocaleDateString('en-GB');

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border-4 border-primary overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors p-1 bg-white/50 rounded-full"
        >
          <FaTimes size={20} />
        </button>

        <div className="bg-primary/10 p-6 text-center border-b border-primary/20">
          <h3 className="text-sm font-bold text-highlight uppercase tracking-widest mb-1">{t.events?.nextEvent || "Upcoming Event"}</h3>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-primaryDark">{event.name}</h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-700 text-center text-sm md:text-base leading-relaxed">
            {event.description}
          </p>

          <div className="grid grid-cols-2 gap-4 bg-background/30 p-4 rounded-xl">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">{t.events?.card?.dates || "Dates"}</p>
              <p className="font-semibold text-primaryDark text-sm">{start} - {end}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase">{t.events?.card?.bookingWindow || "Booking Open"}</p>
              <p className="font-semibold text-primaryDark text-sm">{bs} - {be}</p>
            </div>
          </div>

          <button 
            onClick={handleBookNow}
            className="w-full bg-primaryDark hover:bg-highlight text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>{t.events?.card?.requestBooking || "Book Now"}</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const t = useTranslation();
  const [liveLinks, setLiveLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Modal state
  const [upcomingEvent, setUpcomingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  
  // Define carousel images inside component to use translations
  const carouselImages = [
    {
      id: 1,
      src: "/VM401196.JPG",
      title: t.home.carousel.slide1.title,
      subtitle: t.home.carousel.slide1.subtitle,
    },
    {
      id: 2,
      src: "/VM401204.JPG",
      title: t.home.carousel.slide2.title,
      subtitle: t.home.carousel.slide2.subtitle,
    },
    {
      id: 3,
      src: "/VM401208.JPG",
      title: t.home.carousel.slide3.title,
      subtitle: t.home.carousel.slide3.subtitle,
    },
  ];

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

  // Fetch live links AND Upcoming Event
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || '';
        
        // 1. Fetch Live Links
        const liveRes = await axios.get(`${apiUrl}/api/satsang/live-links/active`);
        setLiveLinks(liveRes.data || []);

        // 2. Fetch Events for Modal
        const eventsRes = await axios.get(`${apiUrl}/api/events`);
        const allEvents = Array.isArray(eventsRes.data) ? eventsRes.data : [];
        
        const now = new Date();
        const upcoming = allEvents
          .filter(e => new Date(e.startDate) >= now || (new Date(e.startDate) <= now && new Date(e.endDate) >= now)) // Upcoming or Ongoing
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Sort by nearest start date

        if (upcoming.length > 0) {
          const lastShown = localStorage.getItem('event_popup_last_shown');
          const lastShownTime = lastShown ? parseInt(lastShown, 10) : 0;
          const oneDay = 24 * 60 * 60 * 1000;

          if (Date.now() - lastShownTime > oneDay) {
            setUpcomingEvent(upcoming[0]);
            setTimeout(() => {
              setIsModalOpen(true);
              localStorage.setItem('event_popup_last_shown', Date.now().toString());
            }, 2000);
          }
        }

      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh live links every minute
    const interval = setInterval(() => {
        const fetchLive = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_BASE_URL || '';
                const liveRes = await axios.get(`${apiUrl}/api/satsang/live-links/active`);
                setLiveLinks(liveRes.data || []);
            } catch(e) { console.error(e); }
        };
        fetchLive();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slide every 10 seconds — disabled if live video exists
  useEffect(() => {
    if (!imagesLoaded) return;

    const hasLiveVideo = liveLinks.some((link) => link.youtubeEmbedUrl);
    if (hasLiveVideo) return;

    const interval = setInterval(() => slide(1), 10000);
    return () => clearInterval(interval);
  }, [currentSlide, imagesLoaded, liveLinks]);

  const slide = (dir) => {
    setDirection(dir);
    setCurrentSlide((prev) => (prev + dir + numSlides) % numSlides);
  };

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
            {t.home.live.watch}: {videoLink.name}
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
        <FaSpinner className="animate-spin inline mr-2" /> {t.common.loading}
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

      {/* Render the Modal if an event exists and modal is open */}
      <AnimatePresence>
        {isModalOpen && upcomingEvent && (
          <UpcomingEventModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            event={upcomingEvent} 
          />
        )}
      </AnimatePresence>

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
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

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

      <main className="container mx-auto px-4 py-12 md:py-16">
        <section className="text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            {t.home.features.title}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
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
                  {t.home.features.calendar.title}
                </h3>
                <p className="text-gray-700">
                  {t.home.features.calendar.desc}
                </p>
              </motion.div>
            </Link>

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
                  {t.home.features.booking.title}
                </h3>
                <p className="text-gray-700">
                  {t.home.features.booking.desc}
                </p>
              </motion.div>
            </Link>
          </motion.div>
        </section>
        
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            {t.home.timings.title}
          </h2>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-card p-8 rounded-2xl shadow-soft border-t-4 border-primary flex flex-col items-center mx-auto max-w-sm"
          >
            <div className="bg-background p-4 rounded-full mb-4">
              <FaLandmark className="text-4xl text-primary" />
            </div>
            <div className="text-lg font-semibold text-primaryDark space-y-2">
              <p>7:00 AM - 12:00 PM</p>
              <p>4:00 PM - 6:00 PM</p>
            </div>
          </motion.div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold font-heading mb-10 text-primaryDark border-b-2 border-primary inline-block pb-1">
            {t.home.quickLinks.title}
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
                  {t.home.quickLinks.myBookings}
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
                  {t.home.quickLinks.events}
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
                  {t.home.quickLinks.calendar}
                </h3>
              </motion.div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
};

export default Home;