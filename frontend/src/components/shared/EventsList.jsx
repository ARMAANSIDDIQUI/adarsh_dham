import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard.jsx';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const EventsList = ({ events }) => {
  return (
    <div className="p-4 md:p-8 bg-gray-50 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">All Events</h2>
      <motion.div
        className="grid grid-cols-1 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {events.length > 0 ? (
          events.map(event => (
            <motion.div
              key={event._id}
              id={`event-${event.startDate.split('T')[0]}`} // Unique ID for scrolling
              variants={containerVariants}
            >
              <EventCard event={event} />
            </motion.div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">No upcoming events found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default EventsList;