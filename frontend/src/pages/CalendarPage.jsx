import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import EventsList from '../components/shared/EventsList.jsx';
import EventsCalendar from '../components/shared/EventsCalendar.jsx';
import api from '../api/api.js';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventListRef = useRef(null); // Used to correctly target the scroll container

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data || []);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const scrollToEvent = (dateString) => {
    const eventElement = document.getElementById(`event-${dateString}`);
    if (eventElement) {
      eventElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="text-center p-10 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin inline-block mr-3 text-pink-500 text-4xl" />
        <p className="text-xl text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-red-100/50 border border-red-400 rounded-lg max-w-lg mx-auto mt-10">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen ">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 border-b-2 border-pink-500 pb-3">
        <FaCalendarAlt className="inline mr-3 text-pink-500" /> Event Calendar
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar (takes full width on mobile, half on desktop) */}
        <div className="lg:w-1/2">
          <EventsCalendar events={events} onDateClick={scrollToEvent} />
        </div>
        
        {/* Events List (takes full width on mobile, half on desktop) */}
        <div className="lg:w-1/2" ref={eventListRef}>
          <EventsList events={events} />
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
