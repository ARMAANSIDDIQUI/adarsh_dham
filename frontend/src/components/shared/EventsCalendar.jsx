import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import { FaCalendarCheck } from 'react-icons/fa';

// Define theme colors to be used in the CSS string
const theme = {
    card: '#EEDAC5',
    background: '#E6BEAE',
    primary: '#E29C9C',
    primaryDark: '#C9788A',
    accent: '#D4A373',
    highlight: '#DB2777',
    bodyFont: "'Poppins', sans-serif",
};

// Custom CSS updated with the theme palette
const calendarStyles = `
.react-calendar {
    width: 100%;
    max-width: 100%;
    background: transparent;
    border: none;
    font-family: ${theme.bodyFont};
    line-height: 1.125em;
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
    color: ${theme.primaryDark};
    border-radius: 8px;
    transition: background-color 0.2s;
}
.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus {
    background-color: ${theme.background};
}
.react-calendar__navigation button:disabled {
    opacity: 0.5;
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
    color: ${theme.primaryDark};
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
    color: #d1d5db; 
}
.react-calendar__month-view__days__day--neighboringMonth {
    color: #d1d5db;
}


/* Hover/Focus States */
.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus {
    background-color: ${theme.background};
}

/* Active/Selected Day */
.react-calendar__tile--now {
    background: ${theme.background} !important;
    color: ${theme.primaryDark};
}
.react-calendar__tile--active {
    background: ${theme.primary} !important;
    color: white;
    font-weight: 600;
    border-radius: 8px;
}
.react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
    background: ${theme.primaryDark} !important;
}

/* Event Highlight (Custom Class) */
.highlight {
    background-color: ${theme.highlight};
    color: white;
    font-weight: bold;
    border-radius: 8px;
}
.highlight:enabled:hover,
.highlight:enabled:focus {
    background-color: ${theme.primaryDark};
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-6 lg:p-8 bg-neutral min-h-screen font-body">
            <style>{calendarStyles}</style>
            
            <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold font-heading text-primaryDark mb-6 flex items-center justify-center space-x-2">
                    <FaCalendarCheck className="text-primary" /> <span>Event Calendar</span>
                </h2>
                <div className="bg-card rounded-2xl shadow-soft p-4 md:p-6">
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