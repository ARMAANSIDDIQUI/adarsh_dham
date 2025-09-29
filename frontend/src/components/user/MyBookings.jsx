import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import { FaSpinner, FaTrash, FaFilePdf, FaBed, FaBuilding, FaDoorOpen, FaTimesCircle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import Button from '../../components/common/Button.jsx';
import { Link, useNavigate } from 'react-router-dom';
import BookingForm from '../../components/user/BookingForm.jsx';

const EditBookingModal = ({ booking, onClose, onUpdate }) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUpdateSubmit = async (formData) => {
        setSubmitLoading(true);
        setError('');
        try {
            await api.put(`/bookings/update/${booking._id}`, { formData });
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-gray-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <FaTimesCircle size={24} />
                </button>
                <div className="overflow-y-auto p-6">
                    <BookingForm 
                        onSubmit={handleUpdateSubmit}
                        initialData={booking.formData}
                        loading={submitLoading}
                        error={error}
                        isEditing={true}
                    />
                </div>
            </motion.div>
        </div>
    );
};

const BookingCard = ({ booking, onEdit, onDelete, onDownloadPdf, navigateToEvent }) => {
    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 border-green-500 text-green-800';
            case 'pending': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
            case 'declined': return 'bg-red-50 border-red-500 text-red-800';
            default: return 'bg-gray-50 border-gray-500 text-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl shadow-xl border-l-4 transition-all duration-300 ${getStatusStyles(booking.status)} hover:shadow-2xl`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 
                        onClick={() => navigateToEvent(booking.eventId)}
                        className="text-xl font-bold text-pink-600 cursor-pointer hover:underline transition-colors"
                    >
                        {booking.eventId?.name || 'Event Details'}
                    </h3>
                    <p className="text-xs font-mono text-gray-400 mt-1">{booking.bookingNumber}</p> 
                    <div className={`flex items-center space-x-2 font-semibold capitalize mt-1 text-base ${booking.status === 'approved' ? 'text-green-600' : booking.status === 'declined' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {booking.status === 'approved' && <FaCheckCircle />}
                        {booking.status === 'declined' && <FaTimesCircle />}
                        <span>{booking.status}</span>
                    </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-200 text-gray-700 shadow-inner">
                    Requested: {new Date(booking.createdAt).toLocaleDateString()}
                </span>
            </div>

            {booking.status === 'approved' && (
                <div className="mt-4 space-y-3 p-4 bg-white rounded-lg shadow-inner">
                    <h4 className="font-bold text-pink-500 text-md border-b pb-2">Allocation Details:</h4>
                    {(booking.allocations || []).map((alloc, i) => {
                        const person = booking.formData.people[i];
                        return (
                            <div key={i} className="p-3 bg-gray-50 rounded-md text-sm border border-gray-200">
                                <p className="font-bold text-gray-800 mb-2">{person?.name} ({person?.gender})</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 text-gray-600">
                                    <span className="flex items-center text-sm"><FaBuilding className="mr-2 text-pink-400" />{alloc.buildingId?.name || 'N/A'}</span>
                                    <span className="flex items-center text-sm"><FaDoorOpen className="mr-2 text-pink-400" />Room {alloc.roomId?.roomNumber || 'N/A'}</span>
                                    <span className="flex items-center text-sm"><FaBed className="mr-2 text-pink-400" />Bed {alloc.bedId?.name || 'N/A'}</span>
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
                    <Button onClick={() => onDownloadPdf(booking)} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-sm py-2">
                        <FaFilePdf className="inline mr-1" /> Download Pass
                    </Button>
                )}
                {(booking.status === 'pending' || booking.status === 'approved') && (
                    <Button onClick={() => onEdit(booking)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm py-2">
                        <FaEdit className="inline mr-1" /> Edit
                    </Button>
                )}
                <Button onClick={() => onDelete(booking._id)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm py-2">
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

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-pink-500" /></div>;
    if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

    // --- Exception: No bookings at all ---
    if (bookings.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-center px-4">
                <FaTimesCircle className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Bookings Found</h2>
                <p className="text-gray-500">You haven't made any bookings yet. Explore events and make your first booking!</p>
                <Link to="/calendar">
                    <Button className="mt-6 bg-pink-500 hover:bg-pink-600 text-white">Browse Events</Button>
                </Link>
            </div>
        );
    }

    // --- Render UI ---
    return (
        <>
            <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-pink-400 pb-2 text-center">My Bookings</h2>

                <input 
                    type="text" 
                    placeholder="Search by booking number or event..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full p-3 mb-6 border rounded-lg focus:ring-pink-300 focus:border-pink-500 transition-colors"
                />

                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`my-4 p-3 rounded-lg text-center font-medium shadow-md cursor-pointer ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}
                        onClick={() => setMessage(null)}
                    >
                        {message.text}
                    </motion.div>
                )}

                {/* --- Render categorized bookings with search filter --- */}
                {['upcoming', 'ongoing', 'finished'].map(category => {
                    const filtered = categorizedBookings[category].filter(b => 
                        b.bookingNumber.includes(searchQuery) || b.eventId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) return null;

                    const titleColor = category === 'upcoming' ? 'text-pink-500' : category === 'ongoing' ? 'text-yellow-500' : 'text-gray-500';
                    const titleText = category.charAt(0).toUpperCase() + category.slice(1) + ' Events';

                    return (
                        <div key={category} className="mb-8">
                            <h3 className={`text-2xl font-semibold mb-4 ${titleColor}`}>{titleText}</h3>
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

                {/* --- Exception: No bookings match search --- */}
                {['upcoming', 'ongoing', 'finished'].every(category => 
                    categorizedBookings[category].filter(b => 
                        b.bookingNumber.includes(searchQuery) || b.eventId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0
                ) && searchQuery && (
                    <div className="text-center mt-10 text-gray-500">
                        No bookings match your search.
                    </div>
                )}

            </div>

            <AnimatePresence>
                {isEditModalOpen && (
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
