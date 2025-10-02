import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaSearch } from 'react-icons/fa';
import api from '../api/api.js';
import EventCard from '../components/shared/EventCard.jsx';
import { useParams } from 'react-router-dom';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const eventListRef = useRef(null);
    const { date } = useParams();

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

    useEffect(() => {
        if (!loading && date && events.length > 0) {
            scrollToEvents(date);
        }
    }, [loading, date, events]);

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

    if (loading) {
        return (
            <div className="text-center p-10 flex justify-center items-center min-h-screen">
                <FaSpinner className="animate-spin mr-3 text-pink-500 text-4xl" />
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
    
    // Corrected: Use timezone-safe comparison for filtering
    const dailyEvents = date 
        ? events.filter(event => {
            const eventDate = new Date(event.startDate);
            const urlDate = new Date(date);
            return (
                eventDate.getFullYear() === urlDate.getFullYear() &&
                eventDate.getMonth() === urlDate.getMonth() &&
                eventDate.getDate() === urlDate.getDate()
            );
        })
        : events;

    const filteredEvents = dailyEvents.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const upcomingEvents = filteredEvents.filter(e => new Date(e.startDate) > now).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const ongoingEvents = filteredEvents.filter(e => { const start = new Date(e.startDate); const end = new Date(e.endDate || e.startDate); return start <= now && end >= now; });
    const finishedEvents = filteredEvents.filter(e => new Date(e.endDate || e.startDate) < now);
    const closestUpcoming = upcomingEvents[0];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen">
            <div className="p-4 md:p-8 bg-gray-50 rounded-xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                    {date ? `Events on ${new Date(date).toDateString()}` : 'All Events'}
                </h2>
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
                {dailyEvents.length === 0 && date ? (
                    <div className="text-center p-10 text-gray-500">
                        <p className="text-lg">No events found for this date. 😞</p>
                    </div>
                ) : (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8" ref={eventListRef} key={date}>
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
                                                data-date={new Date(event.startDate).toISOString().split('T')[0]}
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
                )}
            </div>
        </motion.div>
    );
};

export default EventsPage;