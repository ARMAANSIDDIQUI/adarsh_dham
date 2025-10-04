import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Custom Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isAlert = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000] font-body">
            <div className="bg-card p-6 rounded-2xl shadow-soft w-full max-w-sm m-4 transform transition-all">
                <h3 className="text-xl font-bold font-heading text-primaryDark mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {!isAlert && (
                        <Button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors">Cancel</Button>
                    )}
                    <Button onClick={onConfirm} className={`font-medium px-4 py-2 rounded-lg transition-colors ${isAlert ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>{confirmText}</Button>
                </div>
            </div>
        </div>
    );
};

// Subcomponent for rendering tables
const EventTable = ({ events, handleEdit, handleDelete }) => (
    <table className="min-w-full divide-y divide-background">
        <thead className="bg-background/50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody className="bg-card divide-y divide-background">
            {events.map(event => (
                <tr key={event._id} className="hover:bg-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-3">
                        <button onClick={() => handleEdit(event)} className="text-pink-500 hover:text-pink-700"><FaEdit /></button>
                        <button onClick={() => handleDelete(event._id)} className="text-red-500 hover:text-red-700"><FaTrashAlt /></button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

const ManageEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ name: '', description: '', location: '', startDate: '', endDate: '', bookingStartDate: '', bookingEndDate: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', message: '', onConfirm: () => {}, onCancel: () => {}, confirmText: '', isAlert: false });

    // Fetch events
    const fetchEvents = async () => {
        try {
            const res = await api.get('/events');
            setEvents(res.data || []);
        } catch (err) {
            setError('Failed to fetch events.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Add new event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', newEvent);
            setNewEvent({ name: '', description: '', location: '', startDate: '', endDate: '', bookingStartDate: '', bookingEndDate: '' });
            fetchEvents();
            navigate('/admin/manage-buildings'); // Redirect if needed
        } catch (err) {
            setError('Failed to add event.');
        }
    };

    // Update event
    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/events/${editingEvent._id}`, editingEvent);
            setEditingEvent(null);
            fetchEvents();
        } catch (err) {
            setError('Failed to update event.');
        }
    };

    // Delete with confirmation
    const confirmDelete = async (id) => {
        setIsModalOpen(false);
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            if (err.response?.status === 409) {
                setModalData({
                    title: 'Deletion Conflict',
                    message: 'A booking or building is currently assigned to this event. Please remove all dependencies before deleting.',
                    confirmText: 'Got It',
                    isAlert: true,
                    onConfirm: () => setIsModalOpen(false),
                    onCancel: () => setIsModalOpen(false),
                });
                setIsModalOpen(true);
            } else {
                setError('Failed to delete event.');
            }
        }
    };

    const handleDeleteEvent = (id) => {
        const eventName = events.find(e => e._id === id)?.name || 'this event';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete the event "${eventName}"?`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center mt-10 text-xl text-primary font-body"><FaSpinner className="animate-spin inline mr-2" /> Loading Events...</div>;

    // Divide events
    const today = new Date();
    const finishedEvents = events.filter(e => new Date(e.endDate) < today);
    const ongoingEvents = events.filter(e => new Date(e.startDate) <= today && new Date(e.endDate) >= today);
    const upcomingEvents = events.filter(e => new Date(e.startDate) > today);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-bold text-primaryDark font-heading mb-6 border-b-2 border-primary pb-2">Manage Events</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}

            {/* Add New Event */}
            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">Add New Event</h3>
                <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Event Name" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    <textarea placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" value={newEvent.startDate} onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" value={newEvent.endDate} onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Booking Start Date</label>
                        <input type="date" value={newEvent.bookingStartDate} onChange={e => setNewEvent({ ...newEvent, bookingStartDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Booking End Date</label>
                        <input type="date" value={newEvent.bookingEndDate} onChange={e => setNewEvent({ ...newEvent, bookingEndDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="col-span-2 pt-2">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg shadow-md transition-colors">
                            <FaPlus className="inline mr-2" /> Add Event
                        </Button>
                    </div>
                </form>
            </div>

            {/* Event Sections */}
            {finishedEvents.length > 0 && (
                <div className="bg-card shadow-soft rounded-2xl overflow-x-auto mb-6">
                    <h3 className="text-xl font-semibold font-heading p-4 text-primaryDark border-b border-background">Finished Events</h3>
                    <EventTable events={finishedEvents} handleEdit={setEditingEvent} handleDelete={handleDeleteEvent} />
                </div>
            )}
            {ongoingEvents.length > 0 && (
                <div className="bg-card shadow-soft rounded-2xl overflow-x-auto mb-6">
                    <h3 className="text-xl font-semibold font-heading p-4 text-primaryDark border-b border-background">Ongoing Events</h3>
                    <EventTable events={ongoingEvents} handleEdit={setEditingEvent} handleDelete={handleDeleteEvent} />
                </div>
            )}
            {upcomingEvents.length > 0 && (
                <div className="bg-card shadow-soft rounded-2xl overflow-x-auto mb-6">
                    <h3 className="text-xl font-semibold font-heading p-4 text-primaryDark border-b border-background">Upcoming Events</h3>
                    <EventTable events={upcomingEvents} handleEdit={setEditingEvent} handleDelete={handleDeleteEvent} />
                </div>
            )}

            {/* Edit Modal */}
            {editingEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
                    <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="relative p-8 bg-card w-full max-w-lg rounded-2xl shadow-soft m-4">
                        <h3 className="text-2xl font-bold font-heading text-primaryDark mb-4">Edit Event: {editingEvent.name}</h3>
                        <form onSubmit={handleUpdateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Event Name" value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            <input type="text" placeholder="Location" value={editingEvent.location} onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            <textarea placeholder="Description" value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg" required />
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                <input type="date" value={editingEvent.startDate?.split('T')[0]} onChange={e => setEditingEvent({ ...editingEvent, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" value={editingEvent.endDate?.split('T')[0]} onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Booking Start Date</label>
                                <input type="date" value={editingEvent.bookingStartDate?.split('T')[0]} onChange={e => setEditingEvent({ ...editingEvent, bookingStartDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">Booking End Date</label>
                                <input type="date" value={editingEvent.bookingEndDate?.split('T')[0]} onChange={e => setEditingEvent({ ...editingEvent, bookingEndDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg" required />
                            </div>
                            <div className="col-span-2 flex justify-end space-x-3 pt-2">
                                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium">Update Event</Button>
                                <Button type="button" onClick={() => setEditingEvent(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">Cancel</Button>
                            </div>
                        </form>
                        <button onClick={() => setEditingEvent(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
                    </motion.div>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                title={modalData.title}
                message={modalData.message}
                onConfirm={modalData.onConfirm}
                onCancel={modalData.onCancel}
                confirmText={modalData.confirmText}
                isAlert={modalData.isAlert}
            />
        </motion.div>
    );
};

export default ManageEvents;