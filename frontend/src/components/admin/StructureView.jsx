import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import { FaSpinner, FaBuilding, FaBed, FaUserCheck, FaUserMinus, FaTimes, FaHashtag, FaHome, FaCity, FaPhone, FaUserTag, FaSearch, FaMale, FaFemale } from 'react-icons/fa';

/**
 * Normalizes gender strings (e.g., 'Boy', 'unisex' -> 'male', 'mixed').
 */
const normalizeGender = (gender) => {
    if (!gender) return 'n/a';
    const lower = gender.toLowerCase();
    if (lower === 'boy') return 'male';
    if (lower === 'unisex') return 'mixed';
    return lower;
};

/**
 * Modal component to display occupant details.
 */
const OccupantDetailsModal = ({ isOpen, person, onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !person) return null;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-body overflow-y-auto"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative bg-card p-6 rounded-2xl shadow-soft w-full max-w-md mt-10 mb-10"
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 text-primaryDark hover:text-accent">
                            <FaTimes size={20} />
                        </button>
                        
                        <h3 className="text-2xl font-bold font-heading text-highlight mb-4 border-b border-background pb-2">{person.name}</h3>
                        
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center"><FaHashtag className="mr-3 text-gray-400"/>Booking No: <span className="font-semibold ml-2">{person.bookingNumber}</span></p>
                            <p className="flex items-center"><FaHome className="mr-3 text-gray-400"/>Ashram: <span className="font-semibold ml-2">{person.ashramName}</span></p>
                            <p className="flex items-center"><FaCity className="mr-3 text-gray-400"/>City: <span className="font-semibold ml-2">{person.city}</span></p>
                            <p className="flex items-center"><FaPhone className="mr-3 text-gray-400"/>Contact: <span className="font-semibold ml-2">{person.contactNumber}</span></p>
                            <p className="flex items-center"><FaUserTag className="mr-3 text-gray-400"/>Reference: <span className="font-semibold ml-2">{person.baijiMahatmaJi || 'N/A'}</span></p>
                            <p className="flex items-center"><FaUserTag className="mr-3 text-gray-400"/>Gender: <span className="font-semibold ml-2 capitalize">{person.gender || 'N/A'}</span></p>
                            <p className="mt-4 pt-4 border-t border-background text-sm text-center">Stay: {formatDate(person.stayFrom)} to {formatDate(person.stayTo)}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const StructureView = () => {
    const [buildings, setBuildings] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalData, setModalData] = useState({ isOpen: false, person: null });
    
    // STATES for filtering
    const [buildingSearch, setBuildingSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState(''); // 'Male', 'Female', or '' (All)

    useEffect(() => {
        const fetchStructureData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/structure'); 
                
                setBuildings(res.data.buildings || []);
                setPeople(res.data.people || []);
                setError(null);
            } catch (err) {
                setError('Failed to fetch structure data. Please ensure the API is running and accessible.');
                console.error("API Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStructureData();
    }, []);

    const occupancyMap = useMemo(() => {
        const map = new Map();
        
        // --- IST CONVERSION LOGIC (UTC + 5:30) ---
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        
        const selectedDayUTC = new Date(selectedDate + 'T00:00:00Z'); 

        const startOfISTDayUTC = new Date(selectedDayUTC.getTime() - IST_OFFSET_MS);
        const endOfISTDayUTC = new Date(startOfISTDayUTC.getTime() + 24 * 60 * 60 * 1000);

        people.forEach(person => {
            const stayFrom = new Date(person.stayFrom); 
            const stayTo = new Date(person.stayTo);     
            
            if (stayFrom < endOfISTDayUTC && stayTo >= startOfISTDayUTC) {
                map.set(person.bedId, person);
            }
        });
        return map;
    }, [people, selectedDate]);

    // Apply Filters to Buildings
    const filteredBuildings = useMemo(() => {
        return buildings.filter(building => {
            const matchesSearch = building.name.toLowerCase().includes(buildingSearch.toLowerCase());
            
            const buildingGenderLower = normalizeGender(building.gender);

            // 2. Gender filter: Filter by building gender directly
            if (genderFilter) {
                const filterLower = genderFilter.toLowerCase();
                
                if (filterLower === 'male' && (buildingGenderLower !== 'male' && buildingGenderLower !== 'mixed')) return false;
                
                if (filterLower === 'female' && (buildingGenderLower !== 'female' && buildingGenderLower !== 'mixed')) return false;
            }

            return matchesSearch;
        });
    }, [buildings, buildingSearch, genderFilter]);


    const summaryStats = useMemo(() => {
        const totalCapacity = buildings.reduce((bAcc, building) => 
            bAcc + building.rooms.reduce((rAcc, room) => rAcc + room.beds.length, 0), 0);
        
        const totalOccupancy = occupancyMap.size;
        return { totalCapacity, totalOccupancy, totalVacancy: totalCapacity - totalOccupancy };
    }, [buildings, occupancyMap]);

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-primary text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-heading text-primaryDark">Live Occupancy View</h2>
                {/* Date filter shifted slightly left */}
                <div className="flex items-center space-x-4 mt-4 md:mt-0 mr-4">
                    <label htmlFor="date-picker" className="font-semibold text-gray-700">Date (IST):</label>
                    <input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg shadow-sm" />
                </div>
            </div>

            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaBed className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalCapacity}</p>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                </div>
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaUserCheck className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalOccupancy}</p>
                    <p className="text-sm text-gray-500">Current Occupancy</p>
                </div>
                <div className="bg-card p-4 rounded-2xl shadow-soft text-center">
                    <FaUserMinus className="text-2xl text-accent mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalVacancy}</p>
                    <p className="text-sm text-gray-500">Current Vacancy</p>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-4 rounded-2xl shadow-soft">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search building name..."
                        value={buildingSearch}
                        onChange={(e) => setBuildingSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm"
                    />
                </div>
                <div className="flex-1 max-w-xs md:max-w-none">
                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-background rounded-lg focus:ring-primary focus:border-primary shadow-sm appearance-none bg-white pr-8"
                    >
                        <option value="">All Genders/Buildings</option>
                        <option value="Male">Male Buildings</option>
                        <option value="Female">Female Buildings</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
                {filteredBuildings.length > 0 ? filteredBuildings.map(building => {
                    const buildingCapacity = building.rooms.reduce((acc, room) => acc + room.beds.length, 0);
                    const buildingOccupancy = building.rooms.reduce((acc, room) => acc + room.beds.filter(bed => occupancyMap.has(bed._id)).length, 0);
                    
                    const buildingGender = building.gender;
                    const roomGenderLower = normalizeGender(buildingGender);
                    const roomGenderDisplay = buildingGender ? buildingGender.replace('-', ' ') : 'N/A';

                    const genderStats = building.rooms.reduce((stats, room) => {
                        const occupiedBeds = room.beds.filter(bed => occupancyMap.has(bed._id));
                        
                        stats.maleOccupants += occupiedBeds.filter(bed => {
                            const person = occupancyMap.get(bed._id);
                            return person && normalizeGender(person.gender) === 'male';
                        }).length;
                        stats.femaleOccupants += occupiedBeds.filter(bed => {
                            const person = occupancyMap.get(bed._id);
                            return person && normalizeGender(person.gender) === 'female';
                        }).length;
                        return stats;
                    }, { maleOccupants: 0, femaleOccupants: 0 });

                    // Determine which icons to display in the summary
                    const shouldShowMaleStats = roomGenderLower === 'male' || roomGenderLower === 'mixed';
                    const shouldShowFemaleStats = roomGenderLower === 'female' || roomGenderLower === 'mixed';

                    return (
                        <div key={building._id} className="bg-card p-4 rounded-2xl shadow-soft border-l-4 border-primary">
                            <div className="flex justify-between items-center mb-3 flex-wrap">
                                {/* Display building name and gender tag */}
                                <h3 className="text-xl font-bold font-heading text-primaryDark flex items-center mb-2">
                                    <FaBuilding className="mr-3 text-primary"/>
                                    {building.name}
                                    <span className={`ml-3 text-sm font-medium px-2 py-0.5 rounded-full capitalize 
                                        ${roomGenderLower === 'male' ? 'bg-blue-100 text-blue-800' : 
                                        roomGenderLower === 'female' ? 'bg-pink-100 text-pink-800' : 
                                        'bg-yellow-100 text-yellow-800'}`
                                    }>
                                        {roomGenderDisplay}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap space-x-4 text-sm font-semibold text-gray-600">
                                    <span>Occupancy: {buildingOccupancy} / {buildingCapacity}</span>
                                    {/* FIX: Conditional display for Male Stats */}
                                    {shouldShowMaleStats && (
                                        <span className="flex items-center text-blue-600"><FaMale className="mr-1"/> M: {genderStats.maleOccupants}</span>
                                    )}
                                    {/* FIX: Conditional display for Female Stats */}
                                    {shouldShowFemaleStats && (
                                        <span className="flex items-center text-pink-600"><FaFemale className="mr-1"/> F: {genderStats.femaleOccupants}</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {building.rooms.map(room => (
                                    <div key={room._id} className="pl-4 border-l-2 ml-2 border-background">
                                        {/* Simplified Room Heading */}
                                        <h4 className="font-semibold text-gray-600">
                                            Room {room.roomNumber} 
                                        </h4>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                                            {room.beds.map(bed => {
                                                const occupant = occupancyMap.get(bed._id);
                                                const isOccupied = !!occupant;
                                                const occupantGenderLower = normalizeGender(occupant?.gender);
                                                
                                                let bedStyle = 'border-green-300';
                                                let bgColor = 'bg-green-100'; // Vacant default
                                                let textColor = 'text-green-700';
                                                let genderIcon = null;

                                                // --- Filtering and Icon Display Logic ---
                                                if (isOccupied) {
                                                    bedStyle = 'border-red-300 cursor-pointer hover:bg-red-200 hover:shadow-md';

                                                    if (occupantGenderLower === 'male') {
                                                        bgColor = 'bg-blue-100';
                                                        textColor = 'text-blue-700';
                                                        // Only show Male icon if building is male or mixed
                                                        if (roomGenderLower === 'male' || roomGenderLower === 'mixed') {
                                                            genderIcon = <FaMale className="inline ml-1 mb-0.5" />;
                                                        }
                                                    } else if (occupantGenderLower === 'female') {
                                                        bgColor = 'bg-pink-100';
                                                        textColor = 'text-pink-700';
                                                        // Only show Female icon if building is female or mixed
                                                        if (roomGenderLower === 'female' || roomGenderLower === 'mixed') {
                                                            genderIcon = <FaFemale className="inline ml-1 mb-0.5" />;
                                                        }
                                                    } else {
                                                        bgColor = 'bg-gray-100';
                                                        textColor = 'text-gray-700';
                                                    }
                                                } else {
                                                    bedStyle = 'border-green-300';
                                                }
                                                
                                                // --- Filtering Logic (Final Check) ---
                                                if (genderFilter && isOccupied && occupantGenderLower !== genderFilter.toLowerCase()) {
                                                    return null;
                                                }
                                                if (genderFilter && !isOccupied && roomGenderLower !== genderFilter.toLowerCase() && roomGenderLower !== 'mixed') {
                                                    return null;
                                                }
                                                // ---------------------------------------

                                                const bedTitle = isOccupied 
                                                    ? `Occupied by: ${occupant.name} (${occupant.gender})` 
                                                    : `Available (${roomGenderDisplay})`;

                                                return (
                                                    <div 
                                                        key={bed._id}
                                                        title={bedTitle}
                                                        onClick={() => isOccupied && setModalData({ isOpen: true, person: occupant })}
                                                        className={`p-2 rounded-md text-center text-xs border transition-all duration-200 cursor-pointer ${bedStyle} ${bgColor}`}
                                                    >
                                                        <p className="font-bold text-gray-800 flex items-center justify-center">
                                                            {bed.name} {genderIcon} 
                                                        </p>
                                                        <p className={`truncate ${textColor}`}>
                                                            {isOccupied ? occupant.name : 'Available'}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center bg-card p-6 rounded-2xl shadow-soft text-gray-500">
                        No buildings match your current search and filter criteria.
                    </div>
                )}
            </div>

            <OccupantDetailsModal 
                isOpen={modalData.isOpen}
                person={modalData.person}
                onClose={() => setModalData({ isOpen: false, person: null })}
            />
        </motion.div>
    );
};

export default StructureView;