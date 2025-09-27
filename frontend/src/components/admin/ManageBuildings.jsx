import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner } from 'react-icons/fa';

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


const ManageBuildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [newBuilding, setNewBuilding] = useState({ name: '', gender: '' }); // eventId state removed
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBuilding, setEditingBuilding] = useState(null);

    // State for Custom Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        onCancel: () => {},
        confirmText: '',
        isAlert: false,
        buildingToDelete: null
    });

    const fetchBuildings = async () => {
        try {
            const buildingsRes = await api.get('/buildings');
            setBuildings(buildingsRes.data || []);
        } catch (err) {
            setError('Failed to fetch buildings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const handleAddBuilding = async (e) => {
        e.preventDefault();
        try {
            // Only send name and gender in the request body
            await api.post('/buildings', newBuilding);
            setNewBuilding({ name: '', gender: '' });
            fetchBuildings();
        } catch (err) {
            setError('Failed to add building.');
        }
    };

    const handleUpdateBuilding = async (e) => {
        e.preventDefault();
        try {
            // Only send name and gender for the update
            await api.put(`/buildings/${editingBuilding._id}`, { name: editingBuilding.name, gender: editingBuilding.gender });
            setEditingBuilding(null);
            fetchBuildings();
        } catch (err) {
            setError('Failed to update building.');
        }
    };

    // New function to handle the actual deletion after confirmation
    const confirmDelete = async (id) => {
        setIsModalOpen(false);
        try {
            await api.delete(`/buildings/${id}`);
            fetchBuildings();
        } catch (err) {
            if (err.response?.status === 409) {
                setModalData({
                    title: 'Deletion Conflict',
                    message: 'A room or booking is still assigned to this building. Please remove all dependencies before deleting.',
                    confirmText: 'Got It',
                    isAlert: true,
                    onConfirm: () => setIsModalOpen(false),
                    onCancel: () => setIsModalOpen(false),
                });
                setIsModalOpen(true);
            } else {
                setError('Failed to delete building.');
            }
        }
    };

    // New function to open the custom confirmation modal
    const handleDeleteBuilding = (id) => {
        const buildingName = buildings.find(b => b._id === id)?.name || 'this building';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete ${buildingName}? This action cannot be undone.`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center mt-10 text-xl text-pink-500"><FaSpinner className="animate-spin inline mr-2" /> Loading Data...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 border-b-2 border-pink-400 pb-2">
                Manage Buildings
            </h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}
            
            {/* Add New Building Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-pink-500 mb-4">Add New Building</h3>
                <form onSubmit={handleAddBuilding} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    
                    {/* Building Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building Name</label>
                        <input
                            type="text"
                            name="name"
                            value={newBuilding.name}
                            onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 transition-colors"
                            required
                        />
                    </div>
                    
                    {/* Building Gender */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building Gender</label>
                        <select
                            name="gender"
                            value={newBuilding.gender}
                            onChange={(e) => setNewBuilding({ ...newBuilding, gender: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 transition-colors"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unisex">Unisex</option>
                        </select>
                    </div>
                    
                    {/* Add Button */}
                    <div className="md:col-span-1">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg shadow-md transition-colors">
                            <FaPlus className="inline mr-2" /> Add Building
                        </Button>
                    </div>
                </form>
            </div>

            {/* Existing Buildings Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
                <h3 className="text-xl font-semibold p-4 text-gray-800 border-b border-gray-200">Existing Buildings</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Building Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(buildings || []).map(building => (
                            <tr key={building._id} className="hover:bg-pink-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{building.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{building.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex space-x-3">
                                        <button onClick={() => setEditingBuilding(building)} className="text-pink-500 hover:text-pink-700 transition-colors" title="Edit Building">
                                            <FaEdit className="text-lg" />
                                        </button>
                                        <button onClick={() => handleDeleteBuilding(building._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Building">
                                            <FaTrashAlt className="text-lg" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {buildings.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No buildings have been created yet.</p>
                )}
            </div>

            {/* Edit Building Modal */}
            {editingBuilding && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
                    <div className="relative p-8 bg-white w-full max-w-lg rounded-xl shadow-2xl m-4">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Edit Building: {editingBuilding.name}</h3>
                        <form onSubmit={handleUpdateBuilding} className="space-y-4">
                            {/* Building Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Building Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editingBuilding.name}
                                    onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 transition-colors"
                                    required
                                />
                            </div>
                            
                            {/* Building Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Building Gender</label>
                                <select
                                    name="gender"
                                    value={editingBuilding.gender}
                                    onChange={(e) => setEditingBuilding({ ...editingBuilding, gender: e.target.value })}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500 transition-colors"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="unisex">Unisex</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white font-medium">Update Building</Button>
                                <Button type="button" onClick={() => setEditingBuilding(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium">Cancel</Button>
                            </div>
                        </form>
                        <button onClick={() => setEditingBuilding(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
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

export default ManageBuildings;