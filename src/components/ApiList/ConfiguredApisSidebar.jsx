import React from 'react';
import { Server, Calendar, Users, Trash2, MessageSquare } from 'lucide-react';

const ConfiguredApisSidebar = ({ configuredApis, onDeleteApi }) => {
    const formatDateTime = (timestamp) => {
        // Convertir timestamp a milisegundos (multiplicar por 1000)
        const date = new Date(timestamp * 1000);
        
        const pad = (n) => n.toString().padStart(2, '0');
        
        return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    };    

    const handleDeleteClick = (apiId, apiName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la API "${apiName}"?`)) {
            onDeleteApi(apiId);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configured APIs ({configuredApis.length})
            </h3>

            {configuredApis.length === 0 ? (
                <div className="text-center py-8">
                    <div className="h-12 w-12 text-gray-300 mx-auto mb-3 flex items-center justify-center">
                        <Server size={48} />
                    </div>
                    <p className="text-sm text-gray-500">
                        No APIs configured yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Complete the setup process to see your APIs here
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {configuredApis.map((api) => (
                        <div key={api.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            {/* API Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {api.name}
                                    </h4>
                                    {api.version && (
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                                            v{api.version}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(api.id, api.name)}
                                    className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                                    title="Delete API"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Description */}
                            {api.description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {api.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="space-y-1 text-xs text-gray-500">
                                {api.team && (
                                    <div className="flex items-center">
                                        <Users size={12} className="mr-1 flex-shrink-0" />
                                        <span className="truncate">{api.team}</span>
                                    </div>
                                )}

                                {api.endpoints && (
                                    <div className="flex items-center">
                                        <Server size={12} className="mr-1 flex-shrink-0" />
                                        <span>{api.endpoints.length} endpoint{api.endpoints.length !== 1 ? 's' : ''}</span>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <Calendar size={12} className="mr-1 flex-shrink-0" />
                                    <span>{formatDateTime(api.createdAt)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <button className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                                    <MessageSquare size={14} className="mr-1" />
                                    Chat with API
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {configuredApis.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Total: {configuredApis.length} API{configuredApis.length !== 1 ? 's' : ''} configured
                    </p>
                </div>
            )}
        </div>
    );
};

export default ConfiguredApisSidebar;