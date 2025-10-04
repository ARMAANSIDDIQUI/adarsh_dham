import React, { useState, useEffect } from 'react';
import api from '../../api/api.js';
import { FaSpinner, FaDownload } from 'react-icons/fa';

const AllocationsView = ({ filters, dateFilterType, debouncedSearchTerm, pagination, setPagination }) => {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(null);

    useEffect(() => {
        const fetchPeople = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: pagination.currentPage,
                    limit: pagination.limit,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    eventId: filters.eventId,
                    buildingId: filters.buildingId,
                    gender: filters.gender,
                    dateFilterType: dateFilterType,
                    searchTerm: debouncedSearchTerm,
                });

                const res = await api.get(`/people/paginated?${params.toString()}`);
                setPeople(res.data.data || []);
                setPagination(prev => ({ ...prev, ...res.data.pagination }));
            } catch (error) {
                console.error("Failed to fetch people data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPeople();
    }, [
        filters.startDate, filters.endDate, filters.eventId, filters.buildingId, filters.gender,
        dateFilterType, debouncedSearchTerm, pagination.currentPage, pagination.limit
    ]);

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

    return (
        <div className="bg-card shadow-soft rounded-2xl overflow-x-auto font-body">
            <table className="min-w-full divide-y divide-background">
                <thead className="bg-background/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Person Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Booking Details</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Event</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Stay Dates</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Allocation</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold font-heading text-primaryDark uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-background">
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-8"><FaSpinner className="animate-spin text-primary text-3xl mx-auto" /></td></tr>
                    ) : people.length > 0 ? (
                        people.map(person => (
                            <tr key={person._id} className="hover:bg-background transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-semibold text-gray-800">{person.name}</p>
                                    <p className="text-gray-700">{person.gender}, Age: {person.age}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <p className="font-mono text-gray-700">{person.bookingNumber}</p>
                                    <p className="text-gray-700">{person.city}</p>
                                </td>
                                <td className="px-4 py-4 whitespace-now-wrap text-sm align-top text-gray-700">
                                    {person.eventId?.name || 'N/A'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top text-gray-700">
                                    {new Date(person.stayFrom).toLocaleDateString()} - {new Date(person.stayTo).toLocaleDateString()}
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