import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import { FaUsers, FaSpinner, FaFilter, FaFileExcel, FaSearch } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';

const OccupancyReport = () => {
    const [people, setPeople] = useState([]);
    const [events, setEvents] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [filters, setFilters] = useState({
        eventId: '',
        buildingId: '',
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: lastDayOfMonth.toISOString().split('T')[0],
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [peopleRes, eventsRes, buildingsRes] = await Promise.all([
                    api.get('/people'),
                    api.get('/events'),
                    api.get('/buildings')
                ]);
                setPeople(peopleRes.data || []);
                setEvents(eventsRes.data || []);
                setBuildings(buildingsRes.data || []);
                setError(null);
            } catch (err) {
                setError('Failed to fetch report data. Please ensure you are logged in and the server is running.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredPeople = useMemo(() => {
        if (!people) return [];
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); 

        const lowercasedSearch = searchTerm.toLowerCase();

        return people.filter(person => {
            const stayFrom = new Date(person.stayFrom);
            const stayTo = new Date(person.stayTo);

            const eventMatch = !filters.eventId || person.eventId?._id === filters.eventId;
            const buildingMatch = !filters.buildingId || person.bedId?.roomId?.buildingId?._id === filters.buildingId;
            const dateMatch = (stayFrom <= end) && (stayTo >= start);

            // UPDATED: Search now includes allocation details
            const searchMatch = !lowercasedSearch ||
                person.name?.toLowerCase().includes(lowercasedSearch) ||
                person.bookingNumber?.toLowerCase().includes(lowercasedSearch) ||
                person.ashramName?.toLowerCase().includes(lowercasedSearch) ||
                person.city?.toLowerCase().includes(lowercasedSearch) ||
                person.contactNumber?.includes(lowercasedSearch) ||
                person.userId?.name?.toLowerCase().includes(lowercasedSearch) ||
                person.bedId?.name?.toLowerCase().includes(lowercasedSearch) || // Search by Bed Name
                person.bedId?.roomId?.roomNumber?.toLowerCase().includes(lowercasedSearch) || // Search by Room Number
                person.bedId?.roomId?.buildingId?.name?.toLowerCase().includes(lowercasedSearch); // Search by Building Name
                
            return eventMatch && buildingMatch && dateMatch && searchMatch;
        });
    }, [people, filters, searchTerm]);
    
    const handleExport = () => {
        const dataToExport = filteredPeople.map(p => ({
            'Name': p.name,
            'Gender': p.gender,
            'Age': p.age,
            'Booking #': p.bookingNumber,
            'Event': p.eventId?.name,
            'Stay From': new Date(p.stayFrom).toLocaleDateString(),
            'Stay To': new Date(p.stayTo).toLocaleDateString(),
            'Building': p.bedId?.roomId?.buildingId?.name,
            'Room #': p.bedId?.roomId?.roomNumber,
            'Bed': p.bedId?.name,
            'Ashram': p.ashramName,
            'City': p.city,
            'Booked By': p.userId?.name,
            'Contact': p.contactNumber,
            'Reference': p.baijiMahatmaJi,
        }));
        const worksheet = utils.json_to_sheet(dataToExport);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Occupancy Report");
        writeFile(workbook, `OccupancyReport_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-pink-500 text-4xl" /></div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-pink-500 pb-2 inline-block">
                <FaUsers className="inline mr-3 text-pink-500"/> Occupancy Report
            </h2>
            {error && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-6">{error}</p>}

            <div className="bg-white p-4 rounded-xl shadow-lg mb-8 border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 flex items-center"><FaFilter className="mr-2 text-pink-500"/>Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2 lg:col-span-5">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, booking #, allocation, ashram, city, contact..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded-lg"/>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded-lg"/>
                    <select name="eventId" value={filters.eventId} onChange={handleFilterChange} className="p-2 border rounded-lg">
                        <option value="">All Events</option>
                        {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                    </select>
                    <select name="buildingId" value={filters.buildingId} onChange={handleFilterChange} className="p-2 border rounded-lg">
                        <option value="">All Buildings</option>
                        {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">Results: {filteredPeople.length}</h3>
                <button onClick={handleExport} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center">
                    <FaFileExcel className="mr-2"/> Export to Excel
                </button>
            </div>
            
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-pink-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Person Details</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Booking Details</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Stay Dates</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Allocation</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Booked By</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredPeople.map(person => (
                            <tr key={person._id} className="hover:bg-pink-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-medium text-gray-900">{person.name}</p>
                                    <p className="text-gray-500">{person.gender}, Age: {person.age}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-mono text-gray-600">{person.bookingNumber}</p>
                                    <p className="text-gray-500">{person.ashramName}, {person.city}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                    {new Date(person.stayFrom).toLocaleDateString()} - {new Date(person.stayTo).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                    <p className="font-medium">{person.bedId?.roomId?.buildingId?.name}</p>
                                    <p>Room {person.bedId?.roomId?.roomNumber} / Bed {person.bedId?.name}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 align-top">
                                    <p className="font-medium">{person.userId?.name}</p>
                                    <p>{person.contactNumber}</p>
                                </td>
                            </tr>
                        ))}
                         {filteredPeople.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">No records match the current filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default OccupancyReport;