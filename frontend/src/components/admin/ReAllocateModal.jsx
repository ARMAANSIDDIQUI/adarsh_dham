import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaBed, FaChevronDown, FaSearch, FaInfoCircle } from 'react-icons/fa';
import Button from '../common/Button.jsx';
import api from '../../api/api.js';
import { toast } from 'react-toastify';

// SearchableSelect borrowed from ManageAllocations to keep UI consistent
const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

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
                className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors duration-200 ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-300 hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm text-gray-700'}`}
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
                        className="absolute top-full mt-1 w-full bg-card border rounded-lg shadow-lg z-50 overflow-hidden"
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
                                        className="p-2 text-sm cursor-pointer hover:bg-primary/10 hover:text-primaryDark text-gray-700 rounded-md transition-colors"
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

const ReAllocateModal = ({ isOpen, onClose, booking, buildings, rooms, people, onUpdate, onShowRoomDetails }) => {
    const [allocations, setAllocations] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && booking) {
            // Initialize allocations state from current booking.allocations
            const initialAllocations = booking.formData?.people?.map((_, idx) => {
                const existing = booking.allocations?.[idx];
                return {
                    buildingId: existing?.buildingId?._id || existing?.buildingId || '',
                    roomId: existing?.roomId?._id || existing?.roomId || '',
                    bedId: existing?.bedId?._id || existing?.bedId || ''
                };
            }) || [];
            setAllocations(initialAllocations);
        }
    }, [isOpen, booking]);

    if (!isOpen || !booking) return null;

    const handleAllocationChange = (index, type, value) => {
        setAllocations(prev => {
            const newAlloc = [...prev];
            newAlloc[index] = { ...newAlloc[index], [type]: value };
            if (type === 'buildingId') {
                newAlloc[index].roomId = '';
                newAlloc[index].bedId = '';
            }
            if (type === 'roomId') {
                newAlloc[index].bedId = '';
            }
            return newAlloc;
        });
    };

    const getBuildingOptions = (personData) => {
        const safeBuildings = Array.isArray(buildings) ? buildings : [];
        let filteredBuildings = safeBuildings;
        if (personData && personData.gender) {
            filteredBuildings = safeBuildings.filter(b => !b.genderOption || b.genderOption === 'all' || b.genderOption.toLowerCase() === personData.gender.toLowerCase());
        }
        return filteredBuildings.map(b => ({ value: b._id, label: b.name }));
    };

    const getRoomOptions = (currentAllocation, currentBooking) => {
        if (!currentAllocation?.buildingId) return [];
        const safeRooms = Array.isArray(rooms) ? rooms : [];
        const buildingRooms = safeRooms.filter(r => String(r.buildingId?._id || r.buildingId) === String(currentAllocation.buildingId));

        return buildingRooms.map(r => {
            const safeBeds = Array.isArray(r.beds) ? r.beds : [];
            let availableBedsCount = 0;

            safeBeds.forEach(bed => {
                const isBedOccupied = (people || []).some(person => {
                    const bedIdStr = person.bedId?._id ? String(person.bedId._id) : String(person.bedId);
                    if (bedIdStr !== String(bed._id)) return false;
                    if (String(person.bookingId) === String(currentBooking?._id)) return false; // Ignore current booking's own people
                    return person.stayFrom && person.stayTo && datesOverlap(currentBooking?.formData?.stayFrom, currentBooking?.formData?.stayTo, person.stayFrom, person.checkOutTime || person.stayTo);
                });
                if (!isBedOccupied) availableBedsCount++;
            });

            return {
                value: r._id,
                label: `Room ${r.roomNumber} (${availableBedsCount} available)`
            };
        });
    };

    const getBedOptions = (currentAllocation, currentBooking, personIndex) => {
        if (!currentAllocation?.roomId) return [];
        const safeRooms = Array.isArray(rooms) ? rooms : [];
        const room = safeRooms.find(r => String(r._id) === String(currentAllocation.roomId));
        if (!room) return [];

        const currentlySelectedBedIds = allocations
            .map((alloc, idx) => idx !== personIndex ? alloc.bedId : null)
            .filter(Boolean);

        const safeBeds = Array.isArray(room.beds) ? room.beds : [];

        return safeBeds.map(bed => {
            const isBedGloballyOccupied = (people || []).some(person => {
                const bedIdStr = person.bedId?._id ? String(person.bedId._id) : String(person.bedId);
                if (bedIdStr !== String(bed._id)) return false;
                if (String(person.bookingId) === String(currentBooking?._id)) return false;
                return person.stayFrom && person.stayTo && datesOverlap(currentBooking?.formData?.stayFrom, currentBooking?.formData?.stayTo, person.stayFrom, person.checkOutTime || person.stayTo);
            });

            const isSelectedByAnotherPersonInSameBooking = currentlySelectedBedIds.includes(String(bed._id));
            const isOccupied = isBedGloballyOccupied || isSelectedByAnotherPersonInSameBooking;

            // Optional enhancement: disable occupied options or just label them
            const label = isOccupied ? `${bed.name} (Occupied/Selected)` : bed.name;
            return {
                value: String(bed._id),
                label: label,
                // Add an actual disabled flag if we want SearchableSelect to gray it out
                // For now, let's just let it show, but append "(Occupied/Selected)"
            };
        });
    };

    const handleSave = async () => {
        // Validate all non-child people have a bed selection
        const formData = booking.formData;
        const missingBeds = [];
        formData.people.forEach((p, idx) => {
            const isChild = (p.gender === 'boy' || p.gender === 'girl') && parseInt(p.age) <= 2;
            if (!isChild && !allocations[idx]?.bedId) {
                missingBeds.push(p.name);
            }
        });

        if (missingBeds.length > 0) {
            toast.error(`Please select a bed for: ${missingBeds.join(', ')}`);
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.put(`/bookings/${booking._id}/status`, {
                status: 'approved',
                allocations: {
                    allocations: allocations, // Backend expects req.body.allocations.allocations
                    notificationOption: 'dontSend'
                }
            });
            toast.success('Allocations updated successfully');
            onUpdate(res.data.booking || booking); // Assuming backend returns updated booking
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update allocations');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50">
            <div className="min-h-screen px-4 text-center flex items-center justify-center py-10">
                {/* Trick to center modal in overflow-y-auto container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="inline-block w-full max-w-4xl text-left align-middle transition-all transform bg-card rounded-2xl shadow-xl font-body overflow-visible"
                >
                    <div className="p-4 md:p-6 border-b flex justify-between items-center bg-background rounded-t-2xl">
                        <h3 className="text-xl md:text-2xl font-bold font-heading text-primaryDark flex items-center">
                            <FaBed className="mr-3 text-primary" />
                            Re-Allocate Beds - {booking.bookingNumber}
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 border border-transparent hover:border-gray-200 rounded-lg transition-colors">
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="p-4 md:p-6 bg-neutral">
                        <div className="space-y-4">
                            {(booking.formData?.people || []).map((person, index) => {
                                const personAllocated = allocations[index] || {};
                                const buildingOptions = getBuildingOptions(person);
                                const roomOptions = getRoomOptions(personAllocated, booking);
                                const bedOptions = getBedOptions(personAllocated, booking, index);
                                const zIndex = (booking.formData?.people?.length || 0) - index + 10;
                                const isChildPerson = (person?.gender === 'boy' || person?.gender === 'girl') && parseInt(person?.age) <= 2;

                                return (
                                    <div key={index} className={`p-4 bg-background/50 shadow-sm rounded-xl border border-primary/20 relative z-[${zIndex}] hover:border-primary/30 transition-colors`}>
                                        <div className="mb-3">
                                            <p className="font-bold text-primaryDark text-lg flex items-center gap-2">
                                                {person?.name || `Person ${index + 1}`}
                                                <span className="text-xs font-medium text-gray-500 bg-background px-2 py-0.5 rounded-full capitalize">({person?.gender || 'N/A'})</span>
                                                {isChildPerson && (
                                                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                        Child ≤2
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-widest bg-background inline-block px-2 py-1 rounded-md">
                                                Stay: <span className="text-gray-700">{formatDate(person.stayFrom)} - {formatDate(person.stayTo)}</span>
                                            </p>
                                        </div>

                                        {isChildPerson ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                                <p className="text-amber-700 font-medium text-sm">No bed allocation needed for young child</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
                                                <SearchableSelect
                                                    options={buildingOptions}
                                                    value={personAllocated.buildingId || ''}
                                                    onChange={(e) => handleAllocationChange(index, 'buildingId', e.target.value)}
                                                    placeholder="Select Building"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex-1 min-w-0">
                                                        <SearchableSelect
                                                            options={roomOptions}
                                                            value={personAllocated.roomId || ''}
                                                            onChange={(e) => handleAllocationChange(index, 'roomId', e.target.value)}
                                                            placeholder="Select Room"
                                                            disabled={!personAllocated.buildingId}
                                                        />
                                                    </div>
                                                    {personAllocated.roomId && (
                                                        <button type="button" onClick={() => onShowRoomDetails(personAllocated.roomId, booking)} className="text-blue-500 hover:text-blue-700 p-1" title="Show room occupants">
                                                            <FaInfoCircle />
                                                        </button>
                                                    )}
                                                </div>
                                                <SearchableSelect
                                                    options={bedOptions}
                                                    value={personAllocated.bedId || ''}
                                                    onChange={(e) => handleAllocationChange(index, 'bedId', e.target.value)}
                                                    placeholder="Select Bed"
                                                    disabled={!personAllocated.roomId}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end space-x-3 bg-background rounded-b-2xl">
                        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 min-w-[100px]">Cancel</Button>
                        <Button onClick={handleSave} disabled={submitting} className="bg-primary hover:bg-primaryDark text-white min-w-[120px]">
                            {submitting ? 'Saving...' : <><FaSave className="inline mr-2" /> Save Allocations</>}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReAllocateModal;
