import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Notifications from './Notifications';
import { useAuth } from '../../context/AuthContext';

/**
 * AppLayout serves as the main visual shell for all authenticated pages.
 *
 * It provides a consistent structure, including the application header and
 * a main content area where child routes will be rendered.
 */
const AppLayout: React.FC = () => {
    // Fetch the current user and logout function from the global AuthContext.
    const { user, logout } = useAuth();

    // The notification state will be managed by its own context (see explanation below).

    return (
        <div className="min-h-screen bg-gray-50">
            {/* The Header is part of the consistent layout for all authenticated views. */}
            <Header user={user} onLogout={logout} />

            <Notifications />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5rem)]">
                {/* The <Outlet /> component from react-router-dom is a placeholder.
                  It renders the specific child route component that matches the current URL.
                  (e.g., <SetupTab />, <ApiList />, or <ChatTab />)
                */}
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;