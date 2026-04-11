import React from 'react';
import { MessageCircle, MessageSquare, BarChart3, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DashboardActivityInfo } from '../../types';

interface Props {
    activity: DashboardActivityInfo;
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    iconBg: string;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, iconBg, iconColor }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
    </div>
);

const ActivitySummaryCards: React.FC<Props> = ({ activity }) => {
    const lastActivityValue = activity.lastConversation
        ? formatDistanceToNow(new Date(activity.lastConversation.lastUpdated * 1000), { addSuffix: true })
        : 'No recent activity';

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={<MessageCircle className="w-5 h-5" />}
                label="Conversations"
                value={activity.totalConversations}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
            />
            <StatCard
                icon={<MessageSquare className="w-5 h-5" />}
                label="Total messages"
                value={activity.totalMessages}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
            />
            <StatCard
                icon={<BarChart3 className="w-5 h-5" />}
                label="Generated charts"
                value={activity.chartsGenerated}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
            />
            <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Last activity"
                value={
                    <span className="text-lg font-semibold text-gray-700">
                        {lastActivityValue}
                    </span>
                }
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
            />
        </div>
    );
};

export default ActivitySummaryCards;
