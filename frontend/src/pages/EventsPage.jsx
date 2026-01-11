import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { FaSpinner, FaSearch, FaCalendarAlt, FaList } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Tooltip } from "react-tooltip";
import api from "../api/api.js";
import EventCard from "../components/shared/EventCard.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";

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
    transition: background-color 0.18s, color 0.18s, box-shadow 0.15s;
    cursor: pointer;
}
.react-calendar__tile--now {
    background: ${theme.background} !important;
    color: ${theme.primaryDark};
}
.highlight-start {
    background-color: ${theme.primaryDark} !important;
    color: white !important;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 4px 10px ${theme.primaryDark}66;
}
.highlight-end {
    background-color: ${theme.primary} !important;
    color: white !important;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 4px 10px ${theme.primary}66;
}
.event-range {
    background-color: ${theme.primary}33 !important;
    color: ${theme.primaryDark} !important;
    font-weight: 600;
    border-radius: 8px;
    box-shadow: 0 3px 8px ${theme.primary}44;
}
.booking-highlight {
    background-color: ${theme.booking} !important;
    color: ${theme.primaryDark} !important;
    font-weight: 700;
    border-radius: 8px;
    box-shadow: 0 4px 10px ${theme.booking}66;
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
    max-width: 300px;
    white-space: normal;
    word-wrap: break-word;
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
.hovered-tile {
  transform: scale(1.03);
  box-shadow: 0 0 8px ${theme.primaryDark}22;
  z-index: 50;
  position: relative;
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
  const t = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateInput, setDateInput] = useState("");
  const [hoveredDate, setHoveredDate] = useState(null);
  const { date } = useParams();
  const eventListRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(t.events.error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [t.events.error]);

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
    eventElements.forEach((el) => {
      el.classList.add("ring-2", "ring-highlight", "transition-all");
      setTimeout(() => el.classList.remove("ring-2", "ring-highlight"), 1500);
    });
  };

  const {
    bookingAvailableMap,
    eventRangeMap,
  } = useMemo(() => {
    const bookingAvailableMap = new Map();
    const eventRangeMap = new Map();

    events.forEach((e) => {
      if (e.bookingStartDate && e.bookingEndDate) {
        const bStart = new Date(e.bookingStartDate);
        const bEnd = new Date(e.bookingEndDate);
        for (let d = new Date(bStart); d <= bEnd; d.setDate(d.getDate() + 1)) {
          bookingAvailableMap.set(new Date(d).toDateString(), e);
        }
      }
      if (e.startDate && e.endDate) {
        const s = new Date(e.startDate);
        const en = new Date(e.endDate);
        for (let d = new Date(s); d <= en; d.setDate(d.getDate() + 1)) {
          eventRangeMap.set(new Date(d).toDateString(), e);
        }
      }
    });

    return {
      bookingAvailableMap,
      eventRangeMap,
    };
  }, [events]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate)) setSelectedDate(newDate);
  };

  const handleDateClick = (clickedDate) => {
    const key = clickedDate.toDateString();
    const eventForBookingAvailable = bookingAvailableMap.get(key);

    if (eventForBookingAvailable) {
        const now = new Date();
        const bookingStart = new Date(eventForBookingAvailable.bookingStartDate);
        bookingStart.setHours(0, 0, 0, 0);
        const bookingEnd = new Date(eventForBookingAvailable.bookingEndDate);
        bookingEnd.setHours(23, 59, 59, 999);

        // Default to true if undefined
        const isBookingOpen = eventForBookingAvailable.isBookingOpen !== false;

        if (now >= bookingStart && now <= bookingEnd && isBookingOpen) {
            const id = eventForBookingAvailable._id || eventForBookingAvailable.id || eventForBookingAvailable.slug || "";
            if (id) {
                navigate(`/booking/${id}`);
                return;
            }
        } else {
            const year = clickedDate.getFullYear();
            const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
            const day = String(clickedDate.getDate()).padStart(2, "0");
            const dateString = `${year}-${month}-${day}`;
            navigate(`/events/${dateString}`);
            setViewMode("list");
        }
    } else if (eventRangeMap.has(key)) {
        const year = clickedDate.getFullYear();
        const month = String(clickedDate.getMonth() + 1).padStart(2, "0");
        const day = String(clickedDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;
        navigate(`/events/${dateString}`);
        setViewMode("list");
    }
};

  const dailyEvents = date
    ? events.filter((e) => {
        const start = new Date(e.startDate);
        const end = new Date(e.endDate || e.startDate);
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
      const classes = [];
      if (bookingAvailableMap.has(key)) {
        classes.push("booking-highlight");
      } else if (eventRangeMap.has(key)) {
        classes.push("event-range");
      }
      
      if (hoveredDate && key === hoveredDate.toDateString()) {
        classes.push("hovered-tile");
      }
      return classes.join(" ");
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const key = date.toDateString();
      let event =
        bookingAvailableMap.get(key) ||
        eventRangeMap.get(key);

      if (!event) return null;

      let content = "";
      if (bookingAvailableMap.has(key)) {
        const bs = event.bookingStartDate ? new Date(event.bookingStartDate).toLocaleDateString('en-GB') : "";
        const be = event.bookingEndDate ? new Date(event.bookingEndDate).toLocaleDateString('en-GB') : "";
        content = `${t.events.bookingOpenFor} ${event.name} (${bs} — ${be})`;
      } else if (eventRangeMap.has(key)) {
        content = `${event.name} (${t.events.inProgress})`;
      }

      return (
        <div
          data-tooltip-id="event-tooltip"
          data-tooltip-content={content}
          className="event-dot"
          onMouseEnter={() => setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
        />
      );
    }
    return null;
  };

  if (loading)
    return (
      <div className="text-center p-10 flex justify-center items-center min-h-screen bg-neutral font-body">
        <FaSpinner className="animate-spin mr-3 text-primary text-4xl" />
        <p className="text-xl text-gray-700">{t.events.loading}</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 bg-neutral min-h-screen text-center">
        <p className="text-lg text-primaryDark">{error}</p>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4 md:p-10 min-h-screen bg-neutral font-body">
      <style>{calendarStyles}</style>
      <Tooltip id="event-tooltip" className="event-tooltip" />

      <div className="flex flex-col items-center mb-8 space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setViewMode("list");
              navigate("/events");
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${viewMode === "list" ? "bg-primaryDark text-white shadow-lg" : "bg-card text-gray-700"}`}
          >
            <FaList /> <span>{t.events.allEvents}</span>
          </button>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              navigate("/events");
              setViewMode("calendar");
            }}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${viewMode === "calendar" ? "bg-primaryDark text-white shadow-lg" : "bg-card text-gray-700"}`}
          >
            <FaCalendarAlt /> <span>{t.events.calendar}</span>
          </button>
        </div>

        {viewMode === "calendar" && (
          <div className="events-legend">
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: theme.booking }} />
              <span>{t.events.bookingDates}</span>
            </div>
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: `${theme.primary}33` }} />
              <span>{t.events.eventInProgress}</span>
            </div>
          </div>
        )}
      </div>

      {viewMode === "calendar" && (
        <div className="p-4 bg-card rounded-2xl shadow-soft max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-primaryDark text-center mb-4">{t.events.calendar}</h2>
          <div className="flex justify-center mb-4">
            <input type="date" value={dateInput} onChange={handleDateChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary" />
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

      {viewMode === "list" && (
        <div className="p-4 md:p-8 bg-[#FFEAD9] rounded-2xl shadow-soft">
          <h2 className="text-2xl font-bold font-heading text-primaryDark text-center mb-4">{date ? `${t.events.eventsOn} ${new Date(date).toDateString()}` : t.events.allEvents}</h2>
          <div className="relative flex items-center mb-6 max-w-md mx-auto">
            <FaSearch className="absolute left-3 text-gray-400" />
            <input type="text" placeholder={t.events.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-background rounded-lg focus:ring-2 focus:ring-primary" />
          </div>

          <motion.div className="space-y-8" ref={eventListRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {closestUpcoming && (
              <div className="mb-6 p-4 bg-highlight/10 border-l-4 border-highlight rounded-lg shadow-sm">
                <h3 className="font-semibold text-highlight mb-2">{t.events.nextEvent}</h3>
                <EventCard event={closestUpcoming} />
              </div>
            )}

            {[
              [t.events.upcomingEvents, upcomingEvents],
              [t.events.ongoingEvents, ongoingEvents],
              [t.events.finishedEvents, finishedEvents],
            ].map(([title, list]) =>
              list.length > 0 ? (
                <div key={title}>
                  <h3 className="text-xl font-semibold text-primaryDark mb-4">{title}</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {list.map((e) => (
                      <motion.div key={e._id} data-date={new Date(e.startDate).toISOString().split("T")[0]}>
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