import { Flag, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

/**
 * Defines the shared configuration for all ticket statuses,
 * including labels, icons, and CSS classes.
 */
export const allStatuses = [
    { 
        id: 'REPORTED_BY_USER', 
        label: 'Reported by User', 
        icon: Flag, 
        badgeClasses: "bg-red-100 text-red-800",
        unselectedClasses: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        selectedClasses: "bg-red-600 text-white border-red-600"
    },
    { 
        id: 'ERROR_PROCESSING', 
        label: 'Automatic Error', 
        icon: AlertCircle, 
        badgeClasses: "bg-yellow-100 text-yellow-800",
        unselectedClasses: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        selectedClasses: "bg-yellow-500 text-white border-yellow-500"
    },
    { 
        id: 'UNDER_REVIEW', 
        label: 'Under Review', 
        icon: Loader2, 
        badgeClasses: "bg-blue-100 text-blue-800",
        unselectedClasses: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
        selectedClasses: "bg-blue-600 text-white border-blue-600"
    },
    { 
        id: 'RESOLVED', 
        label: 'Resolved', 
        icon: CheckCircle, 
        badgeClasses: "bg-green-100 text-green-800",
        unselectedClasses: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        selectedClasses: "bg-green-600 text-white border-green-600"
    },
];

// A simple type for the status IDs
export type TicketStatus = 'REPORTED_BY_USER' | 'ERROR_PROCESSING' | 'UNDER_REVIEW' | 'RESOLVED';