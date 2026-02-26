import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import { toast } from 'react-toastify';
import {
    FaClipboardCheck, FaSignInAlt, FaSignOutAlt, FaUndo,
    FaSpinner, FaSearch, FaFilter, FaUser, FaBed,
    FaBuilding, FaCheckCircle, FaTimesCircle, FaClock
} from 'react-icons/fa';
import DynamicDateInput from '../common/DynamicDateInput.jsx';

// ── Helpers ───────────────────────────────────────────────────
const todayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

// ── Booking status badge ───────────────────────────────────────
const BookingStatusBadge = ({ members }) => {
    const checkedIn = members.filter(m => m.checkInTime && !m.checkOutTime).length;
    const checkedOut = members.filter(m => m.checkOutTime).length;
    const total = members.length;
    const fullyIn = checkedIn + checkedOut === total;

    let color = 'bg-gray-100 text-gray-600';
    let label = `0/${total} Checked In`;

    if (checkedIn + checkedOut > 0 && !fullyIn) {
        color = 'bg-amber-100 text-amber-700';
        label = `${checkedIn + checkedOut}/${total} Partial`;
    } else if (fullyIn) {
        color = 'bg-emerald-100 text-emerald-700';
        label = `${total}/${total} Complete`;
    }

    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
            {fullyIn ? <FaCheckCircle /> : <FaClock />}
            {label}
        </span>
    );
};

