import React, { useState } from 'react';
import { FaKey, FaSpinner, FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Simplified Button Component
const Button = ({ onClick, disabled, className, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`
            flex items-center justify-center
            transition-all duration-200 
            font-semibold rounded-lg 
            shadow-md 
            ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'hover:shadow-lg'}
            ${className}
        `}
    >
        {children}
    </button>
);

const RequestPasswordChange = () => {
    const [requestStatus, setRequestStatus] = useState('idle'); // idle, loading, success, error

    const handlePasswordChangeRequest = async () => {
        setRequestStatus('loading');
        try {
            const token = localStorage.getItem('token'); // JWT token
            if (!token) throw new Error('User not authenticated');

            const response = await fetch('/api/admin/request-password-change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) throw new Error('Request failed');

            setRequestStatus('success');
            setTimeout(() => setRequestStatus('idle'), 5000);
        } catch (err) {
            console.error(err);
            setRequestStatus('error');
            setTimeout(() => setRequestStatus('idle'), 5000);
        }
    };

    const renderMessage = () => {
        switch (requestStatus) {
            case 'loading':
                return (
                    <p className="mt-4 text-pink-500 flex items-center">
                        <FaSpinner className="animate-spin mr-2" /> Sending request to administrators...
                    </p>
                );
            case 'success':
                return (
                    <p className="mt-4 text-green-600 font-semibold flex items-center">
                        <FaCheck className="mr-2" /> Your request has been sent successfully!
                    </p>
                );
            case 'error':
                return (
                    <p className="mt-4 text-red-600 font-semibold flex items-center">
                        <FaTimes className="mr-2" /> Failed to send request. Please ensure you are logged in or contact support.
                    </p>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 max-w-lg mx-auto"
        >
            <div className="mt-8 p-6 bg-white rounded-xl shadow-2xl border-t-4 border-pink-500">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaKey className="mr-3 text-pink-500" /> Password Assistance
                </h3>
                <p className="text-gray-600 mb-6">
                    To maintain security, password changes are handled by an administrator. Click the button below to notify the team that you require a password reset.
                </p>
                
                <Button
                    onClick={handlePasswordChangeRequest}
                    disabled={requestStatus === 'loading' || requestStatus === 'success'}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-3 shadow-lg"
                >
                    <FaBell className="inline-block mr-2" /> Notify Admin for Password Reset
                </Button>

                {renderMessage()}
            </div>
        </motion.div>
    );
};

export default RequestPasswordChange;
