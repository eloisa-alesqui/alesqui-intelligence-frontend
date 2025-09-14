import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, NotificationType, Notification } from '../../context/NotificationContext';

// Helper object to map notification types to styles and icons
const notificationStyles = {
    success: {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />,
    },
    error: {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />,
    },
    warning: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />,
    },
    info: {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: <Info className="w-5 h-5 mr-2 flex-shrink-0" />,
    }
};

/**
 * A component that displays a list of global notifications (toasts).
 * It consumes the NotificationContext to get the list of active notifications.
 */
const Notifications: React.FC = () => {

    const { notifications } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {notifications.map((notification: Notification) => {
                const styles = notificationStyles[notification.type] || notificationStyles.info;
                return (
                    <div
                        key={notification.id}
                        className={`p-4 rounded-lg shadow-lg max-w-sm flex items-center ${styles.bg} ${styles.text} ${styles.border}`}
                    >
                        {styles.icon}
                        <span className="text-sm">{notification.message}</span>
                    </div>
                )
            })}
        </div>
    );
};

export default Notifications;