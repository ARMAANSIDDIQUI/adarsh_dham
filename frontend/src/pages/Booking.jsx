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
        className="container mx-auto p-6 md:p-10 flex flex-col items-center justify-center min-h-screen "
      >
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md border-t-4 border-green-500">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Booking Submitted!</h2>
          <p className="text-gray-700">
            Your accommodation request has been successfully submitted. Please check the **My Bookings** section for status updates.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/calendar')} className="w-full">
              Go to Calendar
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-10 flex items-center justify-center min-h-screen">
      {/* BookingForm component already contains the main theme styling */}
      <BookingForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
};

export default Booking;
