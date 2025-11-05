// import React, { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';
// import { FaSpinner, FaSearch } from 'react-icons/fa';
// import api from '../api/api.js';
// import EventCard from '../components/shared/EventCard.jsx';
// import { useParams } from 'react-router-dom';

// const EventsPage = () => {
//     const [events, setEvents] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const eventListRef = useRef(null);
//     const { date } = useParams();

//     useEffect(() => {
//         const fetchEvents = async () => {
//             try {
//                 const response = await api.get('/events');
//                 setEvents(response.data || []);
//             } catch (err) {
//                 setError('Failed to fetch events. Please try again later.');
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchEvents();
//     }, []);

//     useEffect(() => {
//         if (!loading && date && events.length > 0) {
//             scrollToEvents(date);
//         }
//     }, [loading, date, events]);

//     const scrollToEvents = (dateString) => {
//         if (!eventListRef.current) return;

//         const eventElements = Array.from(
//             eventListRef.current.querySelectorAll(`[data-date="${dateString}"]`)
//         );
//         if (eventElements.length === 0) return;

//         eventElements[0].scrollIntoView({ behavior: 'smooth', block: 'start' });

//         eventElements.forEach(el => {
//             el.classList.add('ring-2', 'ring-highlight', 'transition-all');
//             setTimeout(() => el.classList.remove('ring-2', 'ring-highlight'), 1500);
//         });
//     };

//     if (loading) {
//         return (
//             <div className="text-center p-10 flex justify-center items-center min-h-screen bg-neutral font-body">
//                 <FaSpinner className="animate-spin mr-3 text-primary text-4xl" />
//                 <p className="text-xl text-gray-700">Loading events...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8 bg-neutral min-h-screen">
//                 <div className="text-center mt-10 p-4 bg-highlight/10 border border-highlight/20 rounded-xl max-w-lg mx-auto shadow-soft">
//                     <p className="text-highlight font-medium">{error}</p>
//                 </div>
//             </div>
//         );
//     }
    
//     const dailyEvents = date 
//         ? events.filter(event => {
//             const eventDate = new Date(event.startDate);
//             const urlDate = new Date(date);
//             return (
//                 eventDate.getFullYear() === urlDate.getFullYear() &&
//                 eventDate.getMonth() === urlDate.getMonth() &&
//                 eventDate.getDate() === urlDate.getDate()
//             );
//         })
//         : events;

//     const filteredEvents = dailyEvents.filter(event => 
//         event.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const now = new Date();
//     const upcomingEvents = filteredEvents.filter(e => new Date(e.startDate) > now).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
//     const ongoingEvents = filteredEvents.filter(e => { const start = new Date(e.startDate); const end = new Date(e.endDate || e.startDate); return start <= now && end >= now; });
//     const finishedEvents = filteredEvents.filter(e => new Date(e.endDate || e.startDate) < now);
//     const closestUpcoming = upcomingEvents[0];

//     const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    
//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body">
//             <div className="p-4 md:p-8 bg-[#FFEAD9] rounded-2xl shadow-soft">
//                 <h2 className="text-2xl font-bold font-heading text-primaryDark text-center mb-4">
//                     {date ? `Events on ${new Date(date).toDateString()}` : 'All Events'}
//                 </h2>
//                 <div className="relative flex items-center mb-6 max-w-md mx-auto">
//                     <FaSearch className="absolute left-3 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search events..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 p-2 border border-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//                     />
//                 </div>
//                 {dailyEvents.length === 0 && date ? (
//                     <div className="text-center p-10 text-gray-700">
//                         <p className="text-lg">No events found for this date. 😞</p>
//                     </div>
//                 ) : (
//                     <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8" ref={eventListRef} key={date}>
//                         {closestUpcoming && (
//                             <div className="mb-6 p-4 bg-highlight/10 border-l-4 border-highlight rounded-lg shadow-sm">
//                                 <h3 className="font-semibold font-heading text-lg text-highlight mb-2">Next Event</h3>
//                                 <EventCard event={closestUpcoming} />
//                             </div>
//                         )}
//                         {[['Upcoming Events', upcomingEvents], ['Ongoing Events', ongoingEvents], ['Finished Events', finishedEvents]].map(([title, list]) => (
//                             list.length > 0 && (
//                                 <div key={title}>
//                                     <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">{title}</h3>
//                                     <div className="grid grid-cols-1 gap-6">
//                                         {list.map(event => (
//                                             <motion.div
//                                                 key={event._id}
//                                                 data-date={new Date(event.startDate).toISOString().split('T')[0]}
//                                                 variants={containerVariants}
//                                             >
//                                                 <EventCard event={event} />
//                                             </motion.div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )
//                         ))}
//                     </motion.div>
//                 )}
//             </div>
//         </motion.div>
//     );
// };

