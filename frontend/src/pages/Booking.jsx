import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import BookingForm from '../components/user/BookingForm';
import api from '../api/api';
import Button from '../components/common/Button'; 
import { toast } from 'react-toastify';
import { useTranslation } from '../hooks/useTranslation';

const Booking = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const t = useTranslation();

    if (!isAuthenticated) {
        navigate(`/login`, { state: { from: `/booking/${eventId}` } });
        return null;
    }

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/bookings', { eventId, formData });
            setSuccess(true);
            toast.success(t.booking.submitSuccess);
        } catch (err) {
            setError(err.response?.data?.message || t.booking.submitError);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="container mx-auto p-6 md:p-10 flex flex-col items-center justify-center min-h-screen bg-neutral font-body"
            >
                <div className="bg-card p-10 rounded-2xl shadow-soft text-center max-w-md border-t-4 border-accent">
                    <h2 className="text-3xl font-bold font-heading text-accent mb-4">{t.booking.submittedTitle}</h2>
                    <p className="text-gray-700">
                        {t.booking.submittedDesc}
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/calendar')} className="w-full bg-accent hover:bg-primaryDark text-white">
                            {t.booking.goToCalendar}
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral">
            <BookingForm onSubmit={handleSubmit} loading={loading} error={error} />
        </div>
    );
};

export default Booking;