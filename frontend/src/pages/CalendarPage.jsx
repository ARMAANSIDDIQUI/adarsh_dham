import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import api from '../api/api.js';
import EventCard from '../components/shared/EventCard.jsx';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const calendarStyles = `
.react-calendar { width: 100%; max-width: 100%; background: #fff; border: 1px solid #f3f4f6; border-radius: 12px; font-family: 'Inter', sans-serif; line-height: 1.2em; padding: 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2 rgba(0,0,0,0.05); }
.react-calendar__navigation { display: flex; margin-bottom: 0.5em; height: 44px; }
.react-calendar__navigation button { min-width: 44px; background: none; font-size: 1em; font-weight: 600; color: #1f2937; border-radius: 8px; transition: background-color 0.2s; }
.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus { background-color: #fce7f3; color: #db2777; }
.react-calendar__month-view__weekdays { text-align: center; text-transform: uppercase; font-weight: bold; font-size: 1em; color: #4b5563; padding-bottom: 0.5em; }
.react-calendar__tile { padding: 0; text-align: center; line-height: 1.5em; border-radius: 0; transition: background-color 0.2s, color 0.2s; font-size: calc(2vw + 0.5rem); display: flex; align-items: center; justify-content: center; }
.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus { background-color: #fce7f3; color: #db2777; }
.react-calendar__tile--active { background: #ec4899 !important; color: white; font-weight: 600; }
.highlight { background-color: #f9a8d4; color: #831843; font-weight: bold; border-radius: 8px; }
.highlight:enabled:hover,
.highlight:enabled:focus { background-color: #f472b6; }
`;

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const eventListRef = useRef(null);

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

  // Scroll to events on a specific date
  const scrollToEvents = (dateString) => {
    if (!eventListRef.current) return;

    const eventElements = Array.from(
      eventListRef.current.querySelectorAll(`[data-date="${dateString}"]`)
    );
    if (eventElements.length === 0) return;

    eventElements[0].scrollIntoView({ behavior: 'smooth', block: 'start' });

    eventElements.forEach(el => {
      el.classList.add('ring-2', 'ring-pink-500', 'transition-all');
      setTimeout(() => el.classList.remove('ring-2', 'ring-pink-500'), 1500);
    });
  };

  const handleDateClick = (clickedDate) => {
    setSelectedDate(clickedDate);
    const dateString = clickedDate.toISOString().split('T')[0];
    if (events.some(e => e.startDate.startsWith(dateString))) {
      scrollToEvents(dateString);
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin mr-3 text-pink-500 text-4xl" />
        <p className="text-xl text-gray-600">Loading events...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10 bg-red-100/50 border border-red-400 rounded-lg max-w-lg mx-auto mt-10">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );

  const EventsList = ({ events }) => {
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const now = new Date();
    const filteredEvents = events.filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const upcomingEvents = filteredEvents.filter(e => new Date(e.startDate) > now).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const ongoingEvents = filteredEvents.filter(e => { const start = new Date(e.startDate); const end = new Date(e.endDate || e.startDate); return start <= now && end >= now; });
    const finishedEvents = filteredEvents.filter(e => new Date(e.endDate || e.startDate) < now);
    const closestUpcoming = upcomingEvents[0];

    return (
      <div className="p-4 md:p-8 bg-gray-50 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">All Events</h2>
        <div className="flex items-center mb-6">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {closestUpcoming && (
            <div className="mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg text-pink-700 mb-2">Next Event</h3>
              <EventCard event={closestUpcoming} />
            </div>
          )}
          {[['Upcoming Events', upcomingEvents], ['Ongoing Events', ongoingEvents], ['Finished Events', finishedEvents]].map(([title, list]) => (
            list.length > 0 && (
              <div key={title}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
                <div className="grid grid-cols-1 gap-6">
                  {list.map(event => (
                    <motion.div
                      key={event._id}
                      data-date={event.startDate.split('T')[0]}
                      variants={containerVariants}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ))}
        </motion.div>
      </div>
    );
  };

  const eventDates = events.map(event => new Date(event.startDate).toDateString());
  const tileClassName = ({ date, view }) => view === 'month' && eventDates.includes(date.toDateString()) ? 'highlight' : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen">
      <style>{calendarStyles}</style>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-8 border-b-2 border-pink-500 pb-3">
        <FaCalendarAlt className="inline mr-3 text-pink-500" /> Event Calendar
      </h1>
      <div className="flex flex-col lg:flex-col gap-8">
        <div className="flex-1 lg:flex-[2]">
          <div className="p-4 bg-white rounded-xl shadow-xl">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex-1 lg:flex-[3] overflow-y-auto max-h-[700px]" ref={eventListRef}>
          <EventsList events={events} />
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
