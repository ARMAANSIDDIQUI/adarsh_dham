import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../../components/common/Button';
import { 
    FaCheck, FaTimes, FaSpinner, FaEdit, FaUserShield, FaCalendarAlt, 
    FaUsers, FaUniversity, FaPhone, FaMapMarkerAlt, FaEnvelope, FaUser
} from 'react-icons/fa';

const ManageAllocations = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState({});

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, roomsRes, buildingsRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/rooms'),
                api.get('/buildings')
            ]);
            setBookings(bookingsRes.data || []);
            setRooms(roomsRes.data || []);
            setBuildings(buildingsRes.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAction = async (bookingId, action, allocationData = null) => {
        try {
            let payload = { status: action };
            if (action === 'approved') {
                payload.allocations = allocationData;
            }
            await api.post(`/bookings/approve-decline/${bookingId}`, payload);
            setAllocations(prev => {
                const newAllocations = { ...prev };
                delete newAllocations[bookingId];
                return newAllocations;
            });
            await fetchAllData();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to perform action: ${action}.`);
        }
    };

    const handleAllocationChange = (bookingId, personIndex, type, value) => {
        setAllocations(prev => {
            const bookingToUpdate = bookings.find(b => b._id === bookingId);
            const peopleCount = bookingToUpdate?.formData?.people?.length || 0;
            const newAllocationsForBooking = prev[bookingId] ? [...prev[bookingId]] : Array(peopleCount).fill({});
            newAllocationsForBooking[personIndex] = { ...newAllocationsForBooking[personIndex], [type]: value };
            if (type === 'buildingId') {
                newAllocationsForBooking[personIndex].roomId = '';
                newAllocationsForBooking[personIndex].bedId = '';
            }
            if (type === 'roomId') {
                newAllocationsForBooking[personIndex].bedId = '';
            }
            return { ...prev, [bookingId]: newAllocationsForBooking };
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved');
    const declinedBookings = bookings.filter(b => b.status === 'declined');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-pink-500 pb-2 inline-block">
                <FaUserShield className="inline mr-3 text-pink-500"/> Manage Allocations
            </h2>
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6 font-medium border border-red-300">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-4 border-pink-500 text-pink-700">Pending ({pendingBookings.length})</h3>
                    {pendingBookings.length === 0 ? <p className="text-gray-600 italic">No pending bookings.</p> : (
                        pendingBookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} />
                        ))
                    )}
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-4 border-emerald-500 text-emerald-700">Approved ({approvedBookings.length})</h3>
                    {approvedBookings.length === 0 ? <p className="text-gray-600 italic">No approved bookings.</p> : (
                        approvedBookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} />
                        ))
                    )}
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold mb-4 pb-2 border-b-4 border-rose-500 text-rose-700">Declined ({declinedBookings.length})</h3>
                    {declinedBookings.length === 0 ? <p className="text-gray-600 italic">No declined bookings.</p> : (
                        declinedBookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} />
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const BookingCard = ({ booking, onAction, allocations, handleAllocationChange, buildings, rooms }) => {
    const { formData, userId, status, _id: bookingId, bookingNumber, allocations: savedAllocations } = booking;
    const pendingAllocations = allocations[bookingId] || [];
    
    const allBedsAssigned = (formData.people?.length || 0) > 0 && formData.people.length === pendingAllocations.length && pendingAllocations.every(a => a && a.bedId);

    const getStatusBorderColor = (s) => {
        if (s === 'pending') return 'border-pink-500';
        if (s === 'approved') return 'border-emerald-500';
        if (s === 'declined') return 'border-rose-500';
        return 'border-gray-300';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const getFilteredBuildings = (person) => {
        const allowedBuildingGenders = {
            'male': ['male', 'unisex'],
            'female': ['female', 'unisex'],
            'boy': ['male', 'unisex'],
            'girl': ['female', 'unisex'],
        };
        const personAllowedGenders = allowedBuildingGenders[person.gender] || [];
        return (buildings || []).filter(b => personAllowedGenders.includes(b.gender));
    };
    
    const getAvailableRoomsForBuilding = (buildingId) => (rooms || []).filter(room => room.buildingId?._id === buildingId && room.beds.reduce((sum, bed) => sum + bed.occupancy, 0) < room.capacity);
    const getAvailableBedsForRoom = (roomId) => {
        const room = (rooms || []).find(r => r._id === roomId);
        return room ? room.beds.filter(bed => bed.occupancy < (bed.type === 'double' ? 2 : 1)) : [];
    };

    const getRoomCapacityInfo = (roomId) => {
        const room = (rooms || []).find(r => r._id === roomId);
        if (!room) return null;
        const occupied = room.beds.reduce((sum, bed) => sum + bed.occupancy, 0);
        return { capacity: room.capacity, occupied, vacant: room.capacity - occupied };
    };
    
    const findAllocationNames = (allocation) => {
        const building = (buildings || []).find(b => b._id === (allocation.buildingId?._id || allocation.buildingId));
        const room = (rooms || []).find(r => r._id === (allocation.roomId?._id || allocation.roomId));
        const bed = room?.beds.find(b => b._id === (allocation.bedId?._id || allocation.bedId));
        return {
            buildingName: building?.name || 'N/A',
            roomNumber: room?.roomNumber || 'N/A',
            bedName: bed?.name || 'N/A'
        };
    };

    return (
        <div className={`bg-white p-5 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-l-4 ${getStatusBorderColor(status)}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-4">
                <div>
                    <h4 className="text-xl font-bold text-gray-800">{userId?.name || 'Unknown User'}</h4>
                    {/* This is where the Unique Booking ID is displayed */}
                    <p className="text-xs font-mono text-gray-500 mt-1">{bookingNumber}</p> 
                </div>
                <span className="text-sm font-semibold text-pink-600 bg-pink-100 px-3 py-1 rounded-full capitalize mt-2 sm:mt-0">{status}</span>
            </div>
            
            <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <p><strong>Stay:</strong> {formatDate(formData?.stayFrom)} to {formatDate(formData?.stayTo)}</p>
                    <p><strong>Group:</strong> {formData?.people?.length || 0} People</p>
                    <p><strong>Ashram:</strong> {formData?.ashramName || 'N/A'}</p>
                    <p><strong>For Others:</strong> {formData?.fillingForOthers ? 'Yes' : 'No'}</p>
                </div>

                <div className="border-t pt-3">
                    <h6 className="font-bold text-gray-500 mb-1">Contact & Location</h6>
                    <p><strong>Phone:</strong> {formData?.contactNumber || 'N/A'}</p>
                    <p><strong>Email:</strong> {formData?.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {formData?.address || 'N/A'}, {formData?.city || 'N/A'}</p>
                </div>

                <div className="border-t pt-3">
                    <h6 className="font-bold text-gray-500 mb-1">Reference Details</h6>
                    <p><strong>Baiji/Mahatmaji:</strong> {formData?.baijiMahatmaJi || 'N/A'}</p>
                    <p><strong>Baiji/Mahatmaji Contact:</strong> {formData?.baijiContact || 'N/A'}</p>
                </div>

                {(formData?.people?.length || 0) > 0 && (
                    <div className="border-t pt-3">
                        <h6 className="font-bold text-gray-500 mb-2">Members</h6>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                            {formData.people.map((p, i) => <div key={i} className="text-xs flex justify-between"><span>{p.name}</span><span>Age: {p.age}</span></div>)}
                        </div>
                    </div>
                )}
                
                {formData?.notes && (
                     <div className="border-t pt-3">
                        <h6 className="font-bold text-gray-500 mb-1">Notes</h6>
                        <p className="text-gray-700 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{formData.notes}</p>
                    </div>
                )}
            </div>

            {status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-bold mb-3 text-pink-600 flex items-center"><FaEdit className="mr-2"/> Allocate ({formData.people?.length || 0} People)</h5>
                    <div className="space-y-4">
                        {(formData?.people || []).map((person, index) => {
                            const personAllocated = pendingAllocations[index] || {};
                            const filteredBuildings = getFilteredBuildings(person);
                            const filteredRooms = personAllocated.buildingId ? getAvailableRoomsForBuilding(personAllocated.buildingId) : [];
                            const filteredBeds = personAllocated.roomId ? getAvailableBedsForRoom(personAllocated.roomId) : [];
                            const roomInfo = personAllocated.roomId ? getRoomCapacityInfo(personAllocated.roomId) : null;
                            
                            return (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                    <p className="font-semibold text-gray-700 mb-2">{person.name} <span className="text-xs text-pink-500 capitalize">({person.gender})</span></p>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                                        <select value={personAllocated.buildingId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'buildingId', e.target.value)} className="block w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors">
                                            <option value="">Select Building</option>
                                            {filteredBuildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                        <select value={personAllocated.roomId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'roomId', e.target.value)} disabled={!personAllocated.buildingId || filteredRooms.length === 0} className="block w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors disabled:bg-gray-200">
                                            <option value="">Select Room</option>
                                            {filteredRooms.map(r => <option key={r._id} value={r._id}>{r.roomNumber}</option>)}
                                        </select>
                                        <select value={personAllocated.bedId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'bedId', e.target.value)} disabled={!personAllocated.roomId || filteredBeds.length === 0} className="block w-full text-sm p-2 border border-gray-300 rounded-lg focus:ring-pink-300 focus:border-pink-300 transition-colors disabled:bg-gray-200">
                                            <option value="">Select Bed</option>
                                            {filteredBeds.map(bed => <option key={bed._id} value={bed._id}>{`${bed.name} (${bed.type})`}</option>)}
                                        </select>
                                    </div>
                                    {roomInfo && <div className="text-xs text-gray-500 text-right py-2 pr-1">Vacant: <span className="font-bold text-emerald-600">{roomInfo.vacant}</span> / {roomInfo.capacity}</div>}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t">
                        <Button onClick={() => onAction(bookingId, 'approved', pendingAllocations)} disabled={!allBedsAssigned} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg disabled:bg-gray-400"><FaCheck className="inline mr-2" /> Approve</Button>
                        <Button onClick={() => onAction(bookingId, 'declined')} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg"><FaTimes className="inline mr-2" /> Decline</Button>
                    </div>
                </div>
            )}
            
            {status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-bold mb-3 text-emerald-600 flex items-center"><FaUserShield className="mr-2"/> Allocated Details</h5>
                    <div className="space-y-3">
                        {(savedAllocations || []).map((alloc, index) => {
                            const { buildingName, roomNumber, bedName } = findAllocationNames(alloc);
                            return (
                                <div key={index} className="text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                    <span className="font-semibold text-gray-800 mr-2">{formData.people[index]?.name}:</span>
                                    <span className="text-gray-600 block sm:inline">{buildingName}, Room {roomNumber}, Bed {bedName}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4"><Button onClick={() => onAction(bookingId, 'pending')} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg"><FaEdit className="inline mr-2" /> Edit Allocation</Button></div>
                </div>
            )}
            
            {status === 'declined' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 italic mb-4">This booking was declined. You can reconsider and reopen it.</div>
                    <Button onClick={() => onAction(bookingId, 'pending')} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg"><FaEdit className="inline mr-2" /> Reconsider</Button>
                </div>
            )}
        </div>
    );
};

export default ManageAllocations;