import React from 'react';
import { Link } from 'react-router-dom';
import { UserCog, Users, Database, Layers } from 'lucide-react';
import { DashboardAdminInfo } from '../../types';
import { useCountUp } from '../../hooks/useCountUp';
import AuditDoughnutChart from './AuditDoughnutChart';

interface Props {
    admin: DashboardAdminInfo;
    auditStats?: Record<string, number> | null;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    iconBg: string;
    iconColor: string;
    to: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, iconBg, iconColor, to }) => (
    <Link
        to={to}
        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 hover:bg-gray-100 transition-colors cursor-pointer"
    >
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg} ${iconColor}`}>
            {icon}
        </div>
        <div>
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
    </Link>
);

const USER_ACTIONS = [
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ACTIVATED',
    'USER_DEACTIVATED', 'USER_PASSWORD_CHANGED', 'USER_ROLES_CHANGED',
    'USER_ASSIGNED_TO_GROUP', 'USER_REMOVED_FROM_GROUP',
];
const USER_COLORS = [
    '#10b981', // USER_CREATED            → verde
    '#3b82f6', // USER_UPDATED            → azul
    '#ef4444', // USER_DELETED            → rojo
    '#14b8a6', // USER_ACTIVATED          → teal
    '#94a3b8', // USER_DEACTIVATED        → slate
    '#f59e0b', // USER_PASSWORD_CHANGED   → amber
    '#8b5cf6', // USER_ROLES_CHANGED      → violet
    '#38bdf8', // USER_ASSIGNED_TO_GROUP  → sky
    '#fb7185', // USER_REMOVED_FROM_GROUP → rose
];

const GROUP_ACTIONS = [
    'GROUP_CREATED', 'GROUP_UPDATED', 'GROUP_DELETED',
    'GROUP_USERS_ASSIGNED', 'GROUP_USER_REMOVED', 'GROUP_APIS_ASSIGNED', 'GROUP_API_REMOVED',
];
const GROUP_COLORS = [
    '#10b981', // GROUP_CREATED        → verde
    '#3b82f6', // GROUP_UPDATED        → azul
    '#ef4444', // GROUP_DELETED        → rojo
    '#38bdf8', // GROUP_USERS_ASSIGNED → sky
    '#fb7185', // GROUP_USER_REMOVED   → rose
    '#14b8a6', // GROUP_APIS_ASSIGNED  → teal
    '#f59e0b', // GROUP_API_REMOVED    → amber
];

const API_ACTIONS = [
    'API_CREATED', 'API_UPDATED', 'API_DELETED',
    'API_ASSIGNED_TO_GROUP', 'API_REMOVED_FROM_GROUP',
];
const API_COLORS = [
    '#10b981', // API_CREATED            → verde
    '#3b82f6', // API_UPDATED            → azul
    '#ef4444', // API_DELETED            → rojo
    '#38bdf8', // API_ASSIGNED_TO_GROUP  → sky
    '#fb7185', // API_REMOVED_FROM_GROUP → rose
];

const AdminStatsCard: React.FC<Props> = ({ admin, auditStats }) => {
    const totalUsers = useCountUp(admin.totalUsers);
    const totalApis = useCountUp(admin.totalApis);
    const totalGroups = useCountUp(admin.totalGroups);

    const actionCounts = auditStats ?? {};

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
                    <UserCog className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Administration</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatItem
                    icon={<Users className="w-4 h-4" />}
                    label="Users"
                    value={totalUsers}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    to="/admin/users"
                />
                <StatItem
                    icon={<Layers className="w-4 h-4" />}
                    label="Groups"
                    value={totalGroups}
                    iconBg="bg-violet-50"
                    iconColor="text-violet-600"
                    to="/admin/groups"
                />
                <StatItem
                    icon={<Database className="w-4 h-4" />}
                    label="APIs"
                    value={totalApis}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    to="/apis"
                />
            </div>

            {auditStats && (
                <>
                <p className="mt-3 mb-2 text-xs font-medium text-gray-500 text-center">Activity — Last 30 days</p>
                <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <AuditDoughnutChart
                            actionCounts={actionCounts}
                            actions={USER_ACTIONS}
                            colors={USER_COLORS}
                        />
                        <span className="text-[10px] font-medium text-gray-400">Users</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <AuditDoughnutChart
                            actionCounts={actionCounts}
                            actions={GROUP_ACTIONS}
                            colors={GROUP_COLORS}
                        />
                        <span className="text-[10px] font-medium text-gray-400">Groups</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-1">
                        <AuditDoughnutChart
                            actionCounts={actionCounts}
                            actions={API_ACTIONS}
                            colors={API_COLORS}
                        />
                        <span className="text-[10px] font-medium text-gray-400">APIs</span>
                    </div>
                </div>
                </>
            )}
        </div>
    );
};

export default AdminStatsCard;
