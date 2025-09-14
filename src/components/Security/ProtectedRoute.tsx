import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Defines the props for the ProtectedRoute component.
 */
interface ProtectedRouteProps {
    /**
     * An optional array of role strings. If provided, the user must have at least
     * one of these roles to access the route.
     * Example: ['ROLE_IT', 'ROLE_BUSINESS']
     */
    roles?: string[];
}

/**
 * A component that acts as a guard for routes in the application.
 *
 * It checks for two conditions:
 * 1. Is the user authenticated? If not, it redirects to the /login page.
 * 2. Does the route require specific roles? If so, it checks if the authenticated
 * user has at least one of the required roles. If not, it redirects to an
 * /unauthorized page.
 *
 * If all checks pass, it renders the child route using the <Outlet /> component
 * from react-router-dom.
 *
 * @param {ProtectedRouteProps} props - The props for the component.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
    // Get the current authentication state and user data from the AuthContext.
    const { isAuthenticated, user } = useAuth();

    // Check 1: User Authentication
    if (!isAuthenticated) {
        // If the user is not logged in, redirect them to the login page.
        // The 'replace' prop is used to replace the current entry in the history stack,
        // so the user doesn't get stuck in a loop if they press the back button.
        return <Navigate to="/login" replace />;
    }

    // Check 2: User Authorization (Role-based access)
    // This check only runs if the 'roles' prop is provided for the route.
    if (roles && roles.length > 0) {
        // We safely check if the user object and its roles array exist.
        const userHasRequiredRole = user?.authorities?.some(authority => roles.includes(authority));

        if (!userHasRequiredRole) {
            // If the user does not have any of the required roles, redirect them.
            // It's good practice to have a dedicated "/unauthorized" page to show a
            // "403 Forbidden" style message.
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // If all checks pass, render the nested child route.
    return <Outlet />;
};

export default ProtectedRoute;