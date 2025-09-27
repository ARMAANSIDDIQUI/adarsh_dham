import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api.js';
import BookingForm from '../../components/user/BookingForm';
import { FaSpinner } from 'react-icons/fa';

const EditBookingPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await api.get(`/bookings/${bookingId}`);
                setInitialData(res.data.formData);
            } catch (err) {
                setError('Failed to fetch booking data. It might not exist or you may not have permission.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handleUpdateSubmit = async (formData) => {
        setSubmitLoading(true);
        setError('');
        try {
            await api.put(`/bookings/update/${bookingId}`, { formData });
            navigate('/my-bookings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update booking.');
        } finally {
            setSubmitLoading(false);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-pink-500" /></div>;
    if (error && !initialData) return <div className="text-center mt-10 text-red-600">{error}</div>;

    return (
        <div>
            {initialData && (
                <BookingForm 
                    onSubmit={handleUpdateSubmit}
                    initialData={initialData}
                    loading={submitLoading}
                    error={error}
                    isEditing={true}
                />
            )}
        </div>
    );
};

export default EditBookingPage;