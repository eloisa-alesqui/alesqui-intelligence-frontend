import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react';

// Define the shape of a single notification object.
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

// Define the shape of the context value.
interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: NotificationType) => void;
}

// Create the context.
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Define props for the provider.
interface NotificationProviderProps {
    children: ReactNode;
}

/**
 * The NotificationProvider component manages the global state for notifications.
 * It provides a list of active notifications and a function to add new ones.
 * Notifications are automatically removed after a timeout.
 */
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    /**
     * Adds a new notification to the list.
     * The notification will be automatically dismissed after a 5-second timeout.
     * Using useCallback to memoize the function for performance.
     */
    const addNotification = useCallback((message: string, type: NotificationType = 'success') => {
        const id = Date.now();
        const newNotification: Notification = { id, message, type };

        setNotifications(prevNotifications => [...prevNotifications, newNotification]);

        // Automatically remove the notification after 5 seconds
        setTimeout(() => {
            setNotifications(prevNotifications =>
                prevNotifications.filter(n => n.id !== id)
            );
        }, 5000);
    }, []);
    
    // Memoize the context value to prevent unnecessary re-renders in consumers.
    const contextValue = useMemo(() => ({
        notifications,
        addNotification,
    }), [notifications, addNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * Custom hook for consuming the NotificationContext easily and safely.
 * @returns {NotificationContextType} The notification context value.
 */
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};