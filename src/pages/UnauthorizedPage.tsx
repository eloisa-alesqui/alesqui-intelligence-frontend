import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react'; // A fitting icon for this page

/**
 * UnauthorizedPage is displayed when a user is authenticated but lacks
 * the necessary roles or permissions to access a specific route.
 * This corresponds to a 403 Forbidden scenario.
 * It provides a clear message and a link to navigate back to a safe page.
 */
const UnauthorizedPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Access Denied
                    </h2>
                    <p className="mt-2 text-md text-gray-600">
                        You do not have the necessary permissions to view this page.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        If you believe this is an error, please contact your system administrator.
                    </p>
                </div>
                <div className="mt-8">
                    <Link
                        to="/" // Links to the homepage, which will redirect to a safe default
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;