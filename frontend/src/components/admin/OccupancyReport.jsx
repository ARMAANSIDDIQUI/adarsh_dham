// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaUsers, FaFilter, FaSearch, FaChevronDown } from 'react-icons/fa';
import AllocationsView from './AllocationsView';
import Pagination from './Pagination';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// Helper function to format date objects as YYYY-MM-DD strings for input fields
const formatDateForInput = (date) => date.toISOString().split('T')[0];

/**
 * Helper function to get the current date/month boundaries locked to IST (UTC + 5:30).
 * This ensures the UI defaults to the correct calendar month (e.g., Oct 1st to Oct 31st).
 */
const getIstDateBoundaries = () => {
    // Current date/time in IST
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(new Date().getTime() + IST_OFFSET_MS);
    
    // Get year and month based on IST
    const year = nowIst.getUTCFullYear();
    const month = nowIst.getUTCMonth();

    // First Day of Month (IST) -> 1st day of the current month
    // We create it as a UTC date to ensure correct formatting later
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
    
    // Last Day of Month (IST) -> Last day of the current month
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

    return { firstDayOfMonth, lastDayOfMonth };
};

// --- Standalone SearchableSelect Component ---
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
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer transition-colors duration-200 bg-white ${disabled ? 'bg-gray-200' : 'hover:border-pink-500'}`} onClick={() => !disabled && setIsOpen(!isOpen)} tabIndex="0">
                <span className={`text-sm truncate ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>{selectedOption ? selectedOption.label : placeholder}</span>
                <FaChevronDown className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute top-full mt-1 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                        <div className="relative p-2 border-b">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input ref={inputRef} type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-2 py-1 text-sm border-none focus:ring-0" onClick={(e) => e.stopPropagation()} />
                        </div>
                        <ul className="max-h-48 overflow-y-auto p-1">
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

const OccupancyReport = () => {
    const [events, setEvents] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [error, setError] = useState(null);
    const [dateFilterType, setDateFilterType] = useState('stayRange');

    const { firstDayOfMonth, lastDayOfMonth } = useMemo(getIstDateBoundaries, []);

    const [filters, setFilters] = useState({
        eventId: '',
        buildingId: '',
        gender: '',
        startDate: formatDateForInput(firstDayOfMonth),
        endDate: formatDateForInput(lastDayOfMonth),
    });
    
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 25,
        totalRecords: 0,
    });

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [eventsRes, buildingsRes] = await Promise.all([
                    api.get('/events'),
                    api.get('/buildings')
                ]);
                setEvents(eventsRes.data || []);
                setBuildings(buildingsRes.data || []);
            } catch (err) {
                setError('Failed to fetch filter options.');
                console.error(err);
            }
        };
        fetchDropdownData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        let filterValue = value;
        if (name === 'gender') {
            if (value === 'Boy') {
                filterValue = 'male';
            } else if (value === 'Girl') {
                filterValue = 'female';
            } else if (value) {
                filterValue = value.toLowerCase();
            }
        }
        
        setFilters(prev => ({ ...prev, [name]: filterValue }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };
    
    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({
            ...prev,
            limit: newLimit,
            currentPage: 1,
        }));
    };

    const adjustedFilters = useMemo(() => {
        const userSelectedDate = new Date(filters.startDate); 
        const apiStartDate = new Date(userSelectedDate);
        apiStartDate.setDate(apiStartDate.getDate() - 1);
        
        return {
            ...filters,
            startDate: formatDateForInput(apiStartDate),
        };
    }, [filters]);


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-neutral min-h-screen font-body">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-primaryDark border-b-4 border-primary pb-2 inline-block font-heading">
                <FaUsers className="inline mr-3 text-primary"/> Occupancy Report
            </h2>
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}
            
            <div className="bg-card p-4 rounded-2xl shadow-soft mb-8">
                <h3 className="font-semibold font-heading text-lg mb-4 flex items-center text-primaryDark"><FaFilter className="mr-2 text-primary"/>Filters</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-background mb-4">
                    <label className="font-semibold sm:col-span-1">Date Range Applies To:</label>
                    <div className="flex items-center gap-4 sm:col-span-2">
                        <label htmlFor="stayRange" className="flex items-center cursor-pointer">
                            <input type="radio" id="stayRange" name="dateFilterType" value="stayRange"
                                checked={dateFilterType === 'stayRange'}
                                onChange={(e) => setDateFilterType(e.target.value)}
                                className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500" />
                            <span className="ml-2 text-gray-700">Stay Dates</span>
                        </label>
                        <label htmlFor="bookingDate" className="flex items-center cursor-pointer">
                            <input type="radio" id="bookingDate" name="dateFilterType" value="bookingDate"
                                checked={dateFilterType === 'bookingDate'}
                                onChange={(e) => setDateFilterType(e.target.value)}
                                className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500" />
                            <span className="ml-2 text-gray-700">Booking Creation Dates</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative md:col-span-2 lg:col-span-4">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search by name, booking #, city..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-pink-500 focus:border-pink-500"/>
                    </div>
                    
                    <div className="flex items-center space-x-2 border border-background rounded-lg p-1 bg-white shadow-sm">
                        <span className="text-sm font-medium text-gray-600">From:</span>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-1 w-full focus:outline-none"/>
                    </div>
                    
                    <div className="flex items-center space-x-2 border border-background rounded-lg p-1 bg-white shadow-sm">
                        <span className="text-sm font-medium text-gray-600">To:</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-1 w-full focus:outline-none"/>
                    </div>
                    
                    <SearchableSelect
                        options={[{ value: '', label: 'All Events' }, ...events.map(e => ({ value: e._id, label: e.name }))]}
                        value={filters.eventId}
                        onChange={(e) => handleFilterChange({ target: { name: 'eventId', value: e.target.value } })}
                        placeholder="All Events"
                    />
                     <SearchableSelect
                        options={[{ value: '', label: 'All Buildings' }, ...buildings.map(b => ({ value: b._id, label: b.name }))]}
                        value={filters.buildingId}
                        onChange={(e) => handleFilterChange({ target: { name: 'buildingId', value: e.target.value } })}
                        placeholder="All Buildings"
                    />
                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="p-2 border rounded-lg bg-white">
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Boy">Boy</option>
                        <option value="Girl">Girl</option>
                    </select>
                </div>
            </div>

            <AllocationsView 
                filters={adjustedFilters}
                dateFilterType={dateFilterType}
                debouncedSearchTerm={debouncedSearchTerm} 
                pagination={pagination} 
                setPagination={setPagination} 
            />

            <Pagination pagination={pagination} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />
        </motion.div>
    );
};

export default OccupancyReport;