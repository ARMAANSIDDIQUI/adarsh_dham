import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/api.js';
import NotificationsList from '../shared/NotificationsList.jsx';
import { FaSpinner } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { markAllAsRead } from '../../redux/slices/notificationSlice.js';
import { useTranslation } from '../../hooks/useTranslation';

const UserNotifications = () => {
    const t = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data || []);
            } catch (err) {
                setError(t.notifications.fetchFail);
            } finally {
                setLoading(false);
            }
        };
        
        fetchNotifications();
    }, [dispatch, t.notifications.fetchFail]); 

    const handleMarkOneAsRead = (updatedNotification) => {
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === updatedNotification._id
            ? updatedNotification
            : notification
        )
      );
    };

    const handleMarkAllAsReadClick = async () => {
        setIsMarkingAll(true);
        const resultAction = await dispatch(markAllAsRead());
        
        if (markAllAsRead.fulfilled.match(resultAction)) {
            setNotifications(prev => 
                prev.map(n => n.read ? n : { ...n, read: true })
            );
        } else {
            console.error("Failed to mark all as read");
        }
        setIsMarkingAll(false);
    };

    const areAnyUnread = notifications.some(n => !n.read);

    // --- NEW SORTING LOGIC ---
    // We create a new sorted array.
    // .sort((a, b) => a.read - b.read)
    // `a.read` (false) is 0
    // `b.read` (true) is 1
    // `0 - 1 = -1` (a, the unread item, comes first)
    const sortedNotifications = [...notifications].sort((a, b) => a.read - b.read);
    // --- END NEW SORTING LOGIC ---


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral font-body">
                <div className="text-center">
                    <FaSpinner className="animate-spin inline-block mr-2 text-primary text-3xl" />
                    <p className="text-gray-700 mt-2">{t.notifications.loading}</p>
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
            <div className="flex flex-col relative items-center justify-center mb-6">
              <h2 className="text-3xl font-bold font-heading text-primaryDark border-b-2 border-primary pb-2 text-center">
                  {t.notifications.title}
              </h2>
              {areAnyUnread && (
                <button 
                  onClick={handleMarkAllAsReadClick}
                  disabled={isMarkingAll} 
                  className="mt-4 md:absolute md:right-0 md:mt-0 text-sm font-medium text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {isMarkingAll ? t.notifications.markingAll : t.notifications.markAll}
                </button>
              )}
            </div>
            
            <NotificationsList 
              // --- PASS THE SORTED ARRAY INSTEAD ---
              notifications={sortedNotifications} 
              onMarkAsRead={handleMarkOneAsRead} 
            />
        </motion.div>
    );
};

export default UserNotifications;