import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, FileText, Database, MessageCircle, User, LogOut, ShieldAlert } from 'lucide-react';
import logo from '../../assets/logo.png'; 

// TypeScript types for the component's props.
// We expect the user object from the AuthContext and the logout function.
interface UserPayload {
    sub: string; // 'sub' is the standard JWT claim for the subject (username)
    authorities: string[];
}

interface HeaderProps {
    user: UserPayload | null;
    onLogout: () => void;
}

/**
 * The main application header component.
 *
 * It displays the application branding, primary navigation links,
 * and user-specific controls like the current username and a logout button.
 * The navigation menu is now conditionally rendered based on the number of
 * accessible items for the user.
 */
const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
    
    // Navigation items with their required roles.
    // If an item has no 'roles' property, it's visible to all authenticated users.
    const navItems = [
        { id: 'setup', label: 'API Configuration', icon: FileText, to: '/setup', roles: ['ROLE_IT'] },
        { id: 'apis', label: 'Configured APIs', icon: Database, to: '/apis', roles: ['ROLE_IT'] },
        { id: 'diagnostics', label: 'Diagnostics', icon: ShieldAlert, to: '/diagnostics', roles: ['ROLE_IT'] },
        { id: 'chat', label: 'Chat with APIs', icon: MessageCircle, to: '/chat' }
    ];

    // Filter the navigation items based on the user's roles.
    const visibleNavItems = navItems.filter(item => {
        // If the nav item doesn't require any specific roles, show it.
        if (!item.roles) {
            return true;
        }
        // If it requires roles, check if the user object exists and if the user's roles
        // array contains at least one of the required roles.
        return user?.authorities?.some(authority => item.roles.includes(authority)) ?? false;
    });

    /**
     * A function to dynamically determine the CSS classes for a NavLink.
     * react-router-dom provides the 'isActive' boolean, which we use to apply
     * different styles for the currently active page.
     * @param {object} props - The props provided by NavLink.
     * @param {boolean} props.isActive - Whether the link corresponds to the current URL.
     * @returns A string of CSS classes.
     */
    const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
        const baseClasses = "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
        if (isActive) {
            return `${baseClasses} bg-blue-100 text-blue-700`;
        }
        return `${baseClasses} text-gray-500 hover:text-gray-700 hover:bg-gray-100`;
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Side: Branding */}
                    <div className="flex items-center">
                        <img src={logo} alt="Alesqui Intelligence Logo" className="h-12 w-auto mr-3" />
                        <h1 className="text-2xl font-bold text-gray-900">Alesqui Intelligence</h1>
                    </div>

                    {/* Center: Navigation Links - Only show if there's more than one item */}
                    {visibleNavItems.length > 1 && (
                        <nav className="flex space-x-4">
                            {visibleNavItems.map(({ id, label, icon: Icon, to }) => (
                                <NavLink
                                    key={id}
                                    to={to}
                                    className={getNavLinkClass}
                                >
                                    <Icon className="w-4 h-4 inline mr-2" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                    )}

                    {/* Right Side: User Info and Logout */}
                    <div className="flex items-center">
                        {user && (
                            <div className="flex items-center text-sm text-gray-600 border-r pr-4 mr-4">
                                <User className="h-5 w-5 mr-2 text-gray-400" />
                                <span>{user.sub}</span> {/* Display the username from the JWT. */}
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;