import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaFilePdf, FaTrashAlt, FaBed, FaBuilding, FaDoorOpen, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Confirmation Modal component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-50 font-body">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative p-6 bg-card w-full max-w-sm rounded-2xl shadow-soft text-center"
            >
                <h3 className="text-xl font-bold font-heading mb-4 text-primaryDark">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <Button onClick={onCancel} className="bg-background hover:bg-opacity-80 text-primaryDark text-sm">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="bg-primaryDark hover:bg-highlight text-sm text-white">
                        <FaTrashAlt className="inline mr-1" /> Confirm Delete
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};


const BookingStatus = ({ bookings, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 border-green-500 text-green-800';
            case 'pending': return 'bg-yellow-50 border-yellow-500 text-yellow-800';
            case 'declined': return 'bg-red-50 border-red-500 text-red-800';
            default: return 'bg-gray-50 border-gray-500 text-gray-800';
        }
    };

    const handleDeleteClick = (bookingId) => {
        setBookingToDelete(bookingId);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        onDelete(bookingToDelete);
        setIsModalOpen(false);
        setBookingToDelete(null);
    };

    const handleDownloadPdf = (bookingId) => {
        const backendUrl = process.env.REACT_APP_API_BASE_URL || '';
        window.open(`${backendUrl}/api/bookings/pdf/${bookingId}`, '_blank');
    };

    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center p-8 bg-card rounded-2xl shadow-soft border-t-4 border-primary font-body">
                <p className="text-gray-700">
                    You have no active bookings. Please proceed to the{' '}
                    <Link to="/booking" className="text-highlight hover:underline font-bold transition-colors">
                        booking page
                    </Link>
                    {' '}to submit a request.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-body">
            {bookings.map((booking, index) => (
                <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-5 rounded-2xl shadow-soft border-l-4 transition-all duration-300 ${getStatusStyles(booking.status)}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold font-heading text-primaryDark">{booking.eventId?.name || 'Event Details'}</h3>
                            <div className={`flex items-center space-x-2 font-semibold capitalize mt-1 text-base ${booking.status === 'approved' ? 'text-green-600' : booking.status === 'declined' ? 'text-red-600' : 'text-yellow-600'}`}>
                                {booking.status === 'approved' && <FaCheckCircle />}
                                {booking.status === 'declined' && <FaTimesCircle />}
                                <span>{booking.status}</span>
                            </div>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-background/50 text-gray-700 shadow-inner">
                            Requested: {new Date(booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </span>                    </div>

                    {booking.status === 'approved' && (
                        <div className="mt-4 p-4 bg-white rounded-lg shadow-inner border border-green-200">
                            <div className="flex items-center space-x-2 text-green-700 mb-2">
                                <FaCheckCircle className="text-xl" />
                                <h4 className="font-bold font-heading text-lg">Allocation Confirmed</h4>
                            </div>
                            {booking.showAllocationDetails && booking.allocations?.length > 0 ? (
                                <div className="space-y-2">
                                    {booking.allocations.map((alloc, index) => (
                                        <div key={index} className="flex flex-wrap items-center gap-4 text-sm text-green-700 bg-green-50 p-2 rounded-md">
                                            <span className="font-semibold">{booking.formData?.people?.[index]?.name || `Person ${index + 1}`}:</span>
                                            <span className="flex items-center"><FaBuilding className="mr-1" /> {alloc.buildingId?.name || 'N/A'}</span>
                                            <span className="flex items-center"><FaDoorOpen className="mr-1" /> Room {alloc.roomId?.roomNumber || 'N/A'}</span>
                                            <span className="flex items-center"><FaBed className="mr-1" /> {alloc.bedId?.name || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-md font-medium text-green-600">
                                    Your accommodation has been confirmed!
                                </p>
                            )}
                            <p className="mt-2 text-sm font-bold text-highlight bg-highlight/5 p-2 rounded-md border border-highlight/20">
                                Note: Please report to reception/counter at the time of arrival!
                            </p>
                        </div>
                    )}

                    {booking.status === 'declined' && (
                        <p className="mt-4 text-sm font-medium text-red-700">We're sorry, we couldn't accommodate your request at this time. Please contact support for more information.</p>
                    )}

                    {booking.status === 'pending' && (
                        <p className="mt-4 text-sm font-medium text-yellow-700">Your booking is currently awaiting administrative approval.</p>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                        {booking.status === 'approved' && (
                            <Button onClick={() => handleDownloadPdf(booking._id)} className="w-full sm:w-auto bg-accent hover:bg-primaryDark text-white text-sm py-2">
                                <FaFilePdf className="inline mr-1" /> Download Pass
                            </Button>
                        )}
                        <Button onClick={() => handleDeleteClick(booking._id)} className="w-full sm:w-auto bg-primaryDark hover:bg-highlight text-white text-sm py-2">
                            <FaTrashAlt className="inline mr-1" /> Delete Booking
                        </Button>
                    </div>
                </motion.div>
            ))}

            <ConfirmationModal
                isOpen={isModalOpen}
                title="Confirm Deletion"
                message="Are you sure you want to permanently delete this booking request? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default BookingStatus;