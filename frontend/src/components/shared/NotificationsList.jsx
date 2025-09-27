import React from 'react';
import { FaBell } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const NotificationsList = ({ notifications }) => {
    if (!notifications || notifications.length === 0) {
        return <p className="text-center text-gray-500 py-8 text-lg">You have no notifications yet. Check back later!</p>;
    }

    return (
        <div className="space-y-4">
            {notifications.map(notification => (
                <div 
                    key={notification._id} 
                    className="bg-white p-4 md:p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4 border-l-4 border-pink-400"
                >
                    <div className="flex-shrink-0 p-2 bg-pink-100 rounded-full">
                        <FaBell className="text-pink-500 text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium break-words text-base md:text-lg">
                            {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {/* This line calculates and displays the "time ago" */}
                            Received {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationsList;
