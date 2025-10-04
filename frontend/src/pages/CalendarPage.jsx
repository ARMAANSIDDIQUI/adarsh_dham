import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/api.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

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
    line-height: 1.2em;
}
.react-calendar__navigation {
    display: flex;
    margin-bottom: 0.5em;
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
.react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.8em;
    color: ${theme.primaryDark};
    padding-bottom: 0.5em;
}
.react-calendar__tile {
    padding: 10px 5px;
    text-align: center;
    line-height: 1.5em;
    border-radius: 8px;
    transition: background-color 0.2s, color 0.2s;
}
.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus {
    background-color: ${theme.background};
}
.react-calendar__tile--active {
    background: ${theme.primary} !important;
    color: white;
    font-weight: 600;
}
.react-calendar__tile--now {
    background: ${theme.background} !important;
    color: ${theme.primaryDark};
}
.highlight {
    background-color: ${theme.accent};
    color: white;
    font-weight: bold;
}
.highlight:enabled:hover,
.highlight:enabled:focus {
    background-color: ${theme.primaryDark};
}
`;

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const navigate = useNavigate();

    // State for the date input field
    const [dateInput, setDateInput] = useState('');

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

    // Effect to synchronize the date input field with the selectedDate
    useEffect(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDateInput(`${year}-${month}-${day}`);
    }, [selectedDate]);

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate)) {
            setSelectedDate(newDate);
        }
    };

    const handleDateClick = (clickedDate) => {
        setSelectedDate(clickedDate);
        
        const year = clickedDate.getFullYear();
        const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
        const day = String(clickedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const hasEvent = events.some((e) => {
            const eventDate = new Date(e.startDate);
            return (
                eventDate.getFullYear() === year &&
                eventDate.getMonth() === clickedDate.getMonth() &&
                eventDate.getDate() === clickedDate.getDate()
            );
        });

        if (hasEvent) {
            navigate(`/events/${dateString}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral font-body">
                <FaSpinner className="animate-spin mr-3 text-primary text-4xl" />
                <p className="text-xl text-gray-700">Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-neutral min-h-screen">
                <div className="text-center mt-10 p-4 bg-highlight/10 border border-highlight/20 rounded-xl max-w-lg mx-auto shadow-soft">
                    <p className="text-highlight font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const eventDates = events.map((event) => new Date(event.startDate).toDateString());
    const tileClassName = ({ date, view }) =>
        view === 'month' && eventDates.includes(date.toDateString()) ? 'highlight' : null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body">
            <style>{calendarStyles}</style>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-primaryDark text-center mb-8 border-b-2 border-primary pb-3">
                <FaCalendarAlt className="inline mr-3 text-primary" /> Event Calendar
            </h1>
            <div className="p-4 bg-card rounded-2xl shadow-soft max-w-3xl mx-auto">
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <label htmlFor="date-input" className="text-lg font-medium text-gray-700">
                        Jump to Date:
                    </label>
                    <input
                        id="date-input"
                        type="date"
                        value={dateInput}
                        onChange={handleDateChange}
                        className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 font-body"
                    />
                </div>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    onClickDay={handleDateClick}
                    tileClassName={tileClassName}
                    className="w-full"
                />
            </div>
        </motion.div>
    );
};

export default CalendarPage;