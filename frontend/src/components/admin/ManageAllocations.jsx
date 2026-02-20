import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import DynamicDateInput from '../common/DynamicDateInput.jsx';
import Button from '../common/Button.jsx';
import { FaCheck, FaTimes, FaSpinner, FaEdit, FaUserShield, FaFilter, FaFilePdf, FaInfoCircle, FaChevronDown, FaSearch, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import EditBookingModal from './EditBookingModal.jsx';

const datesOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    try {
        const aStart = new Date(startA);
        const aEnd = new Date(endA);
        const bStart = new Date(startB);
        const bEnd = new Date(endB);
        if (isNaN(aStart) || isNaN(aEnd) || isNaN(bStart) || isNaN(bEnd)) return false;
        return (aStart < bEnd) && (aEnd > bStart);
    } catch {
        return false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const d = new Date(dateString);
        if (isNaN(d)) return 'Invalid Date';
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
};

const datesRoughlyMatch = (stayFrom, stayTo, filterFrom, filterTo) => {
    if (!filterFrom && !filterTo) return true;
    if (!stayFrom || !stayTo) return false;
    try {
        const bStart = new Date(stayFrom);
        const bEnd = new Date(stayTo);
        // Normalize booking dates to midnight
        bStart.setHours(0, 0, 0, 0);
        bEnd.setHours(0, 0, 0, 0);

        if (filterFrom) {
            const fStart = new Date(filterFrom);
            fStart.setHours(0, 0, 0, 0);
            // Filter "From" means booking must start on or after this date
            if (bStart < fStart) return false;
        }

        if (filterTo) {
            const fEnd = new Date(filterTo);
            fEnd.setHours(0, 0, 0, 0);
            // Filter "To" means booking must end on or before this date
            if (bEnd > fEnd) return false;
        }

        return true;
    } catch {
        return false;
    }
};

const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Effect to handle clicks outside of the component to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Effect to programmatically focus the search input when the dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) {
            return options;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return options.filter(option =>
            (option.label || '').toLowerCase().includes(lowercasedTerm)
        );
    }, [options, searchTerm]);

    const selectedOption = options.find(option => option.value === value);

    const handleOptionClick = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors duration-200 ${disabled ? 'bg-gray-200 text-gray-400' : 'bg-white hover:border-primary'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FaChevronDown className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden searchable-select-dropdown"
                    >
                        <div className="relative p-2 border-b">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-2 py-1 text-sm border-none focus:ring-0"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <ul className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        onClick={() => handleOptionClick(option.value)}
                                        className="p-2 text-sm cursor-pointer hover:bg-gray-100 rounded-md"
                                    >
                                        {option.label}
                                    </li>
                                ))
                            ) : (
                                <li className="p-2 text-sm text-gray-500 italic">No options found.</li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RoomOccupantsModal = ({ isOpen, room, occupants, onClose }) => {
    if (!isOpen || !room) return null;
    const safeOccupants = Array.isArray(occupants) ? occupants : [];
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1001] p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-card p-6 rounded-2xl shadow-soft w-full max-w-md">
                        <h3 className="text-xl font-bold font-heading text-primaryDark mb-4">Occupants in Room {room.roomNumber || room.roomId || '—'}</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {safeOccupants.length > 0 ? (
                                safeOccupants.map((person) => {
                                    if (!person) return null;
                                    return (
                                        <div key={person._id || person.bookingNumber || Math.random()} className="bg-background p-3 rounded-lg text-sm border-l-4 border-primary">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-900">{person.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{person.gender || 'N/A'}, Age: {person.age ?? 'N/A'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono text-xs text-pink-600">{person.bookingNumber || '-'}</p>
                                                    <p className="text-xs text-gray-500">Bed: {person.bedId?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                                                <p><strong>Booked By:</strong> {person.userId?.name || 'N/A'}</p>
                                                <p><strong>Event:</strong> {person.eventId?.name || 'N/A'}</p>
                                                <p><strong>Stay:</strong> {formatDate(person.stayFrom)} to {formatDate(person.stayTo)}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (<p className="text-gray-500">This room is vacant for the selected dates.</p>)}
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
const BookingCard = ({ booking, onAction, onEdit, allocations, handleAllocationChange, buildings, rooms, people, onShowRoomDetails, setError, readOnly = false }) => {
    const { formData = {}, userId = {}, status, _id: bookingId, bookingNumber, allocations: savedAllocations, eventId = {} } = booking || {};
    const pendingAllocations = allocations?.[bookingId] || [];
    const safeSavedAllocations = Array.isArray(savedAllocations) ? savedAllocations : [];
    const [notificationOption, setNotificationOption] = useState('dontSend');
    const [scheduleDelay, setScheduleDelay] = useState({ days: 0, hours: 0, minutes: 5, seconds: 0 });
    const [notificationTtlMinutes, setNotificationTtlMinutes] = useState(10080);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllocationDetails, setShowAllocationDetails] = useState(booking?.showAllocationDetails ?? false);

    const calculateFutureDate = useMemo(() => {
        const now = new Date();
        now.setDate(now.getDate() + (parseInt(scheduleDelay.days, 10) || 0));
        now.setHours(now.getHours() + (parseInt(scheduleDelay.hours, 10) || 0));
        now.setMinutes(now.getMinutes() + (parseInt(scheduleDelay.minutes, 10) || 0));
        now.setSeconds(now.getSeconds() + (parseInt(scheduleDelay.seconds, 10) || 0));
        return now;
    }, [scheduleDelay]);

    const handleDelayChange = (unit, value) => {
        setScheduleDelay(prev => ({ ...prev, [unit]: value }));
    };

    // Helper to check if person is a young child
    const isYoungChild = (person) => {
        return (person?.gender === 'boy' || person?.gender === 'girl') &&
            parseInt(person?.age) <= 2;
    };

    const allBedsAssigned = (formData.people?.length || 0) > 0 &&
        formData.people.length === (pendingAllocations.length || 0) &&
        pendingAllocations.every((a, index) => {
            const person = formData.people[index];
            // Young children don't require bed allocation
            if (isYoungChild(person)) return true;
            return a && a.bedId;
        });

    const handleDecision = (action) => {
        setError('');
        let payload = { status: action, allocations: pendingAllocations };
        if (notificationOption === 'schedule') {
            payload.notificationOption = 'schedule';
            payload.scheduledSendTime = calculateFutureDate.toISOString();
            payload.notificationTtlMinutes = notificationTtlMinutes;
        } else if (notificationOption === 'dontSend') {
            payload.notificationOption = 'dontSend';
        }
        onAction(bookingId, action, payload);
    };

    const getStatusBorderColor = s => s === 'pending' ? 'border-yellow-500' : s === 'approved' ? 'border-emerald-500' : 'border-rose-500';

    const getRoomOccupancyForBooking = (roomId, currentBooking) => {
        const room = (rooms || []).find(r => String(r._id) === String(roomId));
        if (!room) return { capacity: 0, occupied: 0, vacant: 0 };
        const beds = Array.isArray(room.beds) ? room.beds : [];
        const capacity = beds.length;
        const occupiedCount = (people || []).filter(person => {
            if (!person) return false;
            if (String(person.bookingId) === String(currentBooking._id)) return false;
            const bedInRoom = beds.some(bed => String(bed._id) === String(person.bedId?._id || person.bedId));
            return bedInRoom && person.stayFrom && person.stayTo && datesOverlap(currentBooking.formData.stayFrom, currentBooking.formData.stayTo, person.stayFrom, person.stayTo);
        }).length;
        const rawVacant = capacity - occupiedCount;
        return { capacity, occupied: occupiedCount, vacant: Math.max(0, rawVacant) };
    };

    const getAvailableBedsForRoom = (roomId, currentBooking, currentPersonIndex) => {
        const room = (rooms || []).find(r => String(r._id) === String(roomId));
        if (!room || !Array.isArray(room.beds)) return [];
        const bookingStart = currentBooking?.formData?.stayFrom ? new Date(currentBooking.formData.stayFrom) : null;
        const bookingEnd = currentBooking?.formData?.stayTo ? new Date(currentBooking.formData.stayTo) : null;
        const globallyOccupiedBedIds = new Set(
            (people || []).filter(p => p && String(p.bookingId) !== String(currentBooking._id) && p.stayFrom && p.stayTo && datesOverlap(bookingStart, bookingEnd, p.stayFrom, p.stayTo))
                .map(p => String(p.bedId?._id || p.bedId))
        );
        const tentativelyOccupiedBedIds = new Set(
            (pendingAllocations || []).filter((alloc, index) => index !== currentPersonIndex && alloc?.bedId).map(alloc => String(alloc.bedId))
        );
        return (room.beds || []).filter(bed => bed && bed._id && !globallyOccupiedBedIds.has(String(bed._id)) && !tentativelyOccupiedBedIds.has(String(bed._id)));
    };

    const getFilteredBuildings = (person) => {
        const allowedGenders = { 'male': ['male', 'unisex'], 'female': ['female', 'unisex'] };
        const personAllowed = allowedGenders[(person?.gender || '').toLowerCase()] || ['male', 'female', 'unisex'];
        return (buildings || []).filter(b => personAllowed.includes((b.gender || '').toLowerCase()));
    };

    // Helper functions to format options for SearchableSelect
    const getBuildingOptions = (person) => {
        const filteredBuildings = getFilteredBuildings(person);
        return [
            { value: '', label: 'Select Building' },
            ...filteredBuildings.map(b => ({ value: b._id, label: b.name }))
        ];
    };

    const getRoomOptions = (personAllocated, currentBooking) => {
        const filteredRooms = personAllocated.buildingId ? (rooms || []).filter(r => String(r.buildingId?._id) === String(personAllocated.buildingId)) : [];
        return [
            { value: '', label: 'Select Room' },
            ...filteredRooms.map(r => {
                const { vacant, capacity } = getRoomOccupancyForBooking(r._id, currentBooking);
                return { value: r._id, label: `${r.roomNumber} (${vacant}/${capacity} vacant)` };
            })
        ];
    };

    const getBedOptions = (personAllocated, booking, index) => {
        const filteredBeds = personAllocated.roomId ? getAvailableBedsForRoom(personAllocated.roomId, booking, index) : [];
        return [
            { value: '', label: 'Select Bed' },
            ...filteredBeds.map(bed => ({ value: bed._id, label: `${bed.name || 'Bed'} (${bed.type || 'Type'})` }))
        ];
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get(`/bookings/pdf/${bookingId}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Booking-Pass-${bookingNumber || bookingId}.pdf`);
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
        <div className={`bg-card rounded-2xl shadow-soft border-l-4 ${getStatusBorderColor(status)} overflow-hidden`}>
            {/* Summary / Header Row */}
            <div
                className="p-4 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-4">
                    <div>
                        <h4 className="text-lg font-bold font-heading text-primaryDark">{userId?.name || 'Unknown'}</h4>
                        <p className="text-xs font-mono text-gray-500">{bookingNumber || bookingId}</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full border ${status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                        {status}
                    </span>
                </div>

                <div className="flex items-center space-x-3">
                    {!readOnly && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(booking); }}
                            className="text-primary hover:text-primaryDark p-2 rounded-full hover:bg-pink-50 transition-colors flex items-center border border-transparent hover:border-pink-200"
                            title="Edit Booking Details"
                        >
                            <FaEdit size={16} className="mr-1" /> <span className="text-xs font-semibold">Edit</span>
                        </button>
                    )}
                    <button className="text-gray-400 p-2 transform transition-transform duration-200">
                        <FaChevronDown className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <div className="p-5 pt-0 border-t border-gray-100">
                            <div className="space-y-2 text-sm mt-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-2">
                                    <p><strong>Booked On:</strong> {formatDate(booking.createdAt)}</p>
                                    <p><strong>Group:</strong> {(formData?.people?.length) || 0} People</p>
                                    <p className="col-span-full"><strong>Stay:</strong> {formatDate(formData?.stayFrom)} to {formatDate(formData?.stayTo)}</p>
                                    <p className="col-span-full"><strong>Event:</strong> {booking.eventId?.name || 'N/A'}</p>
                                </div>

                                <AccordionItem title="Members">
                                    <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                                        {(formData?.people || []).map((p, i) => (
                                            <div key={i} className="text-xs flex flex-col border-b border-gray-100 last:border-0 py-1">
                                                <div className="flex justify-between font-semibold"><span>{i + 1}. {p?.name || 'Unknown'}</span><span>Age: {p?.age ?? 'N/A'}</span></div>
                                                <div className="text-gray-500 text-[10px] pl-3">Stay: {formatDate(p.stayFrom)} - {formatDate(p.stayTo)}</div>
                                            </div>
                                        ))}
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

                            {status === 'pending' && !readOnly && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h5 className="font-bold mb-3 text-pink-600 flex items-center font-heading"><FaEdit className="mr-2" /> Allocate ({formData?.people?.length || 0} People)</h5>
                                    <div className="space-y-4">
                                        {(formData?.people || []).map((person, index) => {
                                            const personAllocated = pendingAllocations[index] || {};
                                            const buildingOptions = getBuildingOptions(person);
                                            const roomOptions = getRoomOptions(personAllocated, booking);
                                            const bedOptions = getBedOptions(personAllocated, booking, index);

                                            // The zIndex is calculated to ensure each row stacks correctly
                                            const zIndex = (formData?.people?.length || 0) - index + 10;

                                            // Check if person is a young child (≤2 years)
                                            const isChildPerson = (person?.gender === 'boy' || person?.gender === 'girl') && parseInt(person?.age) <= 2;

                                            return (
                                                <div key={index} className={`p-3 bg-gray-50 rounded-lg border relative z-[${zIndex}]`}>
                                                    <div className="mb-2">
                                                        <p className="font-semibold text-gray-700">
                                                            {person?.name || `Person ${index + 1}`}
                                                            <span className="text-xs text-pink-500 capitalize ml-1">({person?.gender || 'N/A'})</span>
                                                            {isChildPerson && (
                                                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                                    Child ≤2
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Stay: {formatDate(person.stayFrom)} - {formatDate(person.stayTo)}</p>
                                                    </div>

                                                    {isChildPerson ? (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                                            <p className="text-amber-700 font-medium text-sm">
                                                                No bed allocation needed for young child
                                                            </p>
                                                            <p className="text-amber-600 text-xs mt-1">
                                                                Children aged 2 or below don't require a separate bed
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                                                            <SearchableSelect
                                                                options={buildingOptions}
                                                                value={personAllocated.buildingId || ''}
                                                                onChange={(e) => handleAllocationChange(bookingId, index, 'buildingId', e.target.value)}
                                                                placeholder="Select Building"
                                                            />
                                                            <div className="flex items-center space-x-2">
                                                                {/* FIX START: This wrapper allows the dropdown to shrink and make space for the icon */}
                                                                <div className="flex-1 min-w-0">
                                                                    <SearchableSelect
                                                                        options={roomOptions}
                                                                        value={personAllocated.roomId || ''}
                                                                        onChange={(e) => handleAllocationChange(bookingId, index, 'roomId', e.target.value)}
                                                                        placeholder="Select Room"
                                                                        disabled={!personAllocated.buildingId}
                                                                    />
                                                                </div>
                                                                {/* FIX END */}
                                                                {personAllocated.roomId && (
                                                                    <button type="button" onClick={() => onShowRoomDetails(personAllocated.roomId, booking)} className="text-blue-500 hover:text-blue-700 p-1" title="Show room occupants">
                                                                        <FaInfoCircle />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <SearchableSelect
                                                                options={bedOptions}
                                                                value={personAllocated.bedId || ''}
                                                                onChange={(e) => handleAllocationChange(bookingId, index, 'bedId', e.target.value)}
                                                                placeholder="Select Bed"
                                                                disabled={!personAllocated.roomId}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="space-y-3 mt-6 pt-4 border-t">
                                        <h5 className="font-bold text-gray-700">Notification Options</h5>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" value="sendNow" checked={notificationOption === 'sendNow'} onChange={(e) => setNotificationOption(e.target.value)} /><span>Send Now</span></label>
                                            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" value="schedule" checked={notificationOption === 'schedule'} onChange={(e) => setNotificationOption(e.target.value)} /><span>Schedule</span></label>
                                            <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" value="dontSend" checked={notificationOption === 'dontSend'} onChange={(e) => setNotificationOption(e.target.value)} /><span>Don't Send</span></label>
                                        </div>
                                        <AnimatePresence>
                                            {notificationOption === 'schedule' && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2">
                                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                                                        <div><label className="block text-xs font-medium text-gray-600">Days</label><input type="number" min="0" value={scheduleDelay.days} onChange={(e) => handleDelayChange('days', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                                        <div><label className="block text-xs font-medium text-gray-600">Hours</label><input type="number" min="0" max="23" value={scheduleDelay.hours} onChange={(e) => handleDelayChange('hours', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                                        <div><label className="block text-xs font-medium text-gray-600">Minutes</label><input type="number" min="0" max="59" value={scheduleDelay.minutes} onChange={(e) => handleDelayChange('minutes', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                                        <div><label className="block text-xs font-medium text-gray-600">Seconds</label><input type="number" min="0" max="59" value={scheduleDelay.seconds} onChange={(e) => handleDelayChange('seconds', e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" /></div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                                                        <strong>Will be sent on:</strong> {calculateFutureDate.toLocaleString('en-GB')}
                                                    </div>
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium text-gray-600">Notification Visibility (minutes from send time)</label>
                                                        <input type="number" value={notificationTtlMinutes} onChange={(e) => setNotificationTtlMinutes(e.target.value)} className="mt-1 w-full p-2 border rounded-md text-sm" placeholder="e.g., 1440 for 1 day" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t">
                                        <Button onClick={() => handleDecision('approved')} disabled={!allBedsAssigned} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg disabled:bg-gray-400"><FaCheck className="inline mr-2" /> Approve</Button>
                                        <Button onClick={() => handleDecision('declined')} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg"><FaTimes className="inline mr-2" /> Decline</Button>
                                    </div>
                                </div>
                            )}

                            {status === 'approved' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h5 className="font-bold mb-3 text-emerald-600 flex items-center"><FaUserShield className="mr-2" /> Allocated Details</h5>
                                    <div className="space-y-3">
                                        {safeSavedAllocations.map((alloc, index) => {
                                            const person = formData?.people?.[index];
                                            const isChildPerson = (person?.gender === 'boy' || person?.gender === 'girl') && parseInt(person?.age) <= 2;

                                            return (
                                                <div key={index} className={`text-sm p-3 rounded-lg border ${isChildPerson ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                                    <span className="font-semibold text-gray-800 mr-2">
                                                        {person?.name || `Person ${index + 1}`}
                                                        {isChildPerson && (
                                                            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                                Child ≤2
                                                            </span>
                                                        )}:
                                                    </span>
                                                    {isChildPerson ? (
                                                        <span className="text-amber-700 block sm:inline">No bed allocated (young child)</span>
                                                    ) : (
                                                        <span className="text-gray-600 block sm:inline">
                                                            Building {alloc?.buildingId?.name || 'N/A'}, Room {alloc?.roomId?.roomNumber || 'N/A'}, Bed {alloc?.bedId?.name || 'N/A'}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center mt-4 p-3 bg-gray-50 rounded-lg border">
                                        <input
                                            type="checkbox"
                                            id={`showDetails-${bookingId}`}
                                            checked={showAllocationDetails}
                                            onChange={async (e) => {
                                                const newValue = e.target.checked;
                                                setShowAllocationDetails(newValue);
                                                try {
                                                    await api.put(`/bookings/update/${bookingId}`, { showAllocationDetails: newValue });
                                                } catch (err) {
                                                    console.error('Failed to update showAllocationDetails', err);
                                                    setShowAllocationDetails(!newValue);
                                                }
                                            }}
                                            className="w-4 h-4 text-primary rounded focus:ring-primary mr-2"
                                        />
                                        <label htmlFor={`showDetails-${bookingId}`} className="text-sm text-gray-700 select-none cursor-pointer">
                                            Show allocation details to user (Room, Bed info)
                                        </label>
                                    </div>
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
                                        {!readOnly && (
                                            <Button onClick={() => onAction(bookingId, 'pending', { notificationOption })} className="bg-pink-500 hover:bg-pink-600"><FaEdit className="inline mr-2" /> Edit Allocation</Button>
                                        )}
                                        <Button onClick={handleDownloadPdf} className="bg-blue-500 hover:bg-blue-600"><FaFilePdf className="inline mr-2" /> Download Pass</Button>
                                    </div>
                                </div>
                            )}

                            {status === 'declined' && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-600 italic mb-4">This booking was declined. You can reconsider it.</div>
                                    {!readOnly && (
                                        <Button onClick={() => onAction(bookingId, 'pending', { notificationOption })} className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg"><FaEdit className="inline mr-2" /> Reconsider</Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BookingSection = ({ title, color = 'pink', bookings, readOnly, ...props }) => {
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    const colorMap = {
        pink: { border: 'border-pink-500', text: 'text-pink-700' },
        yellow: { border: 'border-yellow-500', text: 'text-yellow-700' },
        emerald: { border: 'border-emerald-500', text: 'text-emerald-700' },
        rose: { border: 'border-rose-500', text: 'text-rose-700' },
    };
    const classes = colorMap[color] || colorMap.pink;

    return (
        <div className="space-y-4">
            <h3 className={`text-2xl font-semibold mb-4 pb-2 border-b-4 ${classes.border} ${classes.text} font-heading`}>
                {title} ({safeBookings.length})
            </h3>
            {safeBookings.length === 0 ? (
                <p className="text-gray-600 italic">No {title.toLowerCase()} bookings.</p>
            ) : (
                safeBookings.map((booking) => <BookingCard key={booking._id} booking={booking} readOnly={readOnly} {...props} />)
            )}
        </div>
    );
};

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
    const [showOldAllocations, setShowOldAllocations] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, booking: null });
    const [sortBy, setSortBy] = useState('stayFrom');   // 'stayFrom' | 'name'
    const [sortDir, setSortDir] = useState('asc');      // 'asc' | 'desc'

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, roomsRes, buildingsRes, peopleRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/rooms'),
                api.get('/buildings'),
                api.get('/people'),
            ]);
            const fetchedBookings = bookingsRes?.data;
            const fetchedRooms = roomsRes?.data;
            const fetchedBuildings = buildingsRes?.data;
            const fetchedPeople = peopleRes?.data;

            setBookings(Array.isArray(fetchedBookings) ? fetchedBookings : (fetchedBookings ? [fetchedBookings] : []));
            setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : (fetchedRooms ? [fetchedRooms] : []));
            setBuildings(Array.isArray(fetchedBuildings) ? fetchedBuildings : (fetchedBuildings ? [fetchedBuildings] : []));
            setPeople(Array.isArray(fetchedPeople) ? fetchedPeople : (fetchedPeople ? [fetchedPeople] : []));
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again.');
            console.error(err);
            setBookings(prev => Array.isArray(prev) ? prev : []);
            setRooms(prev => Array.isArray(prev) ? prev : []);
            setBuildings(prev => Array.isArray(prev) ? prev : []);
            setPeople(prev => Array.isArray(prev) ? prev : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleAction = async (bookingId, action, allocationData = null) => {
        try {
            setError(null);
            setBookings(prev => (prev || []).map(b => {
                if (b._id === bookingId) {
                    const newBooking = { ...b, status: action };
                    if (allocationData && allocationData.allocations) {
                        newBooking.allocations = allocationData.allocations;
                    } else if (action === 'pending' || action === 'declined') {
                        newBooking.allocations = [];
                    }
                    return newBooking;
                }
                return b;
            }));
            await api.put(`/bookings/${bookingId}/status`, { status: action, allocations: allocationData });
            toast.success(`Booking ${action} successfully`);
            setAllocations(prev => {
                const newAlloc = { ...(prev || {}) };
                delete newAlloc[bookingId];
                return newAlloc;
            });
            await fetchAllData();
        } catch (err) {
            const msg = err?.response?.data?.message || `Failed to perform action: ${action}. Please reload.`;
            setError(msg);
            toast.error(msg);
            console.error(err);
            await fetchAllData();
        }
    };

    const handleAllocationChange = (bookingId, personIndex, type, value) => {
        setAllocations(prev => {
            const bookingToUpdate = (bookings || []).find(b => b._id === bookingId);
            const peopleCount = bookingToUpdate?.formData?.people?.length || 0;
            const newAllocationsForBooking = prev?.[bookingId] ? [...prev[bookingId]] : Array(peopleCount).fill({}).map(() => ({}));
            newAllocationsForBooking[personIndex] = { ...newAllocationsForBooking[personIndex], [type]: value };
            if (type === 'buildingId') {
                newAllocationsForBooking[personIndex].roomId = '';
                newAllocationsForBooking[personIndex].bedId = '';
            }
            if (type === 'roomId') {
                newAllocationsForBooking[personIndex].bedId = '';
            }
            return { ...(prev || {}), [bookingId]: newAllocationsForBooking };
        });
    };

    const handleShowRoomDetails = (roomId, currentBooking) => {
        const room = (rooms || []).find(r => String(r._id) === String(roomId));
        if (!room) {
            setRoomDetailsModal({ isOpen: false, room: null, occupants: [] });
            return;
        }
        const safePeople = Array.isArray(people) ? people : [];
        const occupants = safePeople.filter(person => {
            if (!person || !person.bedId) return false;
            const beds = Array.isArray(room.beds) ? room.beds : [];
            const bedInRoom = beds.some(bed => String(bed._id) === String(person.bedId?._id || person.bedId));
            if (!bedInRoom) return false;
            return !!(person.stayFrom && person.stayTo && datesOverlap(currentBooking?.formData?.stayFrom, currentBooking?.formData?.stayTo, person.stayFrom, person.stayTo));
        });
        setRoomDetailsModal({ isOpen: true, room, occupants });
    };

    const handleEditBooking = (booking) => {
        setEditModal({ isOpen: true, booking });
    };

    const handleBookingUpdate = (updatedBooking) => {
        if (!updatedBooking) return;
        setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
        // Refresh people if needed, but the main allocations view relies on booking objects
        // Ideally, we should re-fetch people too if dates changed, to update collision logic
        fetchAllData();
    };

    const filteredBookings = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        return (bookings || []).filter(b => {
            // Use Event End Date if available (priority), otherwise fallback to Stay To date
            const relevantEndDate = b.eventId?.endDate
                ? new Date(b.eventId.endDate)
                : (b.formData?.stayTo ? new Date(b.formData.stayTo) : null);

            if (showOldAllocations) {
                // Show old allocations: relevantEndDate must be strictly before today
                if (!relevantEndDate || relevantEndDate >= today) return false;
            } else {
                // Show current allocations: relevantEndDate should be today or in the future
                if (relevantEndDate && relevantEndDate < today) return false;
            }

            const { userName, email, phone, memberName, event, bookingDate, stayFrom, stayTo } = filters;
            if (userName && !String(b.userId?.name || '').toLowerCase().includes(userName.toLowerCase())) return false;
            if (email && !String(b.formData?.email || '').toLowerCase().includes(email.toLowerCase())) return false;
            if (phone && !String(b.formData?.contactNumber || '').includes(phone)) return false;
            if (event && !String(b.eventId?.name || '').toLowerCase().includes(event.toLowerCase())) return false;
            if (memberName) {
                if (!((b.formData?.people || []).some(p => String(p?.name || '').toLowerCase().includes(memberName.toLowerCase())))) return false;
            }
            if (bookingDate) {
                if (!b.createdAt) return false;
                const d = new Date(b.createdAt);
                const bookingCreated = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                if (bookingCreated !== bookingDate) return false;
            }
            if (!datesRoughlyMatch(b.formData?.stayFrom, b.formData?.stayTo, stayFrom, stayTo)) return false;
            return true;
        });
    }, [bookings, filters, showOldAllocations]);

    const sortedBookings = useMemo(() => {
        const list = [...(filteredBookings || [])];
        list.sort((a, b) => {
            if (sortBy === 'name') {
                const aName = (a.userId?.name || '').toLowerCase();
                const bName = (b.userId?.name || '').toLowerCase();
                if (aName < bName) return sortDir === 'asc' ? -1 : 1;
                if (aName > bName) return sortDir === 'asc' ? 1 : -1;
                return 0;
            }
            // default: stayFrom
            const aFrom = new Date(a?.formData?.stayFrom);
            const bFrom = new Date(b?.formData?.stayFrom);
            const aFromTime = isNaN(aFrom) ? Number.POSITIVE_INFINITY : aFrom.getTime();
            const bFromTime = isNaN(bFrom) ? Number.POSITIVE_INFINITY : bFrom.getTime();
            const factor = sortDir === 'asc' ? 1 : -1;
            if (aFromTime !== bFromTime) return factor * (aFromTime - bFromTime);

            const aTo = new Date(a?.formData?.stayTo);
            const bTo = new Date(b?.formData?.stayTo);
            const aToTime = isNaN(aTo) ? Number.POSITIVE_INFINITY : aTo.getTime();
            const bToTime = isNaN(bTo) ? Number.POSITIVE_INFINITY : bTo.getTime();
            if (aToTime !== bToTime) return factor * (aToTime - bToTime);

            const aCreated = new Date(a?.createdAt);
            const bCreated = new Date(b?.createdAt);
            const aCreatedTime = isNaN(aCreated) ? Number.POSITIVE_INFINITY : aCreated.getTime();
            const bCreatedTime = isNaN(bCreated) ? Number.POSITIVE_INFINITY : bCreated.getTime();
            return aCreatedTime - bCreatedTime;
        });
        return list;
    }, [filteredBookings, sortBy, sortDir]);

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-primary text-4xl" /></div>;

    const pendingBookings = (sortedBookings || []).filter(b => b.status === 'pending');
    const approvedBookings = (sortedBookings || []).filter(b => b.status === 'approved');
    const declinedBookings = (sortedBookings || []).filter(b => b.status === 'declined');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-primaryDark border-b-4 border-primary pb-2 inline-block font-heading">
                <FaUserShield className="inline mr-3 text-primary" /> Manage Allocations
            </h2>

            <div className="bg-card shadow-soft rounded-2xl p-5 mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center text-primaryDark font-heading"><FaFilter className="mr-2 text-primary" /> Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <input type="text" placeholder="User Name" value={filters.userName} onChange={(e) => setFilters({ ...filters, userName: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Phone" value={filters.phone} onChange={(e) => setFilters({ ...filters, phone: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Member Name" value={filters.memberName} onChange={(e) => setFilters({ ...filters, memberName: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <input type="text" placeholder="Event" value={filters.event} onChange={(e) => setFilters({ ...filters, event: e.target.value })} className="p-2 border rounded-lg w-full" />
                    <DynamicDateInput
                        label="Date of Booking"
                        name="bookingDate"
                        value={filters.bookingDate}
                        onChange={(e) => setFilters({ ...filters, bookingDate: e.target.value })}
                        className="w-full"
                    />
                    <DynamicDateInput
                        label="Stay From"
                        name="stayFrom"
                        value={filters.stayFrom}
                        onChange={(e) => setFilters({ ...filters, stayFrom: e.target.value })}
                        className="w-full"
                    />
                    <DynamicDateInput
                        label="Stay To"
                        name="stayTo"
                        value={filters.stayTo}
                        onChange={(e) => setFilters({ ...filters, stayTo: e.target.value })}
                        className="w-full"
                    />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Button onClick={() => setFilters({ userName: '', email: '', phone: '', memberName: '', event: '', bookingDate: '', stayFrom: '', stayTo: '' })} className="bg-gray-500 text-white">Clear Filters</Button>
                    <div className="flex items-center rounded-lg p-1">
                        <Button onClick={() => setShowOldAllocations(false)} className={`px-4 mr-4 py-1 text-sm rounded-md transition-colors ${!showOldAllocations ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Current</Button>
                        <Button onClick={() => setShowOldAllocations(true)} className={`px-4 py-1 text-sm rounded-md transition-colors ${showOldAllocations ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-300'}`}>Old</Button>
                    </div>
                    {/* Sort Controls */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-600 font-medium">Sort:</span>
                        <button
                            onClick={() => { setSortBy('stayFrom'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${sortBy === 'stayFrom' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                                }`}
                        >
                            {sortBy === 'stayFrom' && sortDir === 'desc' ? <FaSortAmountDown size={12} /> : <FaSortAmountUp size={12} />}
                            Date
                        </button>
                        <button
                            onClick={() => { setSortBy('name'); setSortDir(d => sortBy === 'name' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'); }}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${sortBy === 'name' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                                }`}
                        >
                            {sortBy === 'name' && sortDir === 'desc' ? <FaSortAmountDown size={12} /> : <FaSortAmountUp size={12} />}
                            Name
                        </button>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <BookingSection title="Pending" color="yellow" bookings={pendingBookings} onAction={handleAction} onEdit={handleEditBooking} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} readOnly={showOldAllocations} />
                <BookingSection title="Approved" color="emerald" bookings={approvedBookings} onAction={handleAction} onEdit={handleEditBooking} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} readOnly={showOldAllocations} />
                <BookingSection title="Declined" color="rose" bookings={declinedBookings} onAction={handleAction} onEdit={handleEditBooking} allocations={allocations} handleAllocationChange={handleAllocationChange} buildings={buildings} rooms={rooms} people={people} onShowRoomDetails={handleShowRoomDetails} setError={setError} readOnly={showOldAllocations} />
            </div>

            <RoomOccupantsModal
                isOpen={roomDetailsModal.isOpen}
                room={roomDetailsModal.room}
                occupants={roomDetailsModal.occupants}
                onClose={() => setRoomDetailsModal({ isOpen: false, room: null, occupants: [] })}
            />

            <EditBookingModal
                isOpen={editModal.isOpen}
                booking={editModal.booking}
                onClose={() => setEditModal({ isOpen: false, booking: null })}
                onUpdate={handleBookingUpdate}
            />
        </motion.div>
    );
};

export default ManageAllocations;
