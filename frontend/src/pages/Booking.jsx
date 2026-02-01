import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import BookingForm from '../components/user/BookingForm';
import api from '../api/api';
import SuccessModal from '../components/common/SuccessModal';
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
            // toast.success(t.booking.submitSuccess); // Replaced by Modal
        } catch (err) {
            setError(err.response?.data?.message || t.booking.submitError);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSuccess(false);
        navigate('/calendar');
    };

    return (
        <div className="min-h-screen bg-neutral relative">
            <SuccessModal
                isOpen={success}
                onClose={handleCloseModal}
                title={t.booking.submittedTitle}
                message={t.booking.submittedDesc}
            />
            <div className={success ? "opacity-50 pointer-events-none filter blur-sm transition-all duration-300" : ""}>
                <BookingForm onSubmit={handleSubmit} loading={loading} error={error} />
            </div>
        </div>
    );
};

export default Booking;