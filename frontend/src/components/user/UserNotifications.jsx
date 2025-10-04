import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import NotificationsList from '../shared/NotificationsList.jsx';
import { FaSpinner } from 'react-icons/fa';

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data || []);
            } catch (err) {
                setError('Failed to fetch notifications.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchNotifications();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral font-body">
                <div className="text-center">
                    <FaSpinner className="animate-spin inline-block mr-2 text-primary text-3xl" />
                    <p className="text-gray-700 mt-2">Loading notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-neutral min-h-screen">
                <div className="text-center mt-10 p-4 bg-highlight/10 border border-highlight/20 rounded-xl max-w-lg mx-auto shadow-soft">
                    <p className="text-highlight font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-6 md:p-10 max-w-4xl mx-auto font-body bg-neutral min-h-screen"
        >
            <h2 className="text-3xl font-bold font-heading mb-6 text-primaryDark text-center border-b-2 border-primary pb-2">
                My Notifications
            </h2>
            <NotificationsList notifications={notifications} />
        </motion.div>
    );
};

export default UserNotifications;