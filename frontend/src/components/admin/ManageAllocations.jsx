import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaCheck, FaTimes, FaSpinner, FaEdit, FaUserShield, FaFilter, FaFilePdf, FaInfoCircle, FaChevronDown } from 'react-icons/fa';

// --- Helper Functions ---
const datesOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    return (new Date(startA) <= new Date(endB)) && (new Date(endA) >= new Date(startB));
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return 'Invalid Date'; }
};

const datesRoughlyMatch = (stayFrom, stayTo, filterFrom, filterTo) => {
    if (!filterFrom && !filterTo) return true;
    if (!stayFrom || !stayTo) return false;
    const from = new Date(stayFrom);
    const to = new Date(stayTo);
    const filterStart = filterFrom ? new Date(filterFrom) : null;
    const filterEnd = filterTo ? new Date(filterTo) : null;
    if (filterStart && to < filterStart) return false;
    if (filterEnd && from > filterEnd) return false;
    return true;
};

// --- Modal for Room Occupants ---
const RoomOccupantsModal = ({ isOpen, room, occupants, onClose }) => {
    if (!isOpen || !room) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1001] p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Occupants in Room {room.roomNumber}</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {occupants.length > 0 ? (
                                occupants.map(person => (
                                    <div key={person._id} className="bg-gray-100 p-3 rounded-lg text-sm border-l-4 border-pink-400">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{person.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{person.gender}, Age: {person.age}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-xs text-pink-600">{person.bookingNumber}</p>
                                                <p className="text-xs text-gray-500">Bed: {person.bedId?.name}</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                                            <p><strong>Booked By:</strong> {person.userId?.name}</p>
                                            <p><strong>Event:</strong> {person.eventId?.name}</p>
                                            <p><strong>Stay:</strong> {formatDate(person.stayFrom)} to {formatDate(person.stayTo)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : ( <p className="text-gray-500">This room is vacant for the selected dates.</p> )}
                        </div>
                        <div className="text-right mt-4">
                            <Button onClick={onClose} className="bg-gray-500 text-white">Close</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- Accordion for Details ---
const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-t">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left py-2 px-1 flex justify-between items-center text-gray-600 hover:text-gray-900">
                <h6 className="font-bold">{title}</h6>
                <FaChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="pb-2 px-1 text-gray-700">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- BookingCard Sub-component ---
const BookingCard = ({ booking, onAction, allocations, handleAllocationChange, buildings, rooms, people, onShowRoomDetails, setError }) => {
    const { formData = {}, userId = {}, status, _id: bookingId, bookingNumber, allocations: savedAllocations = [] } = booking;
    const pendingAllocations = allocations[bookingId] || [];

    const allBedsAssigned = (formData.people?.length || 0) > 0 &&
        formData.people.length === pendingAllocations.length &&
        pendingAllocations.every(a => a && a.bedId);

    const getStatusBorderColor = s => s === 'pending' ? 'border-pink-500' : s === 'approved' ? 'border-emerald-500' : 'border-rose-500';
    
    const getRoomOccupancyForBooking = (roomId, currentBooking) => {
        const room = (rooms || []).find(r => String(r._id) === String(roomId));
        if (!room) return { capacity: 0, occupied: 0, vacant: 0 };
    
        const capacity = room.beds.length;
        const occupiedCount = (people || []).filter(person => {
            if (String(person.bookingId) === String(currentBooking._id)) return false;
            const bedInRoom = room.beds.some(bed => String(bed._id) === String(person.bedId?._id || person.bedId));
            return bedInRoom && datesOverlap(currentBooking.formData.stayFrom, currentBooking.formData.stayTo, person.stayFrom, person.stayTo);
        }).length;
    
        return { capacity, occupied: occupiedCount, vacant: capacity - occupiedCount };
    };

    const getAvailableBedsForRoom = (roomId, currentBooking, currentPersonIndex) => {
        const room = (rooms || []).find(r => String(r._id) === String(roomId));
        if (!room || !Array.isArray(room.beds)) return [];
    
        const bookingStart = new Date(currentBooking.formData.stayFrom);
        const bookingEnd = new Date(currentBooking.formData.stayTo);
    
        const globallyOccupiedBedIds = new Set(
            (people || [])
                .filter(p => String(p.bookingId) !== String(currentBooking._id) && datesOverlap(bookingStart, bookingEnd, p.stayFrom, p.stayTo))
                .map(p => String(p.bedId?._id || p.bedId))
        );
    
        const tentativelyOccupiedBedIds = new Set(
            (pendingAllocations || [])
                .filter((alloc, index) => index !== currentPersonIndex && alloc.bedId)
                .map(alloc => String(alloc.bedId))
        );
    
        return room.beds.filter(bed => 
            bed?._id && 
            !globallyOccupiedBedIds.has(String(bed._id)) &&
            !tentativelyOccupiedBedIds.has(String(bed._id))
        );
    };

    const getFilteredBuildings = (person) => {
        const allowedGenders = { 'male': ['male', 'unisex'], 'female': ['female', 'unisex'] };
        const personAllowed = allowedGenders[person.gender?.toLowerCase()] || ['male', 'female', 'unisex'];
        return (buildings || []).filter(b => personAllowed.includes((b.gender || '').toLowerCase()));
    };

    const findAllocationNames = (allocation) => {
        if (!allocation) return { buildingName: 'N/A', roomNumber: 'N/A', bedName: 'N/A' };
        const building = (buildings || []).find(b => String(b._id) === String(allocation.buildingId));
        const room = (rooms || []).find(r => String(r._id) === String(allocation.roomId));
        const bed = (room?.beds || []).find(b => String(b._id) === String(allocation.bedId));
        return {
            buildingName: building?.name || 'N/A',
            roomNumber: room?.roomNumber || 'N/A',
            bedName: bed?.name || 'N/A',
        };
    };
    
    const handleDownloadPdf = async () => {
        try {
            const response = await api.get(`/bookings/pdf/${bookingId}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Booking-Pass-${bookingNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            setError('Failed to download PDF.');
        }
    };

    return (
        <div className={`bg-white p-5 rounded-xl shadow-lg border-l-4 ${getStatusBorderColor(status)}`}>
            <div className="flex justify-between items-start border-b pb-3 mb-4">
                <div>
                    <h4 className="text-xl font-bold text-gray-800">{userId?.name || 'Unknown'}</h4>
                    <p className="text-xs font-mono text-gray-500 mt-1">{bookingNumber}</p>
                </div>
                <span className="text-sm font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full">{status}</span>
            </div>

            <div className="space-y-2 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                    <p><strong>Stay:</strong> {formatDate(formData?.stayFrom)} to {formatDate(formData?.stayTo)}</p>
                    <p><strong>Group:</strong> {formData?.people?.length || 0} People</p>
                </div>
                
                <AccordionItem title="Members">
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                        {(formData.people || []).map((p, i) => <div key={i} className="text-xs flex justify-between"><span>{i+1}. {p.name}</span><span>Age: {p.age}</span></div>)}
                    </div>
                </AccordionItem>

                <AccordionItem title="Contact & Location">
                    <p><strong>Phone:</strong> {formData?.contactNumber || 'N/A'}</p>
                    <p><strong>Email:</strong> {formData?.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {formData?.address || 'N/A'}, {formData?.city || 'N/A'}</p>
                </AccordionItem>

                <AccordionItem title="Reference Details">
                    <p><strong>Ashram:</strong> {formData?.ashramName || 'N/A'}</p>
                    <p><strong>Baiji/Mahatmaji:</strong> {formData?.baijiMahatmaJi || 'N/A'}</p>
                    <p><strong>Baiji/Mahatmaji Contact:</strong> {formData?.baijiContact || 'N/A'}</p>
                </AccordionItem>
                
                {formData?.notes && (
                    <AccordionItem title="Notes">
                        <p className="text-gray-700 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">{formData.notes}</p>
                    </AccordionItem>
                )}
            </div>

            {status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="font-bold mb-3 text-pink-600 flex items-center"><FaEdit className="mr-2"/> Allocate ({formData.people?.length || 0} People)</h5>
                    <div className="space-y-4">
                        {(formData?.people || []).map((person, index) => {
                            const personAllocated = pendingAllocations[index] || {};
                            const filteredBuildings = getFilteredBuildings(person);
                            const filteredRooms = personAllocated.buildingId ? (rooms || []).filter(r => String(r.buildingId?._id) === String(personAllocated.buildingId)) : [];
                            const filteredBeds = personAllocated.roomId ? getAvailableBedsForRoom(personAllocated.roomId, booking, index) : [];

                            return (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                                    <p className="font-semibold text-gray-700 mb-2">{person.name} <span className="text-xs text-pink-500 capitalize">({person.gender})</span></p>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                                        <select value={personAllocated.buildingId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'buildingId', e.target.value)} className="block w-full text-sm p-2 border rounded-lg">
                                            <option value="">Select Building</option>
                                            {filteredBuildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                        <div className="flex items-center space-x-2">
                                            <select value={personAllocated.roomId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'roomId', e.target.value)} disabled={!personAllocated.buildingId} className="block w-full text-sm p-2 border rounded-lg disabled:bg-gray-200">
                                                <option value="">Select Room</option>
                                                {filteredRooms.map(r => {
                                                    const { vacant, capacity } = getRoomOccupancyForBooking(r._id, booking);
                                                    return <option key={r._id} value={r._id}>{r.roomNumber} ({vacant}/{capacity} vacant)</option>;
                                                })}
                                            </select>
                                            {personAllocated.roomId && (
                                                <button onClick={() => onShowRoomDetails(personAllocated.roomId, booking)} className="text-blue-500 hover:text-blue-700 p-1" title="Show room occupants">
                                                    <FaInfoCircle/>
                                                </button>
                                            )}
                                        </div>
                                        <select value={personAllocated.bedId || ''} onChange={(e) => handleAllocationChange(bookingId, index, 'bedId', e.target.value)} disabled={!personAllocated.roomId} className="block w-full text-sm p-2 border rounded-lg disabled:bg-gray-200">
                                            <option value="">Select Bed</option>
                                            {filteredBeds.map(bed => <option key={bed._id} value={bed._id}>{`${bed.name} (${bed.type})`}</option>)}
                                        </select>
                                    </div>
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                        <Button onClick={() => onAction(bookingId, 'pending')} className="bg-pink-500 hover:bg-pink-600"><FaEdit className="inline mr-2" /> Edit Allocation</Button>
                        <Button onClick={handleDownloadPdf} className="bg-blue-500 hover:bg-blue-600"><FaFilePdf className="inline mr-2" /> Download Pass</Button>
                    </div>
                </div>
            )}

            {status === 'declined' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 italic mb-4">This booking was declined. You can reconsider it.</div>
                    <Button onClick={() => onAction(bookingId, 'pending')} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg"><FaEdit className="inline mr-2" /> Reconsider</Button>
                </div>
            )}
        </div>
    );
};

// --- BookingSection Wrapper ---
const BookingSection = ({ title, color = 'pink', bookings, ...props }) => {
    const colorMap = {
        pink: { border: 'border-pink-500', text: 'text-pink-700' },
        emerald: { border: 'border-emerald-500', text: 'text-emerald-700' },
        rose: { border: 'border-rose-500', text: 'text-rose-700' },
    };
    const classes = colorMap[color] || colorMap.pink;

    return (
        <div className="space-y-4">
            <h3 className={`text-2xl font-semibold mb-4 pb-2 border-b-4 ${classes.border} ${classes.text}`}>
                {title} ({bookings.length})
            </h3>
            {bookings.length === 0 ? (
                <p className="text-gray-600 italic">No {title.toLowerCase()} bookings.</p>
            ) : (
                bookings.map((booking) => <BookingCard key={booking._id} booking={booking} {...props} />)
            )}
        </div>
    );
};

// --- Main ManageAllocations Component ---
const ManageAllocations = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allocations, setAllocations] = useState({});
    const [roomDetailsModal, setRoomDetailsModal] = useState({ isOpen: false, room: null, occupants: [] });
    const [filters, setFilters] = useState({ userName: '', email: '', phone: '', memberName: '', event: '', bookingDate: '', stayFrom: '', stayTo: '' });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, roomsRes, buildingsRes, peopleRes] = await Promise.all([
                api.get('/bookings'), api.get('/rooms'), api.get('/buildings'), api.get('/people'),
            ]);
            setBookings(bookingsRes.data || []);
            setRooms(roomsRes.data || []);
            setBuildings(buildingsRes.data || []);
            setPeople(peopleRes.data || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleAction = async (bookingId, action, allocationData = null) => {
        try {
            let payload = { status: action };
            if (action === 'approved') payload.allocations = allocationData;
            await api.post(`/bookings/approve-decline/${bookingId}`, payload);
            setAllocations(prev => {
                const newAlloc = { ...prev };
                delete newAlloc[bookingId];
                return newAlloc;
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
    
    const handleShowRoomDetails = (roomId, currentBooking) => {
        const room = rooms.find(r => String(r._id) === String(roomId));
        if (!room) return;
    
        const occupants = (people || []).filter(person => {
            if (!person.bedId) return false;
            const bedInRoom = room.beds.some(bed => String(bed._id) === String(person.bedId?._id || person.bedId));
            return bedInRoom && datesOverlap(currentBooking.formData.stayFrom, currentBooking.formData.stayTo, person.stayFrom, person.stayTo);
        });
    
        setRoomDetailsModal({ isOpen: true, room, occupants });
    };

    const filteredBookings = useMemo(() => (bookings || []).filter(b => {
        const { userName, email, phone, memberName, event, bookingDate, stayFrom, stayTo } = filters;
        if (userName && !String(b.userId?.name || '').toLowerCase().includes(userName.toLowerCase())) return false;
        if (email && !String(b.formData?.email || '').toLowerCase().includes(email.toLowerCase())) return false;
        if (phone && !String(b.formData?.contactNumber || '').includes(phone)) return false;
        if (event && !String(b.eventId?.name || '').toLowerCase().includes(event.toLowerCase())) return false;
        if (memberName) {
            if (!(b.formData?.people || []).some(p => String(p?.name || '').toLowerCase().includes(memberName.toLowerCase()))) return false;
        }
        if (bookingDate) {
            const bookingCreated = b.createdAt ? new Date(b.createdAt).toISOString().slice(0,10) : null;
            if (bookingCreated !== bookingDate) return false;
        }
        if (!datesRoughlyMatch(b.formData?.stayFrom, b.formData?.stayTo, stayFrom, stayTo)) return false;
        return true;
    }), [bookings, filters]);
    
    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    const pendingBookings = filteredBookings.filter(b => b.status === 'pending');
    const approvedBookings = filteredBookings.filter(b => b.status === 'approved');
    const declinedBookings = filteredBookings.filter(b => b.status === 'declined');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-pink-500 pb-2 inline-block">
                <FaUserShield className="inline mr-3 text-pink-500" /> Manage Allocations
            </h2>

            <div className="bg-white shadow-md rounded-xl p-5 mb-8 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-700"><FaFilter className="mr-2 text-pink-500" /> Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <input type="text" placeholder="User Name" value={filters.userName} onChange={(e) => setFilters({ ...filters, userName: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Phone" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Member Name" value={filters.memberName} onChange={(e) => setFilters({ ...filters, memberName: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Event" value={filters.event} onChange={(e) => setFilters({ ...filters, event: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <div>
                        <label className="text-xs text-gray-500">Date of Booking</label>
                        <input type="date" value={filters.bookingDate} onChange={(e) => setFilters({ ...filters, bookingDate: e.target.value })} className="p-2 border rounded-lg w-full" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Stay From</label>
                        <input type="date" value={filters.stayFrom} onChange={(e) => setFilters({ ...filters, stayFrom: e.target.value })} className="p-2 border rounded-lg w-full" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">Stay To</label>
                        <input type="date" value={filters.stayTo} onChange={(e) => setFilters({ ...filters, stayTo: e.target.value })} className="p-2 border rounded-lg w-full" />
                    </div>
                </div>
                <div className="mt-4 flex space-x-3">
                    <Button onClick={() => setFilters({ userName: '', email: '', phone: '', memberName: '', event: '', bookingDate: '', stayFrom: '', stayTo: '' })} className="bg-gray-500 text-white">Clear Filters</Button>
                </div>
            </div>

            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <BookingSection title="Pending" color="pink" bookings={pendingBookings} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} />
                <BookingSection title="Approved" color="emerald" bookings={approvedBookings} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} />
                <BookingSection title="Declined" color="rose" bookings={declinedBookings} onAction={handleAction} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} />
            </div>

            <RoomOccupantsModal 
                isOpen={roomDetailsModal.isOpen}
                room={roomDetailsModal.room}
                occupants={roomDetailsModal.occupants}
                onClose={() => setRoomDetailsModal({ isOpen: false, room: null, occupants: [] })}
            />
        </motion.div>
    );
};

export default ManageAllocations;