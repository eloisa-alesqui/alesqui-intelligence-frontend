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
}

// Generic stat tile used for each metric in the summary grid.
const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
    <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-2 text-gray-600">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
);

// Renders a 4-column grid summarising the user's platform activity:
// total conversations, messages, generated charts, and time since last activity.
const ActivitySummaryCards: React.FC<Props> = ({ activity }) => {
    // Show a relative timestamp (e.g. "3 days ago") when a last conversation exists,
    // otherwise fall back to a neutral placeholder string.
    const lastActivityValue = activity.lastConversation
        ? formatDistanceToNow(new Date(activity.lastConversation.lastUpdated * 1000), { addSuffix: true })
        : 'No recent activity';

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
                icon={<MessageCircle className="w-5 h-5" />}
                label="Conversations"
                value={activity.totalConversations}
            />
            <StatCard
                icon={<MessageSquare className="w-5 h-5" />}
                label="Total messages"
                value={activity.totalMessages}
            />
            <StatCard
                icon={<BarChart3 className="w-5 h-5" />}
                label="Generated charts"
                value={activity.chartsGenerated}
            />
            <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Last activity"
                value={
                    <span className="text-base font-semibold">
                        {lastActivityValue}
                    </span>
                }
            />
        </div>
    );
};

export default ActivitySummaryCards;
