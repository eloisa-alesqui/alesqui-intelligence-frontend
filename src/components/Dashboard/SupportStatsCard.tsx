import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import { DashboardSupportInfo } from '../../types';

interface Props {
    support: DashboardSupportInfo;
}

// Support-role card showing the current count of open tickets and a link
// to the diagnostics page. Rendered only when the user has the "support" role.
const SupportStatsCard: React.FC<Props> = ({ support }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-900">
                <Headphones className="w-5 h-5" />
                <h2 className="text-base font-semibold">Support</h2>
            </div>
            <p className="text-sm text-gray-600">
                Open tickets:{' '}
                <span className="font-bold text-gray-900">{support.openTickets}</span>
            </p>
            {/* Router link to the diagnostics page for further ticket management */}
            <Link
                to="/diagnostics"
                className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
                View diagnostics →
            </Link>
        </div>
    );
};

export default SupportStatsCard;
