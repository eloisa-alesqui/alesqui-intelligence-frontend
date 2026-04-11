import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { DashboardTrialInfo } from '../../types';

interface Props {
    trial: DashboardTrialInfo;
}

const TrialBanner: React.FC<Props> = ({ trial }) => {
    if (trial.expired) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-100 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Your trial period has expired</span>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 flex-shrink-0">
                <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold">
                {trial.daysRemaining} days remaining in your trial period
            </span>
        </div>
    );
};

export default TrialBanner;
