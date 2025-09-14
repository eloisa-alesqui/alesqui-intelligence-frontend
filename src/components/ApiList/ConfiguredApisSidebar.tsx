import React from 'react';
import { Server, Calendar, Users, Trash2, MessageSquare, Loader, Database } from 'lucide-react';
import { ApiDocument, ApiUtils } from '../../services/apiService'; // Import utils

// ================================================================================================
// PROPS DEFINITION
// ================================================================================================

interface ConfiguredApisSidebarProps {
    configuredApis: ApiDocument[];
    onDeleteApi: (apiId: string, apiName: string) => void;
    loading: boolean;
}

// ================================================================================================
// SUB-COMPONENTS for clarity
// ================================================================================================

const LoadingState: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-2">Loading Configured APIs...</p>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="text-center py-8 text-gray-500">
        <Database size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="font-semibold">No APIs configured yet</p>
        <p className="text-xs text-gray-400 mt-1">Complete the setup to see your APIs here.</p>
    </div>
);

const ApiCard: React.FC<{ api: ApiDocument; onDelete: (id: string, name: string) => void }> = ({ api, onDelete }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
        {/* API Header */}
        <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate" title={api.name}>{api.name}</h4>
                {api.version && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                        v{api.version}
                    </span>
                )}
            </div>
            <button
                onClick={() => onDelete(api.id!, api.name!)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                title={`Delete API: ${api.name}`}
            >
                <Trash2 size={16} />
            </button>
        </div>

        {/* Description */}
        {api.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{api.description}</p>
        )}

        {/* Metadata */}
        <div className="space-y-1 text-xs text-gray-500">
            {api.team && (
                <div className="flex items-center"><Users size={12} className="mr-1.5 flex-shrink-0" /><span className="truncate">{api.team}</span></div>
            )}
            {api.endpoints && (
                <div className="flex items-center"><Server size={12} className="mr-1.5 flex-shrink-0" /><span>{api.endpoints.length} endpoint{api.endpoints.length !== 1 ? 's' : ''}</span></div>
            )}
            <div className="flex items-center"><Calendar size={12} className="mr-1.5 flex-shrink-0" /><span>{ApiUtils.formatDate(api.createdAt)}</span></div>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-100">
            <button className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                <MessageSquare size={14} className="mr-1" />
                Chat with API
            </button>
        </div>
    </div>
);

// ================================================================================================
// MAIN COMPONENT
// ================================================================================================

/**
 * A sidebar component that displays a list of currently configured APIs.
 * It provides a quick overview and allows for actions like deleting an API.
 * It handles loading and empty states gracefully.
 */
const ConfiguredApisSidebar: React.FC<ConfiguredApisSidebarProps> = ({ configuredApis, onDeleteApi, loading }) => {

    const handleDeleteClick = (apiId: string, apiName: string) => {
        if (window.confirm(`Are you sure you want to delete the API "${apiName}"?`)) {
            onDeleteApi(apiId, apiName);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <LoadingState />;
        }
        if (configuredApis.length === 0) {
            return <EmptyState />;
        }
        return (
            <>
                <div className="space-y-4">
                    {configuredApis.map((api) => (
                        <ApiCard key={api.id} api={api} onDelete={handleDeleteClick} />
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Total: {configuredApis.length} API{configuredApis.length !== 1 ? 's' : ''} configured
                    </p>
                </div>
            </>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configured APIs ({loading ? '...' : configuredApis.length})
            </h3>
            {renderContent()}
        </div>
    );
};

export default ConfiguredApisSidebar;