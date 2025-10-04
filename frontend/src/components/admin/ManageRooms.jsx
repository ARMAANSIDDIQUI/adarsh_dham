import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';

// Custom Modal Component for Delete Confirmation and Alerts
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isAlert = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000] font-body">
            <div className="bg-card p-6 rounded-2xl shadow-soft w-full max-w-sm m-4 transform transition-all">
                <h3 className="text-xl font-bold font-heading text-primaryDark mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
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

const ManageRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);

    const [newRoomData, setNewRoomData] = useState({
        roomNumber: '',
        buildingId: '',
        beds: [{ name: '', type: 'single' }]
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ 
        title: '', 
        message: '', 
        onConfirm: () => {}, 
        onCancel: () => {}, 
        confirmText: '', 
        isAlert: false,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('');

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [roomsRes, buildingsRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/buildings')
            ]);
            setRooms(roomsRes.data || []);
            setBuildings(buildingsRes.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleBedInputChange = (index, event) => {
        const updatedBeds = [...newRoomData.beds];
        updatedBeds[index][event.target.name] = event.target.value;
        setNewRoomData({ ...newRoomData, beds: updatedBeds });
    };

    const handleAddBedField = () => {
        setNewRoomData(prev => ({ ...prev, beds: [...prev.beds, { name: '', type: 'single' }] }));
    };

    const handleRemoveBedField = (index) => {
        const filteredBeds = newRoomData.beds.filter((_, i) => i !== index);
        setNewRoomData({ ...newRoomData, beds: filteredBeds });
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (newRoomData.beds.length === 0) {
            setModalData({
                title: 'Missing Beds',
                message: 'A room must have at least one bed configured.',
                confirmText: 'OK',
                isAlert: true,
                onConfirm: () => setIsModalOpen(false),
                onCancel: () => setIsModalOpen(false),
            });
            setIsModalOpen(true);
            return;
        }
        try {
            await api.post('/rooms', newRoomData);
            setNewRoomData({ roomNumber: '', buildingId: '', beds: [{ name: '', type: 'single' }] });
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room.');
        }
    };
    
    const confirmDelete = async (id) => {
        setIsModalOpen(false);
        try {
            await api.delete(`/rooms/${id}`);
            await fetchAllData();
        } catch (err) {
            setModalData({
                title: 'Deletion Failed',
                message: err.response?.data?.message || 'Failed to delete room. It might have associated bookings.',
                confirmText: 'Got It',
                isAlert: true,
                onConfirm: () => setIsModalOpen(false),
                onCancel: () => setIsModalOpen(false),
            });
            setIsModalOpen(true);
        }
    };

    const handleDeleteRoom = (id) => {
        const roomNumber = rooms.find(r => r._id === id)?.roomNumber || 'this room';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete room #${roomNumber} and all its beds? This action cannot be undone.`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };
    
    const handleUpdateRoom = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/rooms/${editingRoom._id}`, { roomNumber: editingRoom.roomNumber });
            setEditingRoom(null);
            await fetchAllData();
        } catch (err) {
             setError(err.response?.data?.message || 'Failed to update room.');
        }
    };

    if (loading) return <div className="text-center mt-10 text-xl text-primary font-body"><FaSpinner className="animate-spin inline mr-2" /> Loading Rooms...</div>;

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBuilding = selectedBuilding ? room.buildingId?._id === selectedBuilding : true;
        return matchesSearch && matchesBuilding;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-bold text-primaryDark font-heading mb-6 border-b-2 border-primary pb-2">
                Manage Rooms
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}

            {/* Create New Room Section */}
            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">Create New Room</h3>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Building</label>
                            <select 
                                value={newRoomData.buildingId} 
                                onChange={(e) => setNewRoomData({ ...newRoomData, buildingId: e.target.value })} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" 
                                required
                            >
                                <option value="">Select Building</option>
                                {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room Number</label>
                            <input 
                                type="text" 
                                value={newRoomData.roomNumber} 
                                onChange={(e) => setNewRoomData({ ...newRoomData, roomNumber: e.target.value })} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" 
                                required 
                            />
                        </div>
                    </div>
                    
                    {/* Beds Section */}
                    <div className="border border-background p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-primaryDark mb-3">Beds in this Room</h4>
                        {newRoomData.beds.map((bed, index) => (
                            <div key={index} className="grid grid-cols-5 md:grid-cols-7 gap-3 items-center mt-2 pb-2 border-b last:border-b-0">
                                <div className="col-span-2">
                                    <input 
                                        name="name" 
                                        type="text" 
                                        placeholder="Bed Name (e.g., A1)" 
                                        value={bed.name} 
                                        onChange={e => handleBedInputChange(index, e)} 
                                        className="block w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-pink-300 focus:border-pink-500" 
                                        required 
                                    />
                                </div>
                                <div className="col-span-2">
                                    <select 
                                        name="type" 
                                        value={bed.type} 
                                        onChange={e => handleBedInputChange(index, e)} 
                                        className="block w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-pink-300 focus:border-pink-500"
                                    >
                                        <option value="single">Single</option>
                                        <option value="floor bed">Floor Bed</option>
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-3">
                                    <Button 
                                        type="button" 
                                        onClick={() => handleRemoveBedField(index)} 
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center transition-colors"
                                        disabled={newRoomData.beds.length === 1}
                                    >
                                        <FaTimes className="mr-1" /> Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button 
                            type="button" 
                            onClick={handleAddBedField} 
                            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            <FaPlus className="inline mr-1" /> Add Another Bed
                        </Button>
                    </div>
                    
                    <div className="pt-2 text-right">
                        <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors">
                            Create Room
                        </Button>
                    </div>
                </form>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                <input
                    type="text"
                    placeholder="Search by Room Number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                />
                <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-full md:w-1/4 p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                >
                    <option value="">All Buildings</option>
                    {buildings.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                </select>
            </div>

            {/* Existing Rooms Table */}
            <div className="bg-card shadow-soft rounded-2xl overflow-x-auto">
                <h3 className="text-xl font-semibold font-heading p-4 text-primaryDark border-b border-background">All Rooms</h3>
                <table className="min-w-full divide-y divide-background">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Room #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Building</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Occupancy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-background">
                        {filteredRooms.map(room => (
                            <tr key={room._id} className="hover:bg-background transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.roomNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.buildingId?.name || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.occupancy}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-3">
                                        <button onClick={() => setEditingRoom(room)} className="text-pink-500 hover:text-pink-700 transition-colors" title="Edit Room Number">
                                            <FaEdit className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteRoom(room._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Room">
                                            <FaTrashAlt className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredRooms.length === 0 && (
                            <tr className="border-b-0">
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No rooms found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {editingRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
                    <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="bg-card p-8 rounded-2xl shadow-soft w-full max-w-md m-4">
                        <h3 className="text-2xl font-bold font-heading text-primaryDark mb-4">Edit Room Number</h3>
                        <form onSubmit={handleUpdateRoom}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                                <input 
                                    type="text" 
                                    value={editingRoom.roomNumber} 
                                    onChange={(e) => setEditingRoom({...editingRoom, roomNumber: e.target.value})} 
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500" 
                                    required 
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <Button type="button" onClick={() => setEditingRoom(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">Cancel</Button>
                                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium">Update Room</Button>
                            </div>
                        </form>
                        <button onClick={() => setEditingRoom(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
                    </motion.div>
                </div>
            )}
            
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

export default ManageRooms;