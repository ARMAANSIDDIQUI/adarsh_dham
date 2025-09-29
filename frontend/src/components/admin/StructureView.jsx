import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import { FaSpinner, FaBuilding, FaBed, FaUserCheck, FaUserMinus, FaTimes, FaHashtag, FaHome, FaCity, FaPhone, FaUserTag } from 'react-icons/fa';

// NEW: Modal component to display occupant details
const OccupantDetailsModal = ({ isOpen, person, onClose }) => {
    if (!isOpen || !person) return null;

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-md"
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                            <FaTimes size={20} />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-pink-600 mb-4 border-b pb-2">{person.name}</h3>
                        
                        <div className="space-y-3 text-gray-700">
                            <p className="flex items-center"><FaHashtag className="mr-3 text-gray-400"/>Booking No: <span className="font-semibold ml-2">{person.bookingNumber}</span></p>
                            <p className="flex items-center"><FaHome className="mr-3 text-gray-400"/>Ashram: <span className="font-semibold ml-2">{person.ashramName}</span></p>
                            <p className="flex items-center"><FaCity className="mr-3 text-gray-400"/>City: <span className="font-semibold ml-2">{person.city}</span></p>
                            <p className="flex items-center"><FaPhone className="mr-3 text-gray-400"/>Contact: <span className="font-semibold ml-2">{person.contactNumber}</span></p>
                            <p className="flex items-center"><FaUserTag className="mr-3 text-gray-400"/>Reference: <span className="font-semibold ml-2">{person.baijiMahatmaJi || 'N/A'}</span></p>
                            <p className="flex items-center"><FaUserCheck className="mr-3 text-gray-400"/>Booked By: <span className="font-semibold ml-2">{person.userId?.name}</span></p>
                            <p className="mt-4 pt-4 border-t text-sm text-center">Stay: {formatDate(person.stayFrom)} to {formatDate(person.stayTo)}</p>
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

    // NEW: State to manage the details modal
    const [modalData, setModalData] = useState({ isOpen: false, person: null });

    useEffect(() => {
        const fetchStructureData = async () => {
            try {
                setLoading(true);
                const res = await api.get('/structure');
                setBuildings(res.data.buildings || []);
                setPeople(res.data.people || []);
                setError(null);
            } catch (err) {
                setError('Failed to fetch structure data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStructureData();
    }, []);

    const occupancyMap = useMemo(() => {
        const map = new Map();
        const startOfDayUTC = new Date(selectedDate);
        const endOfDayUTC = new Date(startOfDayUTC);
        endOfDayUTC.setDate(endOfDayUTC.getDate() + 1);

        people.forEach(person => {
            const stayFrom = new Date(person.stayFrom);
            const stayTo = new Date(person.stayTo);
            if (stayFrom < endOfDayUTC && stayTo >= startOfDayUTC) {
                map.set(person.bedId, person);
            }
        });
        return map;
    }, [people, selectedDate]);

    const summaryStats = useMemo(() => {
        const totalCapacity = buildings.reduce((bAcc, building) => 
            bAcc + building.rooms.reduce((rAcc, room) => rAcc + room.beds.length, 0), 0);
        
        const totalOccupancy = occupancyMap.size;
        return { totalCapacity, totalOccupancy, totalVacancy: totalCapacity - totalOccupancy };
    }, [buildings, occupancyMap]);

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Live Occupancy View</h2>
                <div className="flex items-center space-x-2">
                    <label htmlFor="date-picker" className="font-semibold">Select Date:</label>
                    <input type="date" id="date-picker" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg shadow-sm" />
                </div>
            </div>

            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <FaBed className="text-2xl text-purple-500 mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalCapacity}</p>
                    <p className="text-sm text-gray-500">Total Capacity</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                    <FaUserCheck className="text-2xl text-emerald-500 mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalOccupancy}</p>
                    <p className="text-sm text-gray-500">Current Occupancy</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow text-center">
                    <FaUserMinus className="text-2xl text-rose-500 mx-auto mb-2"/>
                    <p className="text-3xl font-bold">{summaryStats.totalVacancy}</p>
                    <p className="text-sm text-gray-500">Current Vacancy</p>
                </div>
            </div>

            <div className="space-y-6">
                {buildings.map(building => {
                    const buildingCapacity = building.rooms.reduce((acc, room) => acc + room.beds.length, 0);
                    const buildingOccupancy = building.rooms.reduce((acc, room) => acc + room.beds.filter(bed => occupancyMap.has(bed._id)).length, 0);

                    return (
                        <div key={building._id} className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-blue-500">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold text-gray-700 flex items-center"><FaBuilding className="mr-3 text-blue-500"/>{building.name}</h3>
                                <span className="font-semibold text-gray-600">Occupancy: {buildingOccupancy} / {buildingCapacity}</span>
                            </div>
                            <div className="space-y-4">
                                {building.rooms.map(room => (
                                    <div key={room._id} className="pl-4 border-l-2 ml-2">
                                        <h4 className="font-semibold text-gray-600">Room {room.roomNumber}</h4>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                                            {room.beds.map(bed => {
                                                const occupant = occupancyMap.get(bed._id);
                                                const isOccupied = !!occupant;
                                                return (
                                                    <div 
                                                         key={bed._id}
                                                         title={isOccupied ? `Occupied by: ${occupant.name}` : `Available`}
                                                         // NEW: onClick handler and conditional styling
                                                         onClick={() => isOccupied && setModalData({ isOpen: true, person: occupant })}
                                                         className={`p-2 rounded-md text-center text-xs border transition-all duration-200 ${
                                                            isOccupied 
                                                            ? 'bg-pink-100 border-pink-300 cursor-pointer hover:bg-pink-200 hover:shadow-md' 
                                                            : 'bg-green-100 border-green-300'
                                                         }`}
                                                    >
                                                        <p className="font-bold text-gray-800">{bed.name}</p>
                                                        <p className={`truncate ${isOccupied ? 'text-pink-700' : 'text-green-700'}`}>
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
                })}
            </div>

            {/* NEW: Render the modal component */}
            <OccupantDetailsModal 
                isOpen={modalData.isOpen}
                person={modalData.person}
                onClose={() => setModalData({ isOpen: false, person: null })}
            />
        </motion.div>
    );
};

export default StructureView;