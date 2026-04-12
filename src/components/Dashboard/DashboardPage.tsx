import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { DashboardSummaryResponse, TicketStats } from '../../types';
import { dashboardService } from '../../services/dashboardService';
import { diagnosticsService } from '../../services/diagnosticsService';
import { adminService } from '../../services/adminService';
import TrialBanner from './TrialBanner';
import WelcomeHeader from './WelcomeHeader';
import ActivitySummaryCards from './ActivitySummaryCards';
import RecentConversations from './RecentConversations';
import ApiListCard from './ApiListCard';
import AdminStatsCard from './AdminStatsCard';
import SupportStatsCard from './SupportStatsCard';

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<DashboardSummaryResponse | null>(null);
    const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
    const [auditStats, setAuditStats] = useState<Record<string, number> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summary, stats, myAuditStats] = await Promise.allSettled([
                dashboardService.getSummary(),
                diagnosticsService.getTicketStats(),
                adminService.getMyAuditStats(),
            ]);

            if (summary.status === 'fulfilled') {
                setData(summary.value);
            } else {
                throw summary.reason;
            }

            if (stats.status === 'fulfilled') {
                setTicketStats(stats.value);
            }

            if (myAuditStats.status === 'fulfilled') {
                setAuditStats(myAuditStats.value);
            }
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
            <div className="flex flex-col justify-center items-center h-64 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="text-sm text-gray-500 font-medium">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 ml-4">
                        <h4 className="font-bold">Failed to load dashboard</h4>
                        <p className="text-sm mt-0.5">{error}</p>
                    </div>
                    <button
                        onClick={fetchDashboard}
                        className="ml-4 px-4 py-2 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-800 rounded-xl transition-colors"
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
                <div className="animate-fade-in-up stagger-1">
                    <WelcomeHeader user={data.user} />
                </div>
                <div className="animate-fade-in-up stagger-2">
                    <ActivitySummaryCards activity={data.activity} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up stagger-3">
                    <RecentConversations />
                    <ApiListCard apis={data.apis} />
                </div>
                {data.admin && (
                    <div className="animate-fade-in-up stagger-4">
                        <AdminStatsCard admin={data.admin} auditStats={auditStats} />
                    </div>
                )}
                {data.support && (
                    <div className="animate-fade-in-up stagger-5">
                        <SupportStatsCard support={data.support} ticketStats={ticketStats} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
