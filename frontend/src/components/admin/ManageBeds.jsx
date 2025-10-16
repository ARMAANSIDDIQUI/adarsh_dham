import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaTrashAlt, FaPlus, FaSpinner, FaBed, FaTimes, FaFilter, FaEdit, FaSave, FaSearch, FaChevronDown, FaUserCheck, FaMale, FaFemale, FaRestroom } from 'react-icons/fa';

const DeleteConfirmationModal = ({ item, type, isOpen, onClose, onDelete }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto flex items-center justify-center p-4 font-body">
            <div className="relative bg-card w-full max-w-sm mx-auto rounded-2xl shadow-soft p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-primaryDark hover:text-accent transition-colors"><FaTimes className="text-xl" /></button>
                <h3 className="text-2xl font-bold font-heading mb-4 text-highlight border-b border-background pb-2">Confirm Deletion</h3>
                <p className="text-gray-700 mb-6">Are you sure you want to permanently delete the {type} <strong>{item?.name}</strong>? This action cannot be undone.</p>
                <div className="flex space-x-3">
                    <Button onClick={onDelete} className="flex-1 bg-highlight hover:bg-primaryDark text-white font-medium rounded-lg"><FaTrashAlt className="mr-2" /> Yes, Delete</Button>
                    <Button onClick={onClose} className="flex-1 bg-background hover:bg-opacity-80 text-primaryDark font-medium rounded-lg">Cancel</Button>
                </div>
            </div>
        </div>
    );
};

