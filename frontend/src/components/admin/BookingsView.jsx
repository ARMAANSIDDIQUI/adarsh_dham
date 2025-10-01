import React, { useState, useEffect } from 'react';
import api from '../../api/api.js';
import { FaSpinner, FaDownload } from 'react-icons/fa';

const AllocationsView = ({ filters, dateFilterType, debouncedSearchTerm, pagination, setPagination }) => {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(null); // To show a spinner on the specific row

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
        filters.startDate, filters.endDate, filters.eventId, filters.buildingId, 
        dateFilterType, debouncedSearchTerm, pagination.currentPage, pagination.limit
    ]);

    // ✨ FIX: This function now uses the 'api' instance to include the login token.
    const handleDownloadBookingPdf = async (person) => {
        setIsDownloading(person._id); // Show spinner for this person
        try {
            // 1. Fetch the PDF as a binary 'blob' of data. This request is authenticated.
            const response = await api.get(`/bookings/pdf/${person.bookingId}`, {
                responseType: 'blob',
            });

            // 2. Create a temporary URL for the downloaded file data.
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // 3. Create a temporary link element to trigger the browser's download action.
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Booking-Pass-${person.bookingNumber}.pdf`); // Set the filename
            document.body.appendChild(link);
            
            // 4. "Click" the link to start the download.
            link.click();

            // 5. Clean up by removing the temporary link and URL.
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download PDF:", error);
            // You could show an error message to the user here.
        } finally {
            setIsDownloading(null); // Hide spinner
        }
    };

    return (
        <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-pink-100">
                    {/* ... table headers ... */}
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-8"><FaSpinner className="animate-spin text-pink-500 text-3xl mx-auto" /></td></tr>
                    ) : people.length > 0 ? (
                        people.map(person => (
                            <tr key={person._id} className="hover:bg-pink-50">
                                {/* ... other table cells (td) ... */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm align-top">
                                    <button 
                                        onClick={() => handleDownloadBookingPdf(person)} 
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50" 
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