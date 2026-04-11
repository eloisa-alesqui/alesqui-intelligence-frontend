import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { DashboardSummaryResponse } from '../../types';
import { dashboardService } from '../../services/dashboardService';
import TrialBanner from './TrialBanner';
import WelcomeHeader from './WelcomeHeader';
import ActivitySummaryCards from './ActivitySummaryCards';
import QuickActions from './QuickActions';
import ApiListCard from './ApiListCard';
import AdminStatsCard from './AdminStatsCard';
import SupportStatsCard from './SupportStatsCard';

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardSummaryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await dashboardService.getSummary();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-bold">Failed to load dashboard</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={fetchDashboard}
                        className="ml-4 px-3 py-1.5 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="overflow-y-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {data.trial && <TrialBanner trial={data.trial} />}
                <WelcomeHeader user={data.user} />
                <ActivitySummaryCards activity={data.activity} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <QuickActions lastConversation={data.activity.lastConversation} />
                    <ApiListCard apis={data.apis} />
                </div>
                {data.admin && <AdminStatsCard admin={data.admin} />}
                {data.support && <SupportStatsCard support={data.support} />}
            </div>
        </div>
    );
};

export default DashboardPage;
