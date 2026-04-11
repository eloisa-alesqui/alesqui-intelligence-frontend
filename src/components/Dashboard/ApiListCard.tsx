import React from 'react';
import { Database } from 'lucide-react';
import { DashboardApiItem } from '../../types';

interface Props {
    apis: DashboardApiItem[];
}

// Lists the APIs available to the current user.
// Each row shows an active/inactive status dot, the API name, and a
// single-line truncated description. Renders an empty-state message when
// the apis array is empty.
const ApiListCard: React.FC<Props> = ({ apis }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
                <Database className="w-5 h-5" />
                <h2 className="text-base font-semibold">Available APIs</h2>
            </div>
            {apis.length === 0 ? (
                // Empty state shown when the user has no APIs assigned.
                <p className="text-sm text-gray-400">No APIs available</p>
            ) : (
                <ul className="space-y-3">
                    {apis.map((api) => (
                        <li key={api.id} className="flex items-center gap-3">
                            {/* Green dot = active, gray dot = inactive */}
                            <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${api.active ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">{api.name}</p>
                                {/* line-clamp-1 prevents long descriptions from overflowing */}
                                <p className="text-xs text-gray-500 line-clamp-1">{api.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ApiListCard;
