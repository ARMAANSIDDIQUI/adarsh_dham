import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import Button from '../common/Button.jsx';
import { FaUsers, FaFilter, FaSearch } from 'react-icons/fa';
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

const OccupancyReport = () => {
    const [events, setEvents] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [error, setError] = useState(null);
    const [dateFilterType, setDateFilterType] = useState('stayRange');

    // Calculate initial date range locked to IST for UI display
    const { firstDayOfMonth, lastDayOfMonth } = useMemo(getIstDateBoundaries, []);

    const [filters, setFilters] = useState({
        eventId: '',
        buildingId: '',
        gender: '',
        // UI always shows the human-readable first day of the month (X)
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

    /**
     * Calculates the API filter object.
     * The `startDate` sent to the API is always the date selected by the user MINUS 1 day,
     * to correctly handle the IST midnight time zone boundary issue.
     */
    const adjustedFilters = useMemo(() => {
        // 1. Get the date the user selected (e.g., '2025-10-01')
        const userSelectedDate = new Date(filters.startDate); 
        
        // 2. Subtract one day (X-1) to ensure the API queries records starting at 00:00:00 on the user's selected date.
        const apiStartDate = new Date(userSelectedDate);
        apiStartDate.setDate(apiStartDate.getDate() - 1);
        
        return {
            ...filters,
            startDate: formatDateForInput(apiStartDate), // Send X-1 to API (e.g., Sept 30th)
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
                    
                    {/* UI Field: Displays the user's intended date (X) */}
                    <div className="flex items-center space-x-2 border border-background rounded-lg p-1 bg-white shadow-sm">
                        <span className="text-sm font-medium text-gray-600">From:</span>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-1 w-full focus:outline-none"/>
                    </div>
                    
                    {/* UI Field: Displays the user's intended date */}
                    <div className="flex items-center space-x-2 border border-background rounded-lg p-1 bg-white shadow-sm">
                        <span className="text-sm font-medium text-gray-600">To:</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-1 w-full focus:outline-none"/>
                    </div>
                    
                    <select name="eventId" value={filters.eventId} onChange={handleFilterChange} className="p-2 border rounded-lg">
                        <option value="">All Events</option>
                        {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                    </select>
                    <select name="buildingId" value={filters.buildingId} onChange={handleFilterChange} 
                        className="p-2 border rounded-lg">
                        <option value="">All Buildings</option>
                        {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                    <select name="gender" value={filters.gender} onChange={handleFilterChange} className="p-2 border rounded-lg">
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
                filters={adjustedFilters} // Sends adjusted (X-1) start date to API
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