// export default EventsPage;


import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FaSpinner, FaSearch, FaCalendarAlt, FaList } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Tooltip } from "react-tooltip";
import api from "../api/api.js";
import EventCard from "../components/shared/EventCard.jsx";
import { useParams, useNavigate } from "react-router-dom";

const theme = {
  card: "#EEDAC5",
  background: "#E6BEAE",
  primary: "#E29C9C",
  primaryDark: "#f6339a",
  accent: "#D4A373",
  booking: "#F8C2CC",
  bodyFont: "'Poppins', sans-serif",
};

const calendarStyles = `
.react-calendar {
  width: 100%;
  background: transparent;
  border: none;
  font-family: ${theme.bodyFont};
}
.react-calendar__navigation button {
  color: ${theme.primaryDark};
  background: none;
  font-weight: 600;
  border-radius: 8px;
}
.react-calendar__tile {
  border-radius: 8px;
  transition: all 0.18s;
  position: relative;
  min-height: 58px;
}
.highlight-start { background-color: ${theme.primaryDark} !important; color: white !important; }
.highlight-end { background-color: ${theme.primary} !important; color: white !important; }
.event-range { background-color: ${theme.primary}33 !important; color: ${theme.primaryDark} !important; }
.booking-highlight { background-color: ${theme.booking} !important; color: ${theme.primaryDark} !important; }
.react-calendar__tile--now { background: ${theme.background} !important; color: ${theme.primaryDark}; }
.event-dot { position: absolute; inset: 0; z-index: 20; background: transparent; pointer-events: none; }
.event-tooltip {
  background: ${theme.card} !important;
  color: ${theme.primaryDark} !important;
  border: 1px solid ${theme.background};
  border-radius: 6px !important;
  padding: 6px 10px !important;
  font-size: 0.85em !important;
}
.events-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
.legend-item {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.9rem;
  color: ${theme.primaryDark};
}
.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.06);
}
`;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateInput, setDateInput] = useState("");
  const { date } = useParams();
  const eventListRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data || []);
      } catch (err) {
        setError("Failed to fetch events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (date) {
      const parsed = new Date(date);
      if (!isNaN(parsed)) setSelectedDate(parsed);
    }
  }, [date]);

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    setDateInput(`${year}-${month}-${day}`);
  }, [selectedDate]);

  useEffect(() => {
    if (!loading && date && events.length > 0) {
      scrollToEvents(date);
      setViewMode("list");
    }
  }, [loading, date, events]);

  const scrollToEvents = (dateString) => {
    if (!eventListRef.current) return;
    const eventElements = Array.from(
      eventListRef.current.querySelectorAll(`[data-date="${dateString}"]`)
    );
    if (eventElements.length === 0) return;
    eventElements[0].scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const eventStartMap = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const key = new Date(e.startDate).toDateString();
      map.set(key, e);
    });
    return map;
  }, [events]);

  const eventEndMap = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const key = new Date(e.endDate).toDateString();
      map.set(key, e);
    });
    return map;
  }, [events]);

  const eventRangeMap = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        map.set(new Date(d).toDateString(), e);
      }
    });
    return map;
  }, [events]);

  const bookingEventMap = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      if (!e.bookingStartDate || !e.bookingEndDate) return;
      const start = new Date(e.bookingStartDate);
      const end = new Date(e.bookingEndDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        map.set(new Date(d).toDateString(), e);
      }
    });
    return map;
  }, [events]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate)) setSelectedDate(newDate);
  };

  const handleDateClick = (clickedDate) => {
    const clickedKey = clickedDate.toDateString();
    const relatedEvent =
      eventRangeMap.get(clickedKey) || bookingEventMap.get(clickedKey);
    if (relatedEvent) {
      const year = clickedDate.getFullYear();
      const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
      const day = String(clickedDate.getDate()).padStart(2, "0");
      navigate(`/events/${year}-${month}-${day}`);
      setViewMode("list");
    }
  };

  const dailyEvents = date
    ? events.filter((e) => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        const bStart = e.bookingStartDate ? new Date(e.bookingStartDate) : null;
        const bEnd = e.bookingEndDate ? new Date(e.bookingEndDate) : null;
        const urlDate = new Date(date);
        return (
          (start <= urlDate && end >= urlDate) ||
          (bStart && bEnd && bStart <= urlDate && bEnd >= urlDate)
        );
      })
    : events;

  const filteredEvents = dailyEvents.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();
  const upcomingEvents = filteredEvents
    .filter((e) => new Date(e.startDate) > now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const ongoingEvents = filteredEvents.filter((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate || e.startDate);
    return start <= now && end >= now;
  });
  const finishedEvents = filteredEvents.filter(
    (e) => new Date(e.endDate || e.startDate) < now
  );
  const closestUpcoming = upcomingEvents[0];

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const key = date.toDateString();
      if (eventStartMap.has(key)) return "highlight-start";
      if (eventEndMap.has(key)) return "highlight-end";
      if (bookingEventMap.has(key)) return "booking-highlight";
      if (eventRangeMap.has(key)) return "event-range";
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const key = date.toDateString();
      if (
        eventRangeMap.has(key) ||
        bookingEventMap.has(key) ||
        eventStartMap.has(key) ||
        eventEndMap.has(key)
      ) {
        const event =
          eventRangeMap.get(key) ||
          bookingEventMap.get(key) ||
          eventStartMap.get(key) ||
          eventEndMap.get(key);
        return (
          <div
            data-tooltip-id="event-tooltip"
            data-tooltip-content={event?.name || ""}
            className="event-dot"
          ></div>
        );
      }
    }
    return null;
  };

  if (loading)
    return (
      <div className="text-center p-10 flex justify-center items-center min-h-screen bg-neutral font-body">
        <FaSpinner className="animate-spin mr-3 text-primary text-4xl" />
        <p className="text-xl text-gray-700">Loading events...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 bg-neutral min-h-screen text-center">
        <p className="text-lg text-primaryDark">{error}</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body"
    >
      <style>{calendarStyles}</style>
      <Tooltip id="event-tooltip" className="event-tooltip" />

      {/* Toggle */}
      <div className="flex flex-col items-center mb-8 space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setViewMode("list");
              navigate("/events");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
              viewMode === "list"
                ? "bg-primaryDark text-white shadow-lg"
                : "bg-card text-gray-700"
            }`}
          >
            <FaList /> <span>All Events</span>
          </button>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              navigate("/events");
              setViewMode("calendar");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
              viewMode === "calendar"
                ? "bg-primaryDark text-white shadow-lg"
                : "bg-card text-gray-700"
            }`}
          >
            <FaCalendarAlt /> <span>Calendar</span>
          </button>
        </div>

        {/* Legend - only for calendar view */}
        {viewMode === "calendar" && (
          <div className="events-legend">
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: theme.primaryDark }}
              />
              <span>Event Start</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: theme.primary }}
              />
              <span>Event End</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: `${theme.primary}33` }}
              />
              <span>Event Range</span>
            </div>
            <div className="legend-item">
              <span
                className="legend-swatch"
                style={{ background: theme.booking }}
              />
              <span>Booking Range</span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="p-4 bg-card rounded-2xl shadow-soft max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-primaryDark text-center mb-4">
            Event Calendar
          </h2>
          <div className="flex justify-center mb-4">
            <input
              type="date"
              value={dateInput}
              onChange={handleDateChange}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary"
            />
          </div>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            onClickDay={handleDateClick}
            tileClassName={tileClassName}
            tileContent={tileContent}
          />
        </div>
      )}

      {/* Events List */}
      {viewMode === "list" && (
        <div className="p-4 md:p-8 bg-[#FFEAD9] rounded-2xl shadow-soft">
          <h2 className="text-2xl font-bold font-heading text-primaryDark text-center mb-4">
            {date ? `Events on ${new Date(date).toDateString()}` : "All Events"}
          </h2>
          <div className="relative flex items-center mb-6 max-w-md mx-auto">
            <FaSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 p-2 border border-background rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <motion.div
            className="space-y-8"
            ref={eventListRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {closestUpcoming && (
              <div className="mb-6 p-4 bg-highlight/10 border-l-4 border-highlight rounded-lg shadow-sm">
                <h3 className="font-semibold text-highlight mb-2">
                  Next Event
                </h3>
                <EventCard event={closestUpcoming} />
              </div>
            )}

            {[
              ["Upcoming Events", upcomingEvents],
              ["Ongoing Events", ongoingEvents],
              ["Finished Events", finishedEvents],
            ].map(([title, list]) =>
              list.length > 0 ? (
                <div key={title}>
                  <h3 className="text-xl font-semibold text-primaryDark mb-4">
                    {title}
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {list.map((e) => (
                      <motion.div
                        key={e._id}
                        data-date={new Date(e.startDate)
                          .toISOString()
                          .split("T")[0]}
                      >
                        <EventCard event={e} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default EventsPage;
