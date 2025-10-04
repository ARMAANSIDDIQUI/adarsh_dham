import React from 'react';
import { FaBell } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const NotificationsList = ({ notifications }) => {
    if (!notifications || notifications.length === 0) {
        return <p className="text-center text-gray-700 py-8 text-lg font-body">You have no notifications yet. Check back later!</p>;
    }

    return (
        <div className="space-y-4 font-body">
            {notifications.map(notification => (
                <div 
                    key={notification._id} 
                    className="bg-card p-4 md:p-5 rounded-2xl shadow-soft hover:shadow-accent transition-shadow duration-300 flex items-start space-x-4 border-l-4 border-primary"
                >
                    <div className="flex-shrink-0 p-3 bg-background rounded-full">
                        <FaBell className="text-primary text-xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-700 font-medium break-words text-base md:text-lg">
                            {notification.message}
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                            Received {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationsList;