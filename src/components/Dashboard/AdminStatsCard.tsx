import React from 'react';
import { Shield, Users, Database, FolderOpen, AlertCircle } from 'lucide-react';
import { DashboardAdminInfo } from '../../types';

interface Props {
    admin: DashboardAdminInfo;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
}

// Small presentational tile for a single platform-wide metric.
const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-gray-600">
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </div>
        <span className="text-xl font-bold text-gray-900">{value}</span>
    </div>
);

// Admin-only card showing platform-wide totals: users, APIs, groups, and open tickets.
// Rendered only when the authenticated user has the "admin" role.
const AdminStatsCard: React.FC<Props> = ({ admin }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
                <Shield className="w-5 h-5" />
                <h2 className="text-base font-semibold">Administration</h2>
            </div>
            {/* 2×2 grid: users | APIs / groups | tickets */}
            <div className="grid grid-cols-2 gap-4">
                <StatItem icon={<Users className="w-4 h-4" />} label="Users" value={admin.totalUsers} />
                <StatItem icon={<Database className="w-4 h-4" />} label="APIs" value={admin.totalApis} />
                <StatItem icon={<FolderOpen className="w-4 h-4" />} label="Groups" value={admin.totalGroups} />
                <StatItem icon={<AlertCircle className="w-4 h-4" />} label="Tickets" value={admin.openTickets} />
            </div>
        </div>
    );
};

export default AdminStatsCard;
