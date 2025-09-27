import React, { useEffect, useState } from 'react';
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
        // Set state to the fetched data, or an empty array if data is null
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
      <div className="text-center mt-10 p-8">
        <FaSpinner className="animate-spin inline-block mr-2 text-pink-500 text-3xl" />
        <p className="text-gray-600 mt-2">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 p-4 bg-red-100/50 border border-red-400 rounded-lg max-w-lg mx-auto">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center border-b-2 border-pink-400 pb-2">
        My Notifications
      </h2>
      <NotificationsList notifications={notifications} />
    </motion.div>
  );
};

export default UserNotifications;