import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaBed, FaTimes } from 'react-icons/fa';

// --- Bed Deletion Confirmation Modal Component ---
const DeleteConfirmationModal = ({ item, type, isOpen, onClose, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 overflow-y-auto flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-sm mx-auto rounded-xl shadow-2xl p-6">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold mb-4 text-red-600 border-b pb-2">Confirm Deletion</h3>
                
                <p className="text-gray-700 mb-6">
                    Are you sure you want to permanently delete the {type} **{item.name}**? 
                    This action cannot be undone and may affect associated data.
                </p>
                
                <div className="flex space-x-3">
                    <Button 
                        onClick={onDelete} 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
                    >
                        <FaTrashAlt className="mr-2" /> Yes, Delete
                    </Button>
                    <Button 
                        onClick={onClose} 
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};


const ManageBeds = () => {
    const [beds, setBeds] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [newBed, setNewBed] = useState({ roomId: '', name: '', type: 'single' });
    
    // State for modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bedToDelete, setBedToDelete] = useState(null);


    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bedsRes, roomsRes, buildingsRes] = await Promise.all([
                api.get('/beds'),
                api.get('/rooms'),
                api.get('/buildings')
            ]);
            setBeds(bedsRes.data || []);
            setRooms(roomsRes.data || []);
            setBuildings(buildingsRes.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please ensure the server is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/beds', newBed);
            setNewBed({ roomId: '', name: '', type: 'single' });
            setSelectedBuildingId('');
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add bed.');
        }
    };

    const confirmDeleteBed = (bed) => {
        setBedToDelete(bed);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteBed = async () => {
        if (!bedToDelete) return;
        setIsDeleteModalOpen(false);
        try {
            await api.delete(`/beds/${bedToDelete._id}`);
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete bed.');
        } finally {
            setBedToDelete(null);
        }
    };

    const getRoomsForBuilding = (buildingId) => {
        return (rooms || []).filter(room => room.buildingId?._id === buildingId);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-pink-500 pb-2 inline-block">
                <FaBed className="inline mr-3 text-pink-500"/> Manage Beds
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6 font-medium border border-red-300 text-center">{error}</div>}
            
            {/* --- Add New Bed Section --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-pink-600 flex items-center">
                    <FaPlus className="mr-2"/> Add New Bed Unit
                </h3>
                <form onSubmit={handleAddBed} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Building Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building</label>
                        <select 
                            value={selectedBuildingId} 
                            onChange={(e) => {
                                setSelectedBuildingId(e.target.value);
                                setNewBed({ ...newBed, roomId: '' });
                            }} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" 
                            required
                        >
                            <option value="">Select Building</option>
                            {(buildings || []).map(building => (
                                <option key={building._id} value={building._id}>{building.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Room Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <select 
                            value={newBed.roomId} 
                            onChange={(e) => setNewBed({ ...newBed, roomId: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors disabled:bg-gray-100" 
                            disabled={!selectedBuildingId} 
                            required
                        >
                            <option value="">Select Room</option>
                            {getRoomsForBuilding(selectedBuildingId).map(room => (
                                <option key={room._id} value={room._id}>Room {room.roomNumber}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Bed Name / Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Name / Number</label>
                        <input 
                            type="text" 
                            value={newBed.name} 
                            onChange={(e) => setNewBed({ ...newBed, name: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" 
                            placeholder="e.g., A1, Bed 3"
                            required 
                        />
                    </div>
                    
                    {/* Bed Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Type</label>
                        <select 
                            value={newBed.type} 
                            onChange={(e) => setNewBed({ ...newBed, type: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors" 
                            required
                        >
                            <option value="single">Single (Capacity 1)</option>
                            <option value="double">Double (Capacity 2)</option>
                        </select>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
                        <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md">
                            <FaPlus className="inline mr-2" /> Add Bed
                        </Button>
                    </div>
                </form>
            </div>

            {/* --- Bed List Table --- */}
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
                <h3 className="text-xl font-semibold p-4 border-b border-gray-100 text-gray-800">Bed Inventory ({beds.length})</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bed Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room (Building)</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Capacity</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Occupancy</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {(beds || []).map(bed => {
                            const roomName = bed.roomId?.roomNumber || 'N/A';
                            const buildingName = bed.roomId?.buildingId?.name || 'N/A';
                            const capacity = bed.type === 'double' ? 2 : 1;
                            const occupancyStyle = bed.occupancy >= capacity ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium';

                            return (
                                <tr key={bed._id} className="hover:bg-pink-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bed.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{`${roomName} (${buildingName})`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{bed.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{capacity}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${occupancyStyle}`}>{bed.occupancy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center space-x-4">
                                            {/* Edit Button - Placeholder */}
                                            <button 
                                                className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50" 
                                                title="Edit (Coming Soon)"
                                                disabled
                                            >
                                                <FaEdit />
                                            </button>
                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => confirmDeleteBed(bed)} 
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors" 
                                                title="Delete Bed"
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {beds.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No beds have been added yet.</div>
                )}
            </div>

            {/* Modal Integration */}
            <DeleteConfirmationModal 
                item={bedToDelete} 
                type="Bed Unit"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteBed}
            />
        </motion.div>
    );
};

export default ManageBeds;
