// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaBuilding, FaTimes, FaBed, FaUserCheck, FaUserMinus, FaSearch } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isAlert = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000] p-4 font-body">
            <div className="bg-card p-6 rounded-2xl shadow-soft w-full max-w-sm m-4 transform transition-all">
                <h3 className="text-xl font-bold font-heading text-highlight mb-4">{title}</h3>
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

const ManageBuildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [newBuilding, setNewBuilding] = useState({ name: '', gender: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBuilding, setEditingBuilding] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', message: '', onConfirm: () => {}, onCancel: () => {}, confirmText: '', isAlert: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [genderFilter, setGenderFilter] = useState('');

    const fetchBuildings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/buildings');
            setBuildings(res.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch buildings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const summaryStats = useMemo(() => {
        const totalCapacity = buildings.reduce((acc, b) => acc + (b.capacity || 0), 0);
        const totalOccupancy = buildings.reduce((acc, b) => acc + (b.occupancy || 0), 0);
        return {
            totalBuildings: buildings.length,
            totalCapacity,
            totalOccupancy,
            totalVacancy: totalCapacity - totalOccupancy,
        };
    }, [buildings]);

    const filteredBuildings = useMemo(() => {
        return buildings.filter(b => 
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (genderFilter ? b.gender === genderFilter : true)
        );
    }, [buildings, searchTerm, genderFilter]);

    const handleAddBuilding = async (e) => {
        e.preventDefault();
        try {
            await api.post('/buildings', newBuilding);
            setNewBuilding({ name: '', gender: '' });
            fetchBuildings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add building.');
        }
    };

    const handleUpdateBuilding = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/buildings/${editingBuilding._id}`, { name: editingBuilding.name, gender: editingBuilding.gender });
            setEditingBuilding(null);
            fetchBuildings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update building.');
        }
    };

    const confirmDelete = async (id) => {
        setIsModalOpen(false);
        try {
            await api.delete(`/buildings/${id}`);
            fetchBuildings();
        } catch (err) {
            setModalData({
                title: 'Deletion Failed',
                message: err.response?.data?.message || 'Could not delete building. Ensure it has no occupants.',
                confirmText: 'Got It',
                isAlert: true,
                onConfirm: () => setIsModalOpen(false),
            });
            setIsModalOpen(true);
        }
    };

    const handleDeleteBuilding = (id) => {
        const buildingName = buildings.find(b => b._id === id)?.name || 'this building';
        setModalData({
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete ${buildingName} and all its rooms/beds?`,
            confirmText: 'Delete',
            isAlert: false,
            onConfirm: () => confirmDelete(id),
            onCancel: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center mt-10 text-xl text-primary font-body"><FaSpinner className="animate-spin inline mr-2" /> Loading Buildings...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-bold text-primaryDark font-heading mb-6 border-b-2 border-primary pb-2">
                <FaBuilding className="inline-block mr-3 text-primary" /> Manage Buildings
            </h2>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center shadow-md">{error}</div>}

            {/* SUMMARY STATS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaBuilding className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{summaryStats.totalBuildings}</p>
                    <p className="text-sm text-gray-500">Total Buildings</p>
                </div>
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaBed className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{summaryStats.totalCapacity}</p>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                </div>
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaUserCheck className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{summaryStats.totalOccupancy}</p>
                    <p className="text-sm text-gray-500">Total Occupancy</p>
                </div>
                 <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaUserMinus className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-2xl font-bold">{summaryStats.totalVacancy}</p>
                    <p className="text-sm text-gray-500">Total Vacancy</p>
                </div>
            </div>

            {/* ADD BUILDING FORM */}
            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">Add New Building</h3>
                <form onSubmit={handleAddBuilding} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building Name</label>
                        <input
                            type="text" name="name" value={newBuilding.name}
                            onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg" required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building Gender</label>
                        <select name="gender" value={newBuilding.gender}
                            onChange={(e) => setNewBuilding({ ...newBuilding, gender: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg" required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="unisex">Unisex</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg shadow-md">
                            <FaPlus className="inline mr-2" /> Add Building
                        </Button>
                    </div>
                </form>
            </div>

            {/* SEARCH/FILTER */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by building name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-500"
                    />
                    <FaSearch className="absolute top-2.5 left-3 text-gray-400"/>
                </div>
                <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-card shadow-soft rounded-2xl overflow-x-auto">
                <table className="min-w-full divide-y divide-background">
                    <thead className="bg-background/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Building Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Rooms</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Occupancy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Vacancy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium font-heading text-primaryDark uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-background">
                        {filteredBuildings.length > 0 ? filteredBuildings.map(building => {
                            const vacancy = (building.capacity || 0) - (building.occupancy || 0);
                            const vacancyColor = vacancy > 0 ? 'text-emerald-600' : 'text-rose-600';
                            return (
                                <tr key={building._id} className="hover:bg-background transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{building.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-600">{building.gender}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{building.roomCount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{building.capacity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{building.occupancy}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${vacancyColor}`}>{vacancy}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex space-x-3">
                                            <button onClick={() => setEditingBuilding(building)} className="text-pink-500 hover:text-pink-700" title="Edit Building">
                                                <FaEdit className="text-lg" />
                                            </button>
                                            <button onClick={() => handleDeleteBuilding(building._id)} className="text-red-500 hover:text-red-700" title="Delete Building">
                                                <FaTrashAlt className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="7" className="p-6 text-center text-gray-500">No buildings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* EDIT BUILDING MODAL */}
            {editingBuilding && (
                <div className="fixed inset-0 bg-black bg-opacity-60 overflow-y-auto h-full w-full flex items-center justify-center z-[1000]">
                    <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="relative p-8 bg-card w-full max-w-lg rounded-2xl shadow-soft m-4">
                        <h3 className="text-2xl font-bold font-heading text-primaryDark mb-4">Edit Building: {editingBuilding.name}</h3>
                        <form onSubmit={handleUpdateBuilding} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Building Name</label>
                                <input
                                    type="text" name="name" value={editingBuilding.name}
                                    onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Building Gender</label>
                                <select
                                    name="gender" value={editingBuilding.gender}
                                    onChange={(e) => setEditingBuilding({ ...editingBuilding, gender: e.target.value })}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg" required
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
                    </motion.div>
                </div>
            )}

            <ConfirmationModal isOpen={isModalOpen} {...modalData} />
        </motion.div>
    );
};

export default ManageBuildings;