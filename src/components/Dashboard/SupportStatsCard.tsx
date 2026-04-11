import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Flag } from 'lucide-react';
import { DashboardSupportInfo, TicketStats } from '../../types';
import { useCountUp } from '../../hooks/useCountUp';
import TicketStatsChart from './TicketStatsChart';

interface Props {
    support: DashboardSupportInfo;
    ticketStats?: TicketStats | null;
}

const SupportStatsCard: React.FC<Props> = ({ support, ticketStats }) => {
    const openTickets = useCountUp(support.openTickets);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600">
                    <ShieldAlert className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Support</h2>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50 text-amber-600">
                        <Flag className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-xs font-medium text-gray-500">Open tickets</span>
                        <p className="text-xl font-bold text-gray-900">{openTickets}</p>
                    </div>
                </div>
                <Link
                    to="/diagnostics"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium group"
                >
                    View diagnostics
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
                </Link>
            </div>
            {ticketStats && (ticketStats.reportedByUser + ticketStats.errorProcessing + ticketStats.underReview + ticketStats.resolved) > 0 && (
                <div className="mt-5">
                    <p className="text-xs font-medium text-gray-500 mb-3">Tickets — Last 30 days</p>
                    <TicketStatsChart stats={ticketStats} />
                </div>
            )}
        </div>
    );
};

export default SupportStatsCard;
