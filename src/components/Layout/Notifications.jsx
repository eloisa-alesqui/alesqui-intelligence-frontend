import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const Notifications = ({ notifications }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-lg max-w-sm ${notification.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    <div className="flex items-center">
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-sm">{notification.message}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Notifications;