import React from 'react';
import { Sparkles } from 'lucide-react';
import { DashboardUserInfo } from '../../types';

interface Props {
    user: DashboardUserInfo;
}

const roleColors: Record<string, string> = {
    admin: 'bg-white/20 text-white border border-white/30',
    user: 'bg-white/20 text-white border border-white/30',
    support: 'bg-white/20 text-white border border-white/30',
};

const WelcomeHeader: React.FC<Props> = ({ user }) => {
    const memberSince = new Date(user.memberSince * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-lg">
            {/* Decorative background circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        Welcome, {user.username}
                    </h1>
                </div>
                <p className="text-blue-100 text-sm sm:text-base ml-[52px]">
                    Member since {memberSince}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 ml-[52px]">
                    {user.roles.map((role) => (
                        <span
                            key={role}
                            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${roleColors[role] ?? 'bg-white/20 text-white border border-white/30'}`}
                        >
                            {role}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WelcomeHeader;
