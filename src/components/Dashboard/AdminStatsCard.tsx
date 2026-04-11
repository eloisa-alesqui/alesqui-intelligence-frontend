import React from 'react';
import { UserCog, Users, Database, Layers, Flag } from 'lucide-react';
import { DashboardAdminInfo } from '../../types';

interface Props {
    admin: DashboardAdminInfo;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    iconBg: string;
    iconColor: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, iconBg, iconColor }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const AdminStatsCard: React.FC<Props> = ({ admin }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
                    <UserCog className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Administration</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatItem
                    icon={<Users className="w-4 h-4" />}
                    label="Users"
                    value={admin.totalUsers}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatItem
                    icon={<Database className="w-4 h-4" />}
                    label="APIs"
                    value={admin.totalApis}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <StatItem
                    icon={<Layers className="w-4 h-4" />}
                    label="Groups"
                    value={admin.totalGroups}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                />
                <StatItem
                    icon={<Flag className="w-4 h-4" />}
                    label="Tickets"
                    value={admin.openTickets}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                />
            </div>
        </div>
    );
};

export default AdminStatsCard;
