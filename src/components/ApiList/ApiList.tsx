import React, { useState, useEffect } from 'react';
import { apiService, ApiDocument } from '../../services/apiService';
import { Search, Server, Calendar, Users, Eye, Settings } from 'lucide-react';

const ApiList: React.FC = () => {
    const [apis, setApis] = useState<ApiDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadApis();
    }, []);

    const loadApis = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllApisSimple();
            setApis(data);
            setError(null);
        } catch (err) {
            setError('Error loading APIs. Please try again.');
            console.error('Error loading APIs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredApis = apis.filter(api =>
        api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (api.description && api.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (api.team && api.team.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDateTime = (timestamp) => {
        // Convertir timestamp a milisegundos (multiplicar por 1000)
        const date = new Date(timestamp * 1000);
        
        const pad = (n) => n.toString().padStart(2, '0');
        
        return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    }; 

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 mb-4">
                    <div className="h-12 w-12 mx-auto mb-2 flex items-center justify-center">
                        <Server size={48} />
                    </div>
                    <h3 className="text-lg font-semibold">Error loading APIs</h3>
                    <p className="text-sm">{error}</p>
                </div>
                <button
                    onClick={loadApis}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configured APIs</h1>
                    <p className="text-gray-600 mt-1">
                        {apis.length} API{apis.length !== 1 ? 's' : ''} configured
                    </p>
                </div>
                <button
                    onClick={loadApis}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Settings size={16} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 flex items-center justify-center">
                    <Search size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search APIs by name, description, or team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* APIs Grid */}
            {filteredApis.length === 0 ? (
                <div className="text-center py-12">
                    <div className="h-16 w-16 text-gray-300 mx-auto mb-4 flex items-center justify-center">
                        <Server size={64} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        {searchTerm ? 'No APIs found' : 'No APIs configured yet'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Upload your first Postman or Swagger collection to get started'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredApis.map((api) => (
                        <div key={api.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* API Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {api.name}
                                        </h3>
                                        {api.version && (
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                v{api.version}
                                            </span>
                                        )}
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <Eye size={20} />
                                    </button>
                                </div>

                                {/* Description */}
                                {api.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {api.description}
                                    </p>
                                )}

                                {/* Metadata */}
                                <div className="space-y-2 text-sm">
                                    {api.team && (
                                        <div className="flex items-center text-gray-600">
                                            <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                                <Users size={16} />
                                            </div>
                                            <span>{api.team}</span>
                                        </div>
                                    )}

                                    {api.endpoints && (
                                        <div className="flex items-center text-gray-600">
                                            <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                                <Server size={16} />
                                            </div>
                                            <span>{api.endpoints.length} endpoint{api.endpoints.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-gray-600">
                                        <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                            <Calendar size={16} />
                                        </div>
                                        <span>{formatDateTime(api.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Servers */}
                                {api.servers && api.servers.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-500 mb-2">Servers:</div>
                                        <div className="space-y-1">
                                            {api.servers.slice(0, 2).map((server, index) => (
                                                <div key={index} className="text-xs bg-gray-50 px-2 py-1 rounded truncate">
                                                    {server.url}
                                                </div>
                                            ))}
                                            {api.servers.length > 2 && (
                                                <div className="text-xs text-gray-500">
                                                    +{api.servers.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    View Details
                                </button>
                                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                    Chat with API
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApiList;