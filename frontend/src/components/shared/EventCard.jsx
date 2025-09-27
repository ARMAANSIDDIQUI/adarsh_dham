import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '../common/Button';
import api from '../../api/api';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt, FaPlayCircle } from 'react-icons/fa';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [liveLinks, setLiveLinks] = useState([]);

  useEffect(() => {
    const fetchLiveLinks = async () => {
      try {
        const res = await api.get(`/satsang/live-links/event/${event._id}`);
        setLiveLinks(res.data);
      } catch (err) {
        console.error("Failed to fetch live links", err);
      }
    };
    if (event.name.toLowerCase().includes('satsang')) {
      fetchLiveLinks();
    }
  }, [event]);

  const handleBooking = () => {
    if (isAuthenticated) {
      navigate(`/booking/${event._id}`);
    } else {
      navigate(`/login`, { state: { from: `/booking/${event._id}` } });
    }
  };

  const isBookingActive = new Date() >= new Date(event.bookingStartDate) && new Date() <= new Date(event.bookingEndDate);

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col h-full border border-gray-100"
      variants={itemVariants}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-2 border-b border-pink-100 pb-2">
        {event.name}
      </h2>
      <p className="text-gray-600 mb-4 flex-grow text-sm md:text-base">
        {event.description}
      </p>
      
      {/* Details Section */}
      <div className="text-sm text-gray-700 space-y-2 mb-6">
        <p className="flex items-center space-x-2">
          <FaMapMarkerAlt className="text-pink-500 flex-shrink-0" />
          <span><strong>Location:</strong> {event.location}</span>
        </p>
        <p className="flex items-center space-x-2">
          <FaCalendarAlt className="text-pink-500 flex-shrink-0" />
          <span><strong>Dates:</strong> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
        </p>
        <p className="flex items-center space-x-2">
          <FaTicketAlt className="text-pink-500 flex-shrink-0" />
          <span><strong>Booking Window:</strong> {new Date(event.bookingStartDate).toLocaleDateString()} - {new Date(event.bookingEndDate).toLocaleDateString()}</span>
        </p>
      </div>

      {/* Live Links Section */}
      {event.name.toLowerCase().includes('satsang') && liveLinks.length > 0 && (
        <div className="mb-6 p-3 bg-pink-50 rounded-lg border border-pink-100">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-1">
            <FaPlayCircle className="text-pink-500" /> <span>Live Stream Links:</span>
          </h4>
          <ul className="space-y-1">
            {liveLinks.map(link => (
              <li key={link._id} className="text-pink-600 text-sm">
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline font-medium"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto">
        {isBookingActive ? (
          <Button onClick={handleBooking} className="w-full py-3">
            Request Booking
          </Button>
        ) : (
          <Button className="w-full py-3 bg-gray-400 hover:bg-gray-500 cursor-not-allowed" disabled>
            Booking Closed
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
