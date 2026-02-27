import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api.js';
import { FaSpinner, FaDownload, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useGetPaginatedPeopleQuery } from '../../redux/api/apiSlice';

const AllocationsView = ({ filters, dateFilterType, debouncedSearchTerm, pagination, setPagination }) => {
    const [people, setPeople] = useState([]);
    const [isDownloading, setIsDownloading] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [sortDir, setSortDir] = useState('asc');

    const queryParams = useMemo(() => ({
        page: pagination.currentPage,
        limit: pagination.limit,
        startDate: filters.startDate,
        endDate: filters.endDate,
        eventId: filters.eventId,
        buildingId: filters.buildingId,
        roomId: filters.roomId,
        bedId: filters.bedId,
        gender: filters.gender,
        dateFilterType: dateFilterType,
        searchTerm: debouncedSearchTerm,
    }), [
        filters.startDate, filters.endDate, filters.eventId, filters.buildingId, filters.roomId, filters.bedId, filters.gender,
        dateFilterType, debouncedSearchTerm, pagination.currentPage, pagination.limit
    ]);

    const { data: paginatedData, isLoading: loading } = useGetPaginatedPeopleQuery(queryParams);

    useEffect(() => {
        if (paginatedData) {
            setPeople(paginatedData.data || []);
            setPagination(prev => ({ ...prev, ...paginatedData.pagination }));
        }
    }, [paginatedData, setPagination]);

    const handleDownloadBookingPdf = async (person) => {
        setIsDownloading(person._id);
        try {
            const res = await api.get(`/bookings/pdf/${person.bookingId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(
                new Blob([res.data], { type: 'application/pdf' })
            );

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Booking-Pass-${person.bookingNumber}.pdf`);
            document.body.appendChild(link);

            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download PDF:", error);
        } finally {
            setIsDownloading(null);
        }
    };

    const toggleSort = (column) => {
        if (sortBy === column) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const sortedPeople = useMemo(() => {
        if (!people || people.length === 0) return people;
        const sorted = [...people];
        sorted.sort((a, b) => {
            let aVal = '';
            let bVal = '';
            if (sortBy === 'name') {
                aVal = (a.name || '').toLowerCase();
                bVal = (b.name || '').toLowerCase();
            } else if (sortBy === 'room') {
                const aRoom = a.bedId?.roomId?.roomNumber || '';
                const bRoom = b.bedId?.roomId?.roomNumber || '';
                aVal = String(aRoom).padStart(10, '0');
                bVal = String(bRoom).padStart(10, '0');
            } else if (sortBy === 'stayFrom') {
                aVal = a.stayFrom ? new Date(a.stayFrom).getTime() : 0;
                bVal = b.stayFrom ? new Date(b.stayFrom).getTime() : 0;
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [people, sortBy, sortDir]);

    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <FaSort className="inline ml-1 text-gray-400 opacity-60" />;
        return sortDir === 'asc'
            ? <FaSortUp className="inline ml-1 text-primary" />
            : <FaSortDown className="inline ml-1 text-primary" />;
    };

    const thClass = "px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase select-none";
    const sortableThClass = `${thClass} cursor-pointer hover:text-primary transition-colors`;

    return (
        <div className="bg-card shadow-soft rounded-2xl overflow-x-auto font-body">
            <table className="min-w-full divide-y divide-background">
                <thead className="bg-background/50">
                    <tr>
                        <th
                            className={sortableThClass}
                            onClick={() => toggleSort('name')}
                            title="Sort by name"
                        >
                            Person Details <SortIcon col="name" />
                        </th>
                        <th className={thClass}>Booking Details</th>
                        <th className={thClass}>Event</th>
                        <th
                            className={sortableThClass}
                            onClick={() => toggleSort('stayFrom')}
                            title="Sort by stay from date"
                        >
                            Stay Dates <SortIcon col="stayFrom" />
                        </th>
                        <th
                            className={sortableThClass}
                            onClick={() => toggleSort('room')}
                            title="Sort by room number"
                        >
                            Allocation <SortIcon col="room" />
                        </th>
                        <th className={thClass}>Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-background">
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-8"><FaSpinner className="animate-spin text-primary text-3xl mx-auto" /></td></tr>
                    ) : sortedPeople.length > 0 ? (
                        sortedPeople.map(person => (
                            <tr key={person._id} className="hover:bg-background transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-semibold text-gray-800">{person.name}</p>
                                    <p className="text-gray-700">{person.gender}, Age: {person.age}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-mono text-gray-700">{person.bookingNumber}</p>
                                    <p className="text-gray-700">{person.city}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top text-gray-700">
                                    {person.eventId?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top text-gray-700">
                                    {new Date(person.stayFrom).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' })} - {new Date(person.stayTo).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top text-gray-700">
                                    <p className="font-semibold text-gray-800">{person.bedId?.roomId?.buildingId?.name}</p>
                                    <p>Room {person.bedId?.roomId?.roomNumber} / Bed {person.bedId?.name}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <button
                                        onClick={() => handleDownloadBookingPdf(person)}
                                        className="text-accent hover:text-primaryDark disabled:opacity-50 transition-colors"
                                        title="Download Full Booking PDF"
                                        disabled={isDownloading === person._id}
                                    >
                                        {isDownloading === person._id ? (
                                            <FaSpinner className="animate-spin" />
                                        ) : (
                                            <FaDownload size={18} />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="text-center py-8 text-gray-500">No people match the current filters.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AllocationsView;
