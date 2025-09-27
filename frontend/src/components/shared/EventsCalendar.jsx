import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import { FaCalendarCheck } from 'react-icons/fa';

// Custom CSS is applied here to style the external react-calendar component
// to match the clean, rounded aesthetic of the EzShopNShip theme.
const calendarStyles = `
.react-calendar {
    width: 100%;
    max-width: 100%;
    background: #ffffff;
    border: 1px solid #f3f4f6; /* Light gray border */
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    line-height: 1.125em;
    padding: 10px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Header (Navigation) */
.react-calendar__navigation {
    display: flex;
    margin-bottom: 1em;
    height: 44px;
}
.react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 1em;
    font-weight: 600;
    color: #1f2937; /* Dark text */
    border-radius: 8px;
    transition: background-color 0.2s;
}
.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus {
    background-color: #fce7f3; /* Light pink hover */
    color: #db2777; /* Deep pink text */
}

/* Month View */
.react-calendar__viewContainer {
    padding: 0 5px;
}
.react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    color: #4b5563; /* Gray text for weekdays */
    padding-bottom: 0.5em;
}

/* Days */
.react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    border-radius: 8px;
    transition: background-color 0.2s, color 0.2s;
}
.react-calendar__tile:disabled {
    color: #d1d5db; /* Light gray for disabled/inactive */
}

/* Hover/Focus States */
.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus {
    background-color: #fce7f3; /* Light pink hover */
    color: #db2777;
}

/* Active/Selected Day */
.react-calendar__tile--active {
    background: #ec4899 !important; /* Primary Pink */
    color: white;
    font-weight: 600;
    border-radius: 8px;
}
.react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
    background: #d94692 !important; /* Darker pink on hover */
}

/* Event Highlight (Custom Class) */
.highlight {
    background-color: #f9a8d4; /* Medium pink for event day */
    color: #831843; /* Darker text for readability */
    font-weight: bold;
    border-radius: 8px;
}
.highlight:enabled:hover,
.highlight:enabled:focus {
    background-color: #f472b6; /* Slightly deeper pink on hover */
}
`;


const EventsCalendar = ({ events, onDateClick }) => {
  const [date, setDate] = useState(new Date());
  const eventDates = events.map(event => new Date(event.startDate).toDateString());
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && eventDates.includes(date.toDateString())) {
      return 'highlight';
    }
    return null;
  };
  
  const handleDateClick = (clickedDate) => {
    setDate(clickedDate);
    const dateString = clickedDate.toISOString().split('T')[0];
    onDateClick(dateString);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8 min-h-screen">
    {/* <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8  min-h-screen"> */}
        {/* Inject custom styles */}
        <style>{calendarStyles}</style>
        
        <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center space-x-2">
                <FaCalendarCheck className="text-pink-500" /> <span>Event Calendar</span>
            </h2>
            <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6">
                <Calendar
                    onChange={setDate}
                    value={date}
                    onClickDay={handleDateClick}
                    tileClassName={tileClassName}
                    className="w-full border-0"
                />
            </div>
        </div>
    </motion.div>
  );
};

export default EventsCalendar;
