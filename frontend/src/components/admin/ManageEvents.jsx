import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Custom Modal Component for Delete Confirmation and Alerts
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isAlert = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm m-4 transform transition-all">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {!isAlert && (
                        <Button 
                            onClick={onCancel} 
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button 
                        onClick={onConfirm} 
                        className={`font-medium px-4 py-2 rounded-lg transition-colors 
                            ${isAlert ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};


const ManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: '', description: '', location: '', startDate: '', endDate: '', bookingStartDate: '', bookingEndDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

    // State for Custom Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        onCancel: () => {}, 
        confirmText: '', 
        isAlert: false,
    });

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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', newEvent);
      setNewEvent({ name: '', description: '', location: '', startDate: '', endDate: '', bookingStartDate: '', bookingEndDate: '' });
      fetchEvents();
      navigate('/admin/manage-buildings'); // Redirect to next step
    } catch (err) {
      setError('Failed to add event.');
    }
  };

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
    
    // New function to handle the actual deletion after confirmation
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
    
    // New function to open the custom confirmation modal
    const handleDeleteEvent = (id) => {
        const eventName = events.find(e => e._id === id)?.name || 'this event';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete the event "${eventName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };

  if (loading) return <div className="text-center mt-10 text-xl text-pink-500"><FaSpinner className="animate-spin inline mr-2" /> Loading Events...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 border-pink-400 pb-2">
          Manage Events
      </h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}

      {/* Add New Event Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold text-pink-500 mb-4">Add New Event</h3>
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Input Fields */}
          <input type="text" placeholder="Event Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          <input type="text" placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          
          {/* Date Fields */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" value={newEvent.startDate} onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">End Date</label>
            <input type="date" value={newEvent.endDate} onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Booking Start Date</label>
            <input type="date" value={newEvent.bookingStartDate} onChange={(e) => setNewEvent({ ...newEvent, bookingStartDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Booking End Date</label>
            <input type="date" value={newEvent.bookingEndDate} onChange={(e) => setNewEvent({ ...newEvent, bookingEndDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
          </div>
          
          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 pt-2">
            <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg shadow-md transition-colors">
              <FaPlus className="inline mr-2" /> Add Event
            </Button>
          </div>
        </form>
      </div>

      {/* Existing Events Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <h3 className="text-xl font-semibold p-4 text-gray-800 border-b border-gray-200">Existing Events</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Event Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(events || []).map(event => (
              <tr key={event._id} className="hover:bg-pink-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-3">
                    <button onClick={() => setEditingEvent(event)} className="text-pink-500 hover:text-pink-700 transition-colors" title="Edit Event">
                      <FaEdit className="text-lg" />
                    </button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Event">
                      <FaTrashAlt className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && (
            <p className="p-6 text-center text-gray-500">No events have been created yet.</p>
        )}
      </div>
      
      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
          <div className="relative p-8 bg-white w-full max-w-lg rounded-xl shadow-2xl m-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Event: {editingEvent.name}</h3>
            <form onSubmit={handleUpdateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Input Fields */}
              <input type="text" placeholder="Event Name" value={editingEvent.name} onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              <input type="text" placeholder="Location" value={editingEvent.location} onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              <textarea placeholder="Description" value={editingEvent.description} onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              
              {/* Date Fields */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={editingEvent.startDate?.split('T')[0]} onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={editingEvent.endDate?.split('T')[0]} onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Booking Start Date</label>
                <input type="date" value={editingEvent.bookingStartDate?.split('T')[0]} onChange={(e) => setEditingEvent({ ...editingEvent, bookingStartDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Booking End Date</label>
                <input type="date" value={editingEvent.bookingEndDate?.split('T')[0]} onChange={(e) => setEditingEvent({ ...editingEvent, bookingEndDate: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" required />
              </div>
              
              {/* Action Buttons */}
              <div className="col-span-2 flex justify-end space-x-3 pt-2">
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium">Update Event</Button>
                <Button type="button" onClick={() => setEditingEvent(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">Cancel</Button>
              </div>
            </form>
            <button onClick={() => setEditingEvent(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
          </div>
        </div>
      )}
      
      {/* Custom Confirmation/Alert Modal */}
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
