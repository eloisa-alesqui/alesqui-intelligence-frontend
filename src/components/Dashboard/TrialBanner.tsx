import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { DashboardTrialInfo } from '../../types';

interface Props {
    trial: DashboardTrialInfo;
}

// Displays a contextual banner for trial-mode users.
// Renders a red "expired" variant when the trial has ended, or an amber
// "days remaining" variant while the trial is still active.
// The parent is responsible for only rendering this component when trial data exists.
const TrialBanner: React.FC<Props> = ({ trial }) => {
    // Expired state: red banner with a warning icon.
    if (trial.expired) {
        return (
            <div className="rounded-lg border bg-red-50 border-red-200 text-red-800 p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Your trial period has expired</span>
            </div>
        );
    }

    // Active trial state: amber banner showing the number of days remaining.
    return (
        <div className="rounded-lg border bg-amber-50 border-amber-200 text-amber-800 p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
                {trial.daysRemaining} days remaining in your trial period
            </span>
        </div>
    );
};

export default TrialBanner;
