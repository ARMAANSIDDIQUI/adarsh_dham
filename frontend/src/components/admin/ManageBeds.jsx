// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaTrashAlt, FaPlus, FaSpinner, FaBed, FaTimes, FaFilter, FaEdit, FaSave } from 'react-icons/fa';

// Integrated Delete Confirmation Modal
const DeleteConfirmationModal = ({ item, type, isOpen, onClose, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto flex items-center justify-center p-4 font-body">
            <div className="relative bg-card w-full max-w-sm mx-auto rounded-2xl shadow-soft p-6">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-primaryDark hover:text-accent transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold font-heading mb-4 text-highlight border-b border-background pb-2">Confirm Deletion</h3>
                
                <p className="text-gray-700 mb-6">
                    Are you sure you want to permanently delete the {type} <strong>{item?.name}</strong>? 
                    This action cannot be undone.
                </p>
                
                <div className="flex space-x-3">
                    <Button 
                        onClick={onDelete} 
                        className="flex-1 bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg"
                    >
                        <FaTrashAlt className="mr-2" /> Yes, Delete
                    </Button>
                    <Button 
                        onClick={onClose} 
                        className="flex-1 bg-background hover:bg-opacity-80 text-primaryDark font-medium rounded-lg"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Integrated Edit Bed Modal
const EditBedModal = ({ isOpen, onClose, bed, onBedUpdated, rooms, buildings }) => {
    const [editedBed, setEditedBed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBuildingId, setSelectedBuildingId] = useState('');

    useEffect(() => {
        if (bed) {
            setEditedBed({ 
                ...bed, 
                roomId: bed.roomId, 
                buildingId: bed.buildingInfo?._id 
            });
            setSelectedBuildingId(bed.buildingInfo?._id);
        }
    }, [bed]);

    if (!isOpen || !editedBed) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBed(prev => ({ ...prev, [name]: value }));
    };

    const handleBuildingChange = (e) => {
        const buildingId = e.target.value;
        setSelectedBuildingId(buildingId);
        setEditedBed(prev => ({ ...prev, roomId: '' }));
    };

    const getRoomsForBuilding = (buildingId) => {
        return (rooms || []).filter(room => room.buildingId?._id === buildingId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.put(`/beds/${editedBed._id}`, {
                name: editedBed.name,
                type: editedBed.type,
                roomId: editedBed.roomId
            });
            onBedUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update bed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto flex items-center justify-center p-4 font-body">
            <div className="relative bg-card w-full max-w-lg mx-auto rounded-2xl shadow-soft p-6">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-primaryDark hover:text-accent transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold font-heading mb-4 text-highlight border-b border-background pb-2">
                    Edit Bed Unit
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building</label>
                        <select
                            name="buildingId"
                            value={selectedBuildingId}
                            onChange={handleBuildingChange}
                            className="mt-1 block w-full p-2 border border-background rounded-lg"
                        >
                            <option value="">Select Building</option>
                            {buildings.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <select
                            name="roomId"
                            value={editedBed.roomId}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-background rounded-lg disabled:bg-neutral"
                            disabled={!selectedBuildingId}
                        >
                            <option value="">Select Room</option>
                            {getRoomsForBuilding(selectedBuildingId).map(r => (
                                <option key={r._id} value={r._id}>Room {r.roomNumber}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Name</label>
                        <input
                            type="text"
                            name="name"
                            value={editedBed.name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-background rounded-lg"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Type</label>
                        <select
                            name="type"
                            value={editedBed.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border border-background rounded-lg"
                            required
                        >
                            <option value="single">Single</option>
                            <option value="floor bed">Floor Bed</option>
                        </select>
                    </div>

                    {error && <div className="text-highlight text-sm">{error}</div>}
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            className="bg-background hover:bg-opacity-80 text-primaryDark font-medium rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primaryDark text-white font-semibold py-2 px-6 rounded-lg shadow-soft"
                            disabled={loading}
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaSave className="inline mr-2" />} Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main ManageBeds Component
const ManageBeds = () => {
    const [beds, setBeds] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState('');
    const [newBed, setNewBed] = useState({ roomId: '', name: '', type: 'single' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bedToDelete, setBedToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bedToEdit, setBedToEdit] = useState(null);
    const [filters, setFilters] = useState({ name: '', buildingId: '', roomId: '', type: '', status: '' });

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
            setBuildings(buildingsRes.data.map(b => ({ _id: b._id, name: b.name })) || []);
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

    const openEditModal = (bed) => {
        setBedToEdit(bed);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setBedToEdit(null);
        setIsEditModalOpen(false);
    };

    const handleBedUpdated = () => {
        fetchAllData();
    };

    const getRoomsForBuilding = (buildingId) => {
        return (rooms || []).filter(room => room.buildingId?._id === buildingId);
    };

    const filteredBeds = useMemo(() => beds.filter(bed => {
        const matchesName = filters.name ? bed.name?.toLowerCase().includes(filters.name.toLowerCase()) : true;
        const matchesBuilding = filters.buildingId ? bed.buildingName === buildings.find(b => b._id === filters.buildingId)?.name : true;
        const matchesRoom = filters.roomId ? bed.roomId === filters.roomId : true;
        const matchesType = filters.type ? bed.type === filters.type : true;
        const matchesStatus = filters.status ? bed.status === filters.status : true;

        return matchesName && matchesBuilding && matchesRoom && matchesType && matchesStatus;
    }), [beds, filters, buildings]);

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-primary text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-primary pb-2 inline-block font-heading">
                <FaBed className="inline mr-3 text-primary"/> Manage Beds
            </h2>
            {error && <div className="bg-highlight/10 text-highlight p-3 rounded-xl mb-6 font-medium text-center">{error}</div>}
            
            <div className="bg-card p-6 rounded-2xl shadow-soft mb-6">
                <h3 className="text-lg font-semibold mb-4 text-primaryDark font-heading flex items-center">
                    <FaFilter className="mr-2"/> Filter Beds
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <input type="text" placeholder="Search by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary"/>
                    <select value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value, roomId: '' })}
                        className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary">
                        <option value="">All Buildings</option>
                        {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                    <select value={filters.roomId} onChange={(e) => setFilters({ ...filters, roomId: e.target.value })}
                        className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary" disabled={!filters.buildingId}>
                        <option value="">All Rooms</option>
                        {getRoomsForBuilding(filters.buildingId).map(r => <option key={r._id} value={r._id}>Room {r.roomNumber}</option>)}
                    </select>
                    <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary">
                        <option value="">All Types</option>
                        <option value="single">Single</option>
                        <option value="floor bed">Floor Bed</option>
                    </select>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary">
                        <option value="">All Statuses</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                    </select>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold mb-4 text-primaryDark font-heading flex items-center">
                    <FaPlus className="mr-2"/> Add New Bed Unit
                </h3>
                <form onSubmit={handleAddBed} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building</label>
                        <select value={selectedBuildingId} onChange={(e) => { setSelectedBuildingId(e.target.value); setNewBed({ ...newBed, roomId: '' }); }} 
                            className="mt-1 block w-full p-2 border border-background rounded-lg" required>
                            <option value="">Select Building</option>
                            {buildings.map(building => <option key={building._id} value={building._id}>{building.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <select value={newBed.roomId} onChange={(e) => setNewBed({ ...newBed, roomId: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-background rounded-lg disabled:bg-neutral" disabled={!selectedBuildingId} required>
                            <option value="">Select Room</option>
                            {getRoomsForBuilding(selectedBuildingId).map(room => <option key={room._id} value={room._id}>Room {room.roomNumber}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Name / Number</label>
                        <input type="text" value={newBed.name} onChange={(e) => setNewBed({ ...newBed, name: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-background rounded-lg" placeholder="e.g., A1, Bed 3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Type</label>
                        <select value={newBed.type} onChange={(e) => setNewBed({ ...newBed, type: e.target.value })} 
                            className="mt-1 block w-full p-2 border border-background rounded-lg" required>
                            <option value="single">Single</option>
                            <option value="floor bed">Floor Bed</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
                        <Button type="submit" className="bg-highlight hover:bg-primaryDark text-white font-semibold py-2 px-6 rounded-lg shadow-soft">
                            <FaPlus className="inline mr-2" /> Add Bed
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-card shadow-soft rounded-2xl overflow-x-auto">
                <table className="min-w-full divide-y divide-background">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Bed Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Status (Today)</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold font-heading text-primaryDark uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-background">
                        {filteredBeds.map(bed => {
                            const statusColor = bed.status === 'occupied' ? 'text-highlight' : 'text-green-600';
                            return (
                                <tr key={bed._id} className="hover:bg-background transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{bed.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{`${bed.buildingName} / Room ${bed.roomNumber}`}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{bed.type}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm capitalize font-medium ${statusColor}`}>
                                        {bed.status}
                                        {bed.status === 'occupied' && bed.occupant && (
                                            <span className="block text-xs text-gray-700 font-normal">({bed.occupant.name})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                        <button onClick={() => openEditModal(bed)} className="text-primary hover:text-primaryDark p-1 transition-colors" title="Edit Bed">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => confirmDeleteBed(bed)} className="text-highlight hover:text-primaryDark p-1 transition-colors" title="Delete Bed">
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredBeds.length === 0 && (
                    <div className="p-6 text-center text-gray-700">No beds match the current filters.</div>
                )}
            </div>

            <DeleteConfirmationModal 
                item={bedToDelete} 
                type="Bed Unit"
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteBed}
            />

            <EditBedModal 
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                bed={bedToEdit}
                onBedUpdated={handleBedUpdated}
                rooms={rooms}
                buildings={buildings}
            />
        </motion.div>
    );
};

export default ManageBeds;