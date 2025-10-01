import React from 'react';
import { FaTimes, FaCalendarAlt, FaUserFriends, FaBed } from 'react-icons/fa';

const BookingDetailsModal = ({ booking, onClose }) => {
    if (!booking) return null;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Booking Details: <span className="text-pink-600 font-mono">{booking.bookingNumber}</span>
                        </h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                            <FaTimes size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2 text-gray-700">Booking Info</h3>
                            <p><strong>Status:</strong> <span className="capitalize font-medium text-green-600">{booking.status}</span></p>
                            <p><strong>Booked By:</strong> {booking.userId?.name}</p>
                            <p><strong>Event:</strong> {booking.eventId?.name}</p>
                            <p><strong>Contact:</strong> {booking.formData?.contactNumber}</p>
                            <p><strong>From:</strong> {booking.formData?.city}, {booking.formData?.ashramName}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex flex-col justify-center">
                            <h3 className="font-semibold text-lg mb-2 text-gray-700"><FaCalendarAlt className="inline mr-2" />Stay Period</h3>
                            <p className="text-lg">
                                {formatDate(booking.formData.stayFrom)} - {formatDate(booking.formData.stayTo)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="font-semibold text-lg mb-3 text-gray-700"><FaUserFriends className="inline mr-2" />People ({booking.formData.people.length})</h3>
                        <div className="space-y-3">
                            {booking.formData.people.map((person, index) => (
                                <div key={index} className="p-3 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold">{person.name}</p>
                                        <p className="text-gray-600">{person.gender}, Age: {person.age}</p>
                                    </div>
                                    <div className="text-gray-700">
                                        <p><FaBed className="inline mr-2 text-pink-500"/><strong>Allocation:</strong></p>
                                        {booking.allocations?.[index]?.bedId ? (
                                            <p className="ml-5">
                                                {booking.allocations[index].buildingId?.name} /
                                                Room {booking.allocations[index].roomId?.roomNumber} /
                                                Bed {booking.allocations[index].bedId?.name}
                                            </p>
                                        ) : (
                                            <p className="ml-5">Not Allocated</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsModal;