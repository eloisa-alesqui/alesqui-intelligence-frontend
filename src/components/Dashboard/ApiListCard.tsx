import React from 'react';
import { Database } from 'lucide-react';
import { DashboardApiItem } from '../../types';

interface Props {
    apis: DashboardApiItem[];
}

const ApiListCard: React.FC<Props> = ({ apis }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                    <Database className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Available APIs</h2>
                {apis.length > 0 && (
                    <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                        {apis.length}
                    </span>
                )}
            </div>
            {apis.length === 0 ? (
                <div className="text-center py-6">
                    <Database className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No APIs available</p>
                </div>
            ) : (
                <ul className="space-y-1">
                    {apis.map((api) => (
                        <li
                            key={api.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                        >
                            <span
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ${
                                    api.active
                                        ? 'bg-emerald-500 ring-emerald-100'
                                        : 'bg-gray-300 ring-gray-100'
                                }`}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900">{api.name}</p>
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
