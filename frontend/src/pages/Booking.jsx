import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import BookingForm from '../components/user/BookingForm';
import api from '../api/api';
import Button from '../components/common/Button'; // Import the themed Button

const Booking = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit booking request.');
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
                    <h2 className="text-3xl font-bold font-heading text-accent mb-4">Booking Submitted!</h2>
                    <p className="text-gray-700">
                        Your accommodation request has been successfully submitted. Please check the **My Bookings** section for status updates.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => navigate('/calendar')} className="w-full bg-accent hover:bg-primaryDark text-white">
                            Go to Calendar
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral">
            {/* BookingForm component already contains the main theme styling */}
            <BookingForm onSubmit={handleSubmit} loading={loading} error={error} />
        </div>
    );
};

export default Booking;