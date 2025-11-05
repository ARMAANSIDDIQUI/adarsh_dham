import React, { useState } from 'react'; // --- Added useState ---
import { useDispatch } from 'react-redux';
import { markOneAsRead } from '../../redux/slices/notificationSlice';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const NotificationsList = ({ notifications, onMarkAsRead }) => {
    const dispatch = useDispatch();
    // --- NEW LOADING STATE ---
    // This will track the ID of the notification we are currently marking as read
    const [loadingId, setLoadingId] = useState(null);
    // --- END NEW LOADING STATE ---

    const handleMarkReadClick = async (id) => {
        // 1. Set loading state for this specific button
        setLoadingId(id);

        const resultAction = await dispatch(markOneAsRead(id));

        // 2. If successful, call the parent's handler
        if (markOneAsRead.fulfilled.match(resultAction)) {
            onMarkAsRead(resultAction.payload);
        } else {
            console.error("Failed to mark notification as read");
        }
        
        // 3. Clear loading state regardless of outcome
        setLoadingId(null);
    };

    if (!notifications || notifications.length === 0) {
        return <p className="text-center text-gray-700 py-8 text-lg font-body">You have no notifications yet. Check back later!</p>;
    }

    return (
        <div className="space-y-4 font-body">
            {notifications.map((notification) => (
                <div 
                    key={notification._id} 
                    className={`p-4 md:p-5 rounded-2xl shadow-soft hover:shadow-accent transition-all duration-300 flex items-start space-x-4 border-l-4 ${
                        notification.read 
                          ? 'bg-background border-transparent' 
                          : 'bg-card border-primary'
                    }`}
                >
                    <div className="flex-shrink-0 p-3 bg-background rounded-full">
                        {notification.read ? (
                            <FaCheckCircle className="text-green-500 text-xl" />
                        ) : (
                            <FaBell className="text-primary text-xl" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`break-words text-base md:text-lg ${
                            notification.read
                              ? 'text-gray-500 font-normal'
                              : 'text-gray-700 font-medium'
                        }`}>
                            {notification.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                            notification.read ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                            Received {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>

                    {/* --- UPDATED BUTTON WITH LOADING STATE --- */}
                    {!notification.read && (
                        <button 
                            onClick={() => handleMarkReadClick(notification._id)}
                            // Disable the button if it's the one being loaded
                            disabled={loadingId === notification._id} 
                            className="flex-shrink-0 text-xs text-primary hover:underline whitespace-nowrap disabled:text-gray-400 disabled:no-underline"
                            title="Mark as read"
                        >
                            {/* Show "Marking..." if it's loading */}
                            {loadingId === notification._id ? 'Marking...' : 'Mark as Read'}
                        </button>
                    )}
                    {/* --- END UPDATED BUTTON --- */}

                </div>
            ))}
        </div>
    );
};

export default NotificationsList;