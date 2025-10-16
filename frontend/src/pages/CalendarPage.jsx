import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaSpinner, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/api.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const theme = {
    card: "#EEDAC5",
    background: "#E6BEAE",
    primary: "#E29C9C",
    primaryDark: "#f6339a",
    accent: "#D4A373",
    bodyFont: "'Poppins', sans-serif",
};

const calendarStyles = `
.react-calendar {
    width: 100%;
    max-width: 100%;
    background: transparent;
    border: none;
    font-family: ${theme.bodyFont};
    line-height: 1.2em;
}
.react-calendar__navigation button {
    color: ${theme.primaryDark};
    min-width: 44px;
    background: none;
    font-size: 1em;
    font-weight: 600;
    border-radius: 8px;
    transition: background-color 0.2s;
}
.react-calendar__month-view__weekdays {
    color: ${theme.primaryDark};
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.8em;
    padding-bottom: 0.5em;
}
.react-calendar__tile {
    position: relative;
    padding: 10px 5px;
    text-align: center;
    line-height: 1.5em;
    border-radius: 8px;
    transition: background-color 0.2s, color 0.2s, box-shadow 0.15s;
    cursor: pointer;
}
.react-calendar__tile--now {
    background: ${theme.background} !important;
    color: ${theme.primaryDark};
}
.highlight {
    background-color: ${theme.primaryDark} !important;
    color: white !important;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 4px 10px ${theme.primaryDark}66;
}
.react-calendar__tile--active {
    background-color: ${theme.accent} !important;
    color: white !important;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 0 6px ${theme.accent}66;
}
.react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
    background-color: ${theme.primaryDark} !important; 
    color: white !important;
}
.react-calendar__tile:focus {
    background-color: ${theme.primary}33;
    color: ${theme.primaryDark};
}
input[type="date"]:focus {
    outline: none;
    border-color: ${theme.primaryDark};
    box-shadow: 0 0 4px ${theme.primaryDark};
}
.event-tooltip {
    background: ${theme.card} !important;
    color: ${theme.primaryDark} !important;
    border: 1px solid ${theme.background};
    z-index: 9999 !important;
    border-radius: 6px !important;
    padding: 6px 10px !important;
    font-size: 0.85em !important;
    font-weight: 600 !important;
}
.event-dot {
    position: absolute;
    inset: 0;
    z-index: 20;
    background: transparent;
}
.event-dot:hover {
    background: ${theme.primaryDark}22;
    border-radius: 8px;
}
`;

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();
    const [dateInput, setDateInput] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                // FIX: Check if the response data is an array. If not, fallback to an empty array.
                const eventsData = Array.isArray(response.data) ? response.data : [];
                setEvents(eventsData);
            } catch (err) {
                setError('Failed to fetch events. Please try again later.');
                // Ensure events is an array even on error
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setDateInput(`${year}-${month}-${day}`);
    }, [selectedDate]);

    const eventMap = useMemo(() => {
        const map = new Map();
        // This line is now safe because 'events' is guaranteed to be an array.
        (events || []).forEach(event => {
            const eventDate = new Date(event.startDate).toDateString();
            map.set(eventDate, event);
        });
        return map;
    }, [events]);

    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate)) setSelectedDate(newDate);
    };

    const handleDateClick = (clickedDate) => {
        setSelectedDate(clickedDate);
        if (eventMap.has(clickedDate.toDateString())) {
            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, '0');
            const day = String(clickedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
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

    const tileClassName = ({ date, view }) =>
        view === 'month' && eventMap.has(date.toDateString()) ? 'highlight' : null;

    const tileContent = ({ date, view }) => {
        if (view === 'month' && eventMap.has(date.toDateString())) {
            const event = eventMap.get(date.toDateString());
            return (
                <div
                    data-tooltip-id="event-tooltip"
                    data-tooltip-content={event.name}
                    className="event-dot"
                ></div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body"
        >
            <style>{calendarStyles}</style>
            <Tooltip id="event-tooltip" className="event-tooltip" />

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
                    tileContent={tileContent}
                    className="w-full"
                />
            </div>
        </motion.div>
    );
};

export default CalendarPage;