const EditBedModal = ({ isOpen, onClose, bed, onBedUpdated, rooms, buildings }) => {
    const [editedBed, setEditedBed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedBuildingId, setSelectedBuildingId] = useState('');

    useEffect(() => {
        if (bed) {
            setEditedBed({
                name: bed.name,
                type: bed.type,
                roomId: bed.roomId,
            });
            const parentRoom = rooms.find(r => r._id === bed.roomId);
            setSelectedBuildingId(parentRoom?.buildingId?._id);
        }
    }, [bed, rooms]);

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

    const getRoomsForBuilding = (buildingId) => (rooms || []).filter(room => room.buildingId?._id === buildingId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.put(`/beds/${bed._id}`, {
                name: editedBed.name,
                type: editedBed.type,
                roomId: editedBed.roomId
            });
            onBedUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update bed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 overflow-y-auto flex items-center justify-center p-4 font-body">
            <div className="relative bg-card w-full max-w-lg mx-auto rounded-2xl shadow-soft p-6">
                <button onClick={onClose} className="absolute top-4 right-4 text-primaryDark hover:text-accent transition-colors"><FaTimes className="text-xl" /></button>
                <h3 className="text-2xl font-bold font-heading mb-4 text-highlight border-b border-background pb-2">Edit Bed Unit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building</label>
                        <select name="buildingId" value={selectedBuildingId} onChange={handleBuildingChange} className="mt-1 block w-full p-2 border border-background rounded-lg">
                            <option value="">Select Building</option>
                            {buildings.map(b => (<option key={b._id} value={b._id}>{b.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <select name="roomId" value={editedBed.roomId} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-background rounded-lg disabled:bg-neutral" disabled={!selectedBuildingId}>
                            <option value="">Select Room</option>
                            {getRoomsForBuilding(selectedBuildingId).map(r => (<option key={r._id} value={r._id}>Room {r.roomNumber}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Name</label>
                        <input type="text" name="name" value={editedBed.name} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-background rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Type</label>
                        <select name="type" value={editedBed.type} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-background rounded-lg" required>
                            <option value="single">Single</option>
                            <option value="floor bed">Floor Bed</option>
                        </select>
                    </div>
                    {error && <div className="text-highlight text-sm">{error}</div>}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button type="button" onClick={onClose} className="bg-background hover:bg-opacity-80 text-primaryDark font-medium rounded-lg">Cancel</Button>
                        <Button type="submit" className="bg-primary hover:bg-primaryDark text-white font-semibold py-2 px-6 rounded-lg shadow-soft" disabled={loading}>
                            {loading ? <FaSpinner className="animate-spin" /> : <><FaSave className="inline mr-2" /> Save Changes</>}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false, searchTerm, onSearchTermChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) { document.addEventListener("mousedown", handleClickOutside); }
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowercasedTerm = searchTerm.toLowerCase();
        return options.filter(option => option.label.toLowerCase().includes(lowercasedTerm));
    }, [options, searchTerm]);

    const selectedOption = options.find(option => option.value === value);

    const handleOptionClick = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
        onSearchTermChange('');
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors duration-200 ${disabled ? 'bg-gray-200 text-gray-400' : 'bg-white hover:border-primary'}`} onClick={() => !disabled && setIsOpen(!isOpen)} tabIndex="0">
                <span className={`text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
                <FaChevronDown className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden searchable-select-dropdown">
                        <div className="relative p-2 border-b">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input ref={inputRef} type="text" placeholder="Search..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} className="w-full pl-8 pr-2 py-1 text-sm border-none focus:ring-0" onClick={(e) => e.stopPropagation()} />
                        </div>
                        <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (<li key={option.value} onClick={() => handleOptionClick(option.value)} className="p-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md">{option.label}</li>))
                            ) : (<li className="p-2 text-sm text-gray-500 italic">No options found.</li>)}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bedToDelete, setBedToDelete] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [bedToEdit, setBedToEdit] = useState(null);
    const [filters, setFilters] = useState({ name: '', buildingId: '', roomId: '', type: '', status: '' });

    const [addBedBuildingSearch, setAddBedBuildingSearch] = useState('');
    const [addBedRoomSearch, setAddBedRoomSearch] = useState('');
    const [filterBuildingSearch, setFilterBuildingSearch] = useState('');
    const [filterRoomSearch, setFilterRoomSearch] = useState('');

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bedsRes, roomsRes, buildingsRes] = await Promise.all([api.get('/beds'), api.get('/rooms'), api.get('/buildings')]);
            setBeds(bedsRes.data || []);
            setRooms(roomsRes.data || []);
            setBuildings(buildingsRes.data || []);
        } catch (err) {
            setError('Failed to fetch data. Please ensure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const analytics = useMemo(() => {
        const stats = {
            male: { total: 0, occupied: 0, vacant: 0 },
            female: { total: 0, occupied: 0, vacant: 0 },
            unisex: { total: 0, occupied: 0, vacant: 0 },
        };
    
        if (!beds.length || !rooms.length || !buildings.length) {
            return stats;
        }
    
        const buildingGenderMap = new Map(buildings.map(b => [b._id, b.gender?.toLowerCase()]));
        const roomToBuildingMap = new Map(rooms.map(r => [r._id, r.buildingId?._id]));
    
        beds.forEach(bed => {
            const buildingId = roomToBuildingMap.get(bed.roomId);
            if (buildingId) {
                const gender = buildingGenderMap.get(buildingId);
                const category = stats[gender];
                if (category) {
                    category.total++;
                    if (bed.status === 'occupied') {
                        category.occupied++;
                    }
                }
            }
        });
    
        stats.male.vacant = stats.male.total - stats.male.occupied;
        stats.female.vacant = stats.female.total - stats.female.occupied;
        stats.unisex.vacant = stats.unisex.total - stats.unisex.occupied;
    
        return stats;
    }, [beds, rooms, buildings]);

    const handleAddBed = async (e) => {
        e.preventDefault();
        try {
            await api.post('/beds', newBed);
            setNewBed({ roomId: '', name: '', type: 'single' });
            setSelectedBuildingId('');
            setAddBedBuildingSearch('');
            setAddBedRoomSearch('');
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add bed.');
        }
    };

    const confirmDeleteBed = (bed) => { setBedToDelete(bed); setIsDeleteModalOpen(true); };
    const openEditModal = (bed) => { setBedToEdit(bed); setIsEditModalOpen(true); };
    const closeEditModal = () => { setIsEditModalOpen(false); setBedToEdit(null); };
    const handleBedUpdated = () => fetchAllData();

    const handleDeleteBed = async () => {
        if (!bedToDelete) return;
        try {
            await api.delete(`/beds/${bedToDelete._id}`);
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete bed.');
        } finally {
            setBedToDelete(null);
            setIsDeleteModalOpen(false);
        }
    };

    const getRoomsForBuilding = (buildingId) => (rooms || []).filter(room => room.buildingId?._id === buildingId);
    const getBuildingOptions = () => [{ value: '', label: 'All Buildings' }, ...buildings.map(b => ({ value: b._id, label: b.name }))];
    const getRoomOptionsForBuilding = (buildingId) => {
        if (!buildingId) return [{ value: '', label: 'All Rooms' }];
        const roomsInBuilding = getRoomsForBuilding(buildingId);
        return [{ value: '', label: 'All Rooms' }, ...roomsInBuilding.map(r => ({ value: r._id, label: `Room ${r.roomNumber}` }))];
    };
    
    const roomMap = useMemo(() => new Map(rooms.map(room => [room._id, room])), [rooms]);

    const filteredBeds = useMemo(() => {
        if (!beds) return [];
        return beds.filter(bed => {
            const roomOfBed = roomMap.get(bed.roomId);
            const matchesName = filters.name ? bed.name?.toLowerCase().includes(filters.name.toLowerCase()) : true;
            const matchesBuilding = filters.buildingId ? roomOfBed?.buildingId?._id === filters.buildingId : true;
            const matchesRoom = filters.roomId ? bed.roomId === filters.roomId : true;
            const matchesType = filters.type ? bed.type === filters.type : true;
            const matchesStatus = filters.status ? bed.status === filters.status : true;
            return matchesName && matchesBuilding && matchesRoom && matchesType && matchesStatus;
        });
    }, [beds, filters, roomMap]);

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-primary text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-primary pb-2 inline-block font-heading"><FaBed className="inline mr-3 text-primary"/> Manage Beds</h2>
            
            {error && <div className="bg-highlight/10 text-highlight p-3 rounded-xl mb-6 font-medium text-center">{error}</div>}

            {/* Analytics Section */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold font-heading text-primaryDark mb-4">Bed Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Male Section */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm">
                        <h4 className="font-bold text-blue-800 flex items-center mb-3"><FaMale className="mr-2"/> Male</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div><FaBed className="mx-auto text-blue-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.male.total}</p><p className="text-xs">Total</p></div>
                            <div><FaUserCheck className="mx-auto text-emerald-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.male.occupied}</p><p className="text-xs">Occupied</p></div>
                            <div><FaBed className="mx-auto text-orange-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.male.vacant}</p><p className="text-xs">Vacant</p></div>
                        </div>
                    </div>
                     {/* Female Section */}
                    <div className="bg-pink-50 border-l-4 border-pink-500 p-4 rounded-r-lg shadow-sm">
                        <h4 className="font-bold text-pink-800 flex items-center mb-3"><FaFemale className="mr-2"/> Female</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div><FaBed className="mx-auto text-pink-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.female.total}</p><p className="text-xs">Total</p></div>
                            <div><FaUserCheck className="mx-auto text-emerald-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.female.occupied}</p><p className="text-xs">Occupied</p></div>
                            <div><FaBed className="mx-auto text-orange-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.female.vacant}</p><p className="text-xs">Vacant</p></div>
                        </div>
                    </div>
                     {/* Family/Unisex Section */}
                    <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded-r-lg shadow-sm">
                        <h4 className="font-bold text-gray-800 flex items-center mb-3"><FaRestroom className="mr-2"/> Family / Unisex</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div><FaBed className="mx-auto text-gray-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.unisex.total}</p><p className="text-xs">Total</p></div>
                            <div><FaUserCheck className="mx-auto text-emerald-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.unisex.occupied}</p><p className="text-xs">Occupied</p></div>
                            <div><FaBed className="mx-auto text-orange-500 text-2xl mb-1"/><p className="text-xl font-bold">{analytics.unisex.vacant}</p><p className="text-xs">Vacant</p></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft mb-6">
                <h3 className="text-lg font-semibold mb-4 text-primaryDark font-heading flex items-center"><FaFilter className="mr-2"/> Filter Beds</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    <input type="text" placeholder="Search by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary"/>
                    <SearchableSelect options={getBuildingOptions()} value={filters.buildingId} onChange={(e) => setFilters({ ...filters, buildingId: e.target.value, roomId: '' })} placeholder="All Buildings" searchTerm={filterBuildingSearch} onSearchTermChange={setFilterBuildingSearch} />
                    <SearchableSelect options={getRoomOptionsForBuilding(filters.buildingId)} value={filters.roomId} onChange={(e) => setFilters({ ...filters, roomId: e.target.value })} placeholder="All Rooms" disabled={!filters.buildingId} searchTerm={filterRoomSearch} onSearchTermChange={setFilterRoomSearch} />
                    <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary">
                        <option value="">All Types</option>
                        <option value="single">Single</option>
                        <option value="floor bed">Floor Bed</option>
                    </select>
                    <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="p-2 border border-background rounded-lg focus:ring-primary focus:border-primary">
                        <option value="">All Statuses</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                    </select>
                </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-soft mb-8">
                <h3 className="text-xl font-semibold mb-4 text-primaryDark font-heading flex items-center"><FaPlus className="mr-2"/> Add New Bed Unit</h3>
                <form onSubmit={handleAddBed} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Building</label>
                        <SearchableSelect options={buildings.map(b => ({ value: b._id, label: b.name }))} value={selectedBuildingId} onChange={(e) => {setSelectedBuildingId(e.target.value); setNewBed({ ...newBed, roomId: '' });}} placeholder="Select Building" searchTerm={addBedBuildingSearch} onSearchTermChange={setAddBedBuildingSearch} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Room</label>
                        <SearchableSelect options={getRoomsForBuilding(selectedBuildingId).map(r => ({ value: r._id, label: `Room ${r.roomNumber}` }))} value={newBed.roomId} onChange={(e) => setNewBed({ ...newBed, roomId: e.target.value })} placeholder="Select Room" disabled={!selectedBuildingId} searchTerm={addBedRoomSearch} onSearchTermChange={setAddBedRoomSearch} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Name / Number</label>
                        <input type="text" value={newBed.name} onChange={(e) => setNewBed({ ...newBed, name: e.target.value })} className="mt-1 block w-full p-2 border border-background rounded-lg" placeholder="e.g., A1, Bed 3" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bed Type</label>
                        <select value={newBed.type} onChange={(e) => setNewBed({ ...newBed, type: e.target.value })} className="mt-1 block w-full p-2 border border-background rounded-lg" required>
                            <option value="single">Single</option>
                            <option value="floor bed">Floor Bed</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
                        <Button type="submit" className="bg-highlight hover:bg-primaryDark text-white font-semibold py-2 px-6 rounded-lg shadow-soft"><FaPlus className="inline mr-2" /> Add Bed</Button>
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
                                        {bed.status === 'occupied' && bed.occupant && (<span className="block text-xs text-gray-700 font-normal">({bed.occupant.name})</span>)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                        <button onClick={() => openEditModal(bed)} className="text-primary hover:text-primaryDark p-1 transition-colors" title="Edit Bed"><FaEdit /></button>
                                        <button onClick={() => confirmDeleteBed(bed)} className="text-highlight hover:text-primaryDark p-1 transition-colors" title="Delete Bed"><FaTrashAlt /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredBeds.length === 0 && !loading && (<div className="p-6 text-center text-gray-700">No beds match the current filters.</div>)}
            </div>

            <DeleteConfirmationModal item={bedToDelete} type="Bed Unit" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={handleDeleteBed} />
            <EditBedModal isOpen={isEditModalOpen} onClose={closeEditModal} bed={bedToEdit} onBedUpdated={handleBedUpdated} rooms={rooms} buildings={buildings} />
        </motion.div>
    );
};

export default ManageBeds;