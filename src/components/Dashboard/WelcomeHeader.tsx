import React from 'react';
import { DashboardUserInfo } from '../../types';

interface Props {
    user: DashboardUserInfo;
}

// Maps known role names to Tailwind color classes for the badge pills.
// Any role not listed here falls back to the neutral gray variant.
const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    user: 'bg-blue-100 text-blue-700',
    support: 'bg-green-100 text-green-700',
};

// Displays a greeting heading, the user's join date, and a row of role badges.
const WelcomeHeader: React.FC<Props> = ({ user }) => {
    // Format the ISO date string into a human-readable English locale date.
    const memberSince = new Date(user.memberSince * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.username}</h1>
            <p className="text-sm text-gray-600 mt-1">Member since {memberSince}</p>
            {/* Render one colored pill per role; unknown roles get the gray fallback */}
            <div className="flex flex-wrap gap-2 mt-3">
                {user.roles.map((role) => (
                    <span
                        key={role}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[role] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                        {role}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default WelcomeHeader;
