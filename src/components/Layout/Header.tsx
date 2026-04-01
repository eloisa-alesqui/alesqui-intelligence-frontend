import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Bot, FileText, Database, MessageCircle, User, LogOut, ShieldAlert, UserCog, Menu, X } from 'lucide-react';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMobileMenuOpen &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    // Navigation items with their required roles.
    // If an item has no 'roles' property, it's visible to all authenticated users.
    const navItems = [
        { id: 'setup', label: 'API Configuration', icon: FileText, to: '/setup', roles: ['ROLE_IT', 'ROLE_SUPERADMIN', 'ROLE_TRIAL'] },
        { id: 'apis', label: 'Configured APIs', icon: Database, to: '/apis', roles: ['ROLE_IT', 'ROLE_SUPERADMIN', 'ROLE_TRIAL'] },
        { id: 'diagnostics', label: 'Diagnostics', icon: ShieldAlert, to: '/diagnostics', roles: ['ROLE_IT', 'ROLE_SUPERADMIN', 'ROLE_TRIAL'] },
        { id: 'chat', label: 'Chat with APIs', icon: MessageCircle, to: '/chat' },
        { id: 'admin', label: 'Administration', icon: UserCog, to: '/admin/groups', roles: ['ROLE_SUPERADMIN'] }
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

    const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
        const baseClasses = "flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors";
        if (isActive) {
            return `${baseClasses} bg-blue-100 text-blue-700`;
        }
        return `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-100`;
    };

    return (
        <header className="bg-white shadow-sm border-b relative">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Side: Branding + Hamburger */}
                    <div className="flex items-center">
                        {/* Hamburger button - visible only on mobile */}
                        {visibleNavItems.length > 1 && (
                            <button
                                ref={hamburgerRef}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Toggle menu"
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        )}
                        <img src={logo} alt="Alesqui Intelligence Logo" className="h-10 sm:h-12 w-auto mr-2 sm:mr-3" />
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Alesqui Intelligence</h1>
                    </div>

                    {/* Center: Navigation Links - Hidden on mobile */}
                    {visibleNavItems.length > 1 && (
                        <nav className="hidden md:flex space-x-4">
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
                            <div className="hidden sm:flex items-center text-sm text-gray-600 border-r pr-4 mr-4">
                                <User className="h-5 w-5 mr-0 sm:mr-2 text-gray-400 flex-shrink-0" />
                                <span className="hidden sm:inline truncate max-w-[150px]">{user.sub}</span>
                            </div>
                        )}
                        <button
                            onClick={onLogout}
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Logout"
                            title="Logout"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu - Dropdown */}
            {isMobileMenuOpen && visibleNavItems.length > 1 && (
                <div
                    ref={mobileMenuRef}
                    className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50"
                >
                    <nav className="px-4 py-2 space-y-1">
                        {visibleNavItems.map(({ id, label, icon: Icon, to }) => (
                            <NavLink
                                key={id}
                                to={to}
                                className={getMobileNavLinkClass}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;