import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import { FaSpinner, FaTrash, FaFilePdf, FaBed, FaBuilding, FaDoorOpen, FaTimesCircle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import Button from '../../components/common/Button.jsx';
import { Link, useNavigate } from 'react-router-dom';
import EditBookingModal from './EditBookingModal.jsx';


const BookingCard = ({ booking, onEdit, onDelete, onDownloadPdf, navigateToEvent }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 border-green-500 text-green-700'; 
            case 'pending': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
            case 'declined': return 'bg-red-100 border-red-500 text-red-700';
            default: return 'bg-gray-100 border-gray-400 text-gray-700';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl shadow-soft border-l-4 transition-all duration-300 ${getStatusStyles(booking.status)}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3
                        onClick={() => navigateToEvent(booking.eventId)}
                        className="text-xl font-bold font-heading text-highlight cursor-pointer hover:underline transition-colors"
                    >
                        {booking.eventId?.name || 'Event Details'}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 mt-1">{booking.bookingNumber}</p>
                    <div className={`flex items-center space-x-2 font-semibold capitalize mt-1 text-base`}>
                        {booking.status === 'approved' && <FaCheckCircle className="text-green-500" />} {/* Icon color adjustment */}
                        {booking.status === 'declined' && <FaTimesCircle className="text-red-500" />}   {/* Icon color adjustment */}
                        <span>{booking.status}</span>
                    </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-background/50 text-gray-700 shadow-inner">
                    Requested: {new Date(booking.createdAt).toLocaleDateString()}
                </span>
            </div>

            {booking.status === 'approved' && (
                <div className="mt-4 space-y-3 p-4 bg-green-50 rounded-lg shadow-inner"> {/* CHANGED: bg-card to bg-green-50 */}
                    <h4 className="font-bold font-heading text-primary text-md border-b border-background pb-2">Allocation Details:</h4>
                    {(booking.allocations || []).map((alloc, i) => {
                        const person = booking.formData.people[i];
                        return (
                            <div key={i} className="p-3 bg-green-100 rounded-md text-sm border border-green-200"> {/* CHANGED: bg-background/50 to bg-green-100 and border-background to border-green-200 */}
                                <p className="font-bold text-gray-800 mb-2">{person?.name} ({person?.gender})</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 text-gray-700">
                                    <span className="flex items-center text-sm"><FaBuilding className="mr-2 text-green-500" />{alloc.buildingId?.name || 'N/A'}</span> {/* CHANGED: text-primary to text-green-500 */}
                                    <span className="flex items-center text-sm"><FaDoorOpen className="mr-2 text-green-500" />Room {alloc.roomId?.roomNumber || 'N/A'}</span> {/* CHANGED: text-primary to text-green-500 */}
                                    <span className="flex items-center text-sm"><FaBed className="mr-2 text-green-500" />Bed {alloc.bedId?.name || 'N/A'}</span> {/* CHANGED: text-primary to text-green-500 */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {booking.status === 'declined' && <p className="mt-4 text-sm font-medium text-red-700">Booking declined.</p>}
            {booking.status === 'pending' && <p className="mt-4 text-sm font-medium text-yellow-700">Booking pending approval.</p>}


            <div className="mt-6 flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-2">
                {booking.status === 'approved' && (
                    <Button onClick={() => onDownloadPdf(booking)} className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-sm py-2">
                        <FaFilePdf className="inline mr-1" /> Download Pass
                    </Button>
                )}
                {(booking.status === 'pending' || booking.status === 'approved') && (
                    <Button onClick={() => onEdit(booking)} className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"> {/* Changed to blue for edit */}
                        <FaEdit className="inline mr-1" /> Edit
                    </Button>
                )}
                <Button onClick={() => onDelete(booking._id)} className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white text-sm py-2"> {/* Changed to red for withdraw */}
                        <FaTrash className="inline mr-1" /> Withdraw
                </Button>
            </div>
        </motion.div>
    );
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchMyBookings = async () => {
        try {
            const res = await api.get('/bookings/my-bookings');
            setBookings(res.data || []);
        } catch (err) {
            setError('Failed to fetch bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isEditModalOpen) fetchMyBookings();
    }, [isEditModalOpen]);

    const handleDeleteBooking = async (bookingId) => {
        try {
            await api.delete(`/bookings/delete/${bookingId}`);
            fetchMyBookings();
            setMessage({ type: 'success', text: 'Booking withdrawn successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to withdraw booking.' });
        }
    };

    const handleEdit = (booking) => {
        setSelectedBooking(booking);
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        setIsEditModalOpen(false);
        setSelectedBooking(null);
        setMessage({ type: 'success', text: 'Booking updated and is now pending re-approval.' });
        fetchMyBookings();
    };

    const navigateToEvent = (event) => {
        if (event?._id) navigate(`/calendar?event=${event._id}`);
    };

    const categorizedBookings = useMemo(() => {
        const now = new Date();
        const finished = [];
        const ongoing = [];
        const upcoming = [];
        bookings.forEach(b => {
            const eventStart = new Date(b.eventId?.startDate);
            const eventEnd = new Date(b.eventId?.endDate);
            if (eventEnd < now) finished.push(b);
            else if (eventStart <= now && eventEnd >= now) ongoing.push(b);
            else upcoming.push(b);
        });
        upcoming.sort((a, b) => new Date(a.eventId.startDate) - new Date(b.eventId.startDate));
        return { finished, ongoing, upcoming };
    }, [bookings]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-neutral"><FaSpinner className="animate-spin text-4xl text-primary" /></div>;
    if (error) return <div className="text-center mt-10 p-4 text-highlight bg-highlight/10 rounded-xl">{error}</div>;

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4 bg-neutral font-body">
                <FaTimesCircle className="text-6xl text-background mb-4" />
                <h2 className="text-2xl font-bold font-heading text-primaryDark mb-2">No Bookings Found</h2>
                <p className="text-gray-700">You haven't made any bookings yet. Explore events and make your first booking!</p>
                <Link to="/calendar">
                    <Button className="mt-6 bg-primary hover:bg-primaryDark text-white">Browse Events</Button>
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-neutral font-body">
                <h2 className="text-3xl font-bold font-heading mb-6 text-primaryDark border-b-2 border-primary pb-2 text-center">My Bookings</h2>

                <input
                    type="text"
                    placeholder="Search by booking number or event..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full p-3 mb-6 border border-background rounded-lg focus:ring-primary focus:border-primary transition-colors"
                />

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`my-4 p-3 rounded-xl text-center font-medium shadow-soft cursor-pointer ${message.type === 'success' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-highlight/10 text-highlight border border-highlight/20'}`}
                        onClick={() => setMessage(null)}
                    >
                        {message.text}
                    </motion.div>
                )}

                {['upcoming', 'ongoing', 'finished'].map(category => {
                    const filtered = categorizedBookings[category].filter(b =>
                        b.bookingNumber.includes(searchQuery) || b.eventId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) return null;

                    const titleColor = category === 'upcoming' ? 'text-highlight' : category === 'ongoing' ? 'text-accent' : 'text-gray-500';
                    const titleText = category.charAt(0).toUpperCase() + category.slice(1) + ' Bookings';

                    return (
                        <div key={category} className="mb-8">
                            <h3 className={`text-2xl font-semibold font-heading mb-4 ${titleColor}`}>{titleText}</h3>
                            <div className="space-y-4">
                                {filtered.map(b => (
                                    <BookingCard
                                        key={b._id}
                                        booking={b}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteBooking}
                                        onDownloadPdf={async booking => {
                                            const res = await api.get(`/bookings/pdf/${booking._id}`, { responseType: 'blob' });
                                            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `Booking-Pass-${booking.bookingNumber}.pdf`);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                            window.URL.revokeObjectURL(url);
                                        }}
                                        navigateToEvent={navigateToEvent}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {['upcoming', 'ongoing', 'finished'].every(category =>
                    categorizedBookings[category].filter(b =>
                        b.bookingNumber.includes(searchQuery) || b.eventId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0
                ) && searchQuery && (
                    <div className="text-center mt-10 text-gray-700">
                        No bookings match your search.
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isEditModalOpen && selectedBooking && (
                    <EditBookingModal
                        booking={selectedBooking}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={handleUpdateSuccess}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default MyBookings;
