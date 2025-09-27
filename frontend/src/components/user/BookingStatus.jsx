import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button.jsx';
import { FaFilePdf, FaTrashAlt, FaBed, FaBuilding, FaDoorOpen, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Confirmation Modal component (Local to BookingStatus for self-containment)
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative p-6 bg-white w-full max-w-sm rounded-xl shadow-2xl text-center"
            >
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center space-x-4">
                    <Button onClick={onCancel} className="bg-gray-400 hover:bg-gray-500 text-sm">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-sm">
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
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        window.open(`${backendUrl}/api/bookings/pdf/${bookingId}`, '_blank');
    };

    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-pink-500">
                <p className="text-gray-600">
                    You have no active bookings. Please proceed to the{' '}
                    <Link to="/booking" className="text-pink-500 hover:underline font-bold transition-colors">
                        booking page
                    </Link>
                    {' '}to submit a request.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {bookings.map((booking, index) => (
                <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-5 rounded-xl shadow-xl border-l-4 transition-all duration-300 ${getStatusStyles(booking.status)}`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{booking.eventId?.name || 'Event Details'}</h3>
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
                            <h4 className="font-bold text-pink-500 text-md border-b pb-2">Your Allocation Details:</h4>
                            {(booking.allocations || []).map((alloc, index) => {
                                const person = booking.formData.people[index];
                                return (
                                    <div key={index} className="p-3 bg-gray-50 rounded-md text-sm border border-gray-200">
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
                    
                    {booking.status === 'declined' && (
                        <p className="mt-4 text-sm font-medium text-red-700">We're sorry, we couldn't accommodate your request at this time. Please contact support for more information.</p>
                    )}

                    {booking.status === 'pending' && (
                        <p className="mt-4 text-sm font-medium text-yellow-700">Your booking is currently awaiting administrative approval.</p>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                        {booking.status === 'approved' && (
                            <Button onClick={() => handleDownloadPdf(booking._id)} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-sm py-2">
                                <FaFilePdf className="inline mr-1" /> Download Pass
                            </Button>
                        )}
                        <Button onClick={() => handleDeleteClick(booking._id)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm py-2">
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