// ── Person row ────────────────────────────────────────────────
const PersonRow = ({ person, onAction }) => {
    const [loading, setLoading] = useState(null); // 'checkin' | 'checkout' | 'undo'

    const handle = async (action) => {
        setLoading(action);
        try {
            await onAction(person._id, action);
        } finally {
            setLoading(null);
        }
    };

    const isCheckedIn = !!person.checkInTime && !person.checkOutTime;
    const isCheckedOut = !!person.checkOutTime;
    const isPending = !person.checkInTime;

    const genderColor = {
        male: 'bg-blue-50 text-blue-700 border-blue-200',
        female: 'bg-pink-50 text-pink-700 border-pink-200',
        boy: 'bg-sky-50 text-sky-700 border-sky-200',
        girl: 'bg-rose-50 text-rose-700 border-rose-200',
    }[person.gender?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';

    const bed = person.bedId;
    const allocationText = bed
        ? <><span className="font-semibold text-primaryDark">{bed.roomId?.buildingId?.name || ''}</span> · Rm <span className="font-medium text-gray-700">{bed.roomId?.roomNumber || '?'}</span> / Bed <span className="font-medium text-gray-700">{bed.name || '?'}</span></>
        : <span className="italic text-gray-400">No bed assigned</span>;

    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border transition-all duration-200
            ${isCheckedOut ? 'bg-gray-50/70 border-gray-200 opacity-75' :
                isCheckedIn ? 'bg-emerald-50/60 border-emerald-200' :
                    'bg-white border-gray-200 hover:border-primary/40'}`}>

            {/* Person info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{person.name}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${genderColor}`}>
                        {person.gender}, {person.age}y
                    </span>
                    {isCheckedIn && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <FaCheckCircle size={9} /> In at {formatTime(person.checkInTime)}
                        </span>
                    )}
                    {isCheckedOut && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 flex items-center gap-1">
                            <FaTimesCircle size={9} /> Out at {formatTime(person.checkOutTime)}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <FaBed size={9} className="opacity-60" />
                    {allocationText}
                </p>
                <p className="text-xs text-gray-400">
                    Stay: {formatDate(person.stayFrom)} → {formatDate(person.stayTo)}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {isPending && (
                    <button
                        onClick={() => handle('checkin')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
                    >
                        {loading === 'checkin' ? <FaSpinner className="animate-spin" size={11} /> : <FaSignInAlt size={11} />}
                        Check In
                    </button>
                )}

                {isCheckedIn && (
                    <>
                        <button
                            onClick={() => handle('checkout')}
                            disabled={!!loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
                        >
                            {loading === 'checkout' ? <FaSpinner className="animate-spin" size={11} /> : <FaSignOutAlt size={11} />}
                            Check Out
                        </button>
                        <button
                            onClick={() => handle('undo')}
                            disabled={!!loading}
                            title="Undo check-in"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
                        >
                            {loading === 'undo' ? <FaSpinner className="animate-spin" size={10} /> : <FaUndo size={10} />}
                        </button>
                    </>
                )}

                {isCheckedOut && (
                    <button
                        onClick={() => handle('undo')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
                    >
                        {loading === 'undo' ? <FaSpinner className="animate-spin" size={10} /> : <FaUndo size={10} />}
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Booking Card ──────────────────────────────────────────────
const BookingCard = ({ booking, onPersonAction }) => {
    const [open, setOpen] = useState(true);
    const { bookingNumber, ashramName, contactNumber, city, eventName, stayFrom, stayTo, members } = booking;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
            {/* Header */}
            <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-background/40 transition-colors"
                onClick={() => setOpen(o => !o)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                    <div>
                        <span className="font-mono text-xs text-gray-400 block">#{bookingNumber}</span>
                        <span className="font-bold text-gray-800 text-sm">{ashramName || 'N/A'}</span>
                        <span className="text-xs text-gray-500 ml-2">{city}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 bg-background px-2 py-0.5 rounded-full">
                            {eventName}
                        </span>
                        <span className="text-xs text-gray-400">
                            {formatDate(stayFrom)} → {formatDate(stayTo)}
                        </span>
                        {contactNumber && (
                            <span className="text-xs text-gray-400">📞 {contactNumber}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                    <BookingStatusBadge members={members} />
                    <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </button>

            {/* Members */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                            {members.map(member => (
                                <PersonRow
                                    key={member._id}
                                    person={member}
                                    onAction={onPersonAction}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Main Page ─────────────────────────────────────────────────
const CheckInPage = () => {
    const [startDate, setStartDate] = useState(todayISO());
    const [endDate, setEndDate] = useState(todayISO());
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                startDate,
                endDate,
                sortBy,
                sortOrder,
                searchTerm: debouncedSearch
            });
            const res = await api.get(`/people/checkin-data?${params}`);
            setBookings(res.data.bookings || []);
        } catch (err) {
            toast.error('Failed to load check-in data.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, sortBy, sortOrder, debouncedSearch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handlePersonAction = async (personId, action) => {
        try {
            const endpoint =
                action === 'checkin' ? `/people/${personId}/checkin` :
                    action === 'checkout' ? `/people/${personId}/checkout` :
                        `/people/${personId}/undo-checkin`;
            const res = await api.post(endpoint);
            const updated = res.data.person;

            // Optimistic update: replace person in local state
            setBookings(prev => prev.map(b => ({
                ...b,
                members: b.members.map(m =>
                    m._id === personId ? { ...m, ...updated } : m
                )
            })));

            const Msg = () => (
                <div className="flex items-center gap-2">
                    {action === 'checkin' ? <FaSignInAlt className="text-emerald-500" /> :
                        action === 'checkout' ? <FaSignOutAlt className="text-rose-500" /> :
                            <FaUndo className="text-gray-500" />}
                    <span>
                        {action === 'checkin' ? `${updated.name} checked in` :
                            action === 'checkout' ? `${updated.name} checked out` :
                                `Reset for ${updated.name}`}
                    </span>
                </div>
            );
            toast.success(<Msg />);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed.');
        }
    };

    // Summary stats
    const totalMembers = bookings.reduce((s, b) => s + b.members.length, 0);
    const totalCheckedIn = bookings.reduce((s, b) => s + b.members.filter(m => m.checkInTime && !m.checkOutTime).length, 0);
    const totalOut = bookings.reduce((s, b) => s + b.members.filter(m => m.checkOutTime).length, 0);
    const totalPending = totalMembers - totalCheckedIn - totalOut;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            {/* Header */}
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-primaryDark border-b-4 border-primary pb-2 inline-block font-heading">
                <FaClipboardCheck className="inline mr-3 text-primary" />
                Check-in / Check-out
            </h2>

            {/* Stats Summary - Integration into the header or top bar if needed */}
            {!loading && totalMembers > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
                        <div className="text-2xl font-bold text-blue-700">{totalMembers}</div>
                        <div className="text-xs text-blue-500 font-semibold uppercase tracking-wider">Expected</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-2xl font-bold text-gray-700">{totalPending}</div>
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100 text-center">
                        <div className="text-2xl font-bold text-emerald-700">{totalCheckedIn}</div>
                        <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wider">Checked In</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 text-center">
                        <div className="text-2xl font-bold text-rose-700">{totalOut}</div>
                        <div className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Checked Out</div>
                    </div>
                </div>
            )}

            {/* Filters Area - Standard bg-card pattern */}
            <div className="bg-card p-4 rounded-2xl shadow-soft mb-8">
                <h3 className="text-base font-semibold mb-4 flex items-center text-primaryDark font-heading">
                    <FaFilter className="mr-2 text-primary" /> Multi-Filter Search
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="w-full">
                        <DynamicDateInput
                            label="Check-in Date"
                            name="startDate"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="w-full">
                        <DynamicDateInput
                            label="Check-out Date"
                            name="endDate"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="date">Date</option>
                            <option value="name">Name</option>
                        </select>
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Order</label>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    <div className="relative flex-1 w-full lg:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Quick Search</label>
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search Name, City..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={fetchData}
                        className="w-full md:w-auto px-10 py-2 bg-primaryDark text-white rounded-lg text-sm font-bold hover:bg-primary transition-all shadow-md h-[42px]"
                    >
                        Apply Filters & Sort
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <FaSpinner className="animate-spin text-primaryDark text-4xl" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-24 bg-card/50 rounded-3xl border border-dashed border-gray-400 shadow-inner">
                    <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl font-bold font-heading">No Guests Found</p>
                    <p className="text-gray-400 text-sm mt-1">Found no matches for the selected date or search criteria.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-sm font-bold text-primaryDark/60 uppercase tracking-widest flex items-center gap-2">
                            <FaBuilding className="text-primary" />
                            Showing {bookings.length} Booking Group{bookings.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {bookings.map(b => (
                        <BookingCard
                            key={String(b.bookingId)}
                            booking={b}
                            onPersonAction={handlePersonAction}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default CheckInPage;
