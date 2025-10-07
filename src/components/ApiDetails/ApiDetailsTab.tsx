import React from 'react';
import { ApiDocument } from '../../types';
import { EndpointList } from './EndpointList';
import { 
  Server, 
  Clock, 
  User, 
  Globe, 
  Tag, 
  FileText,
  CheckCircle,
  XCircle,
  Hash
} from 'lucide-react';

const ApiDetailsTab: React.FC<{ api: ApiDocument }> = ({ api }) => {
    // Format timestamp to readable date
    const formatDate = (timestamp: string | undefined) => {
        if (!timestamp) return 'N/A';
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Status indicator component
    const StatusIndicator = ({ active }: { active: boolean }) => (
        <div className="flex items-center gap-2">
            {active ? (
                <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Active</span>
                </>
            ) : (
                <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Inactive</span>
                </>
            )}
        </div>
    );

    // Method count by type
    const getMethodCounts = () => {
        const counts = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0 };
        api.endpoints?.forEach(endpoint => {
            const method = endpoint.method.toUpperCase();
            if (counts.hasOwnProperty(method)) {
                counts[method as keyof typeof counts]++;
            }
        });
        return counts;
    };

    const methodCounts = getMethodCounts();

    return (
        <div className="space-y-8">
            {/* API Overview Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6">
                    API Information
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* General Information Card */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-500" />
                            General Details
                        </h4>
                        <dl className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-500">API Name</dt>
                                <dd className="text-sm text-gray-900 font-medium">{api.name}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-500">Version</dt>
                                <dd className="text-sm text-gray-900">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        v{api.version || 'N/A'}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-500">Team</dt>
                                <dd className="text-sm text-gray-900 flex items-center gap-1">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {api.team || 'N/A'}
                                </dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="text-sm text-gray-900">
                                    <StatusIndicator active={api.active} />
                                </dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Created At
                                </dt>
                                <dd className="text-sm text-gray-900">{formatDate(api.createdAt)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Endpoints Summary Card */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-gray-500" />
                            Endpoints Summary
                        </h4>
                        <div className="mb-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-sm font-medium text-gray-500">Total Endpoints</span>
                                <span className="text-2xl font-bold text-gray-900">{api.endpoints?.length || 0}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(methodCounts).map(([method, count]) => {
                                if (count === 0) return null;
                                const colorMap: { [key: string]: string } = {
                                    GET: 'bg-blue-100 text-blue-800',
                                    POST: 'bg-green-100 text-green-800',
                                    PUT: 'bg-orange-100 text-orange-800',
                                    DELETE: 'bg-red-100 text-red-800',
                                    PATCH: 'bg-purple-100 text-purple-800',
                                };
                                return (
                                    <div key={method} className="flex items-center justify-between py-1">
                                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${colorMap[method]}`}>
                                            {method}
                                        </span>
                                        <span className="text-sm font-medium text-gray-700">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Description Card - Full Width */}
                    {api.description && (
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-base font-semibold text-gray-900 mb-3">Description</h4>
                            <p className="text-gray-600 leading-relaxed">{api.description}</p>
                        </div>
                    )}

                    {/* Base URL Card - Full Width */}
                    {api.baseUrl && (
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-gray-500" />
                                Base URL
                            </h4>
                            <div className="bg-gray-50 rounded-md p-3">
                                <code className="text-sm text-gray-800 break-all">
                                    {api.apiConfiguration.baseUrl}
                                </code>
                            </div>
                        </div>
                    )}

                    {/* Tags Card */}
                    {api.tags && api.tags.length > 0 && (
                        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-500" />
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {api.tags.map((tag) => (
                                    <span
                                        key={tag.name} // Mejor usar el nombre como key en lugar del index
                                        title={tag.description} // Muestra la descripción en un tooltip al pasar el ratón
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 cursor-help"
                                    >
                                        {tag.name} {/* Muestra la propiedad 'name' del objeto tag */}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Endpoints Section */}
            <div>
                <div className="border-b border-gray-200 pb-3 mb-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-gray-500" />
                            API Endpoints
                            <span className="text-sm font-normal text-gray-500">
                                ({api.endpoints?.length || 0} total)
                            </span>
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                GET
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                POST
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                PUT
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                DELETE
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                PATCH
                            </span>
                        </div>
                    </div>
                </div>
                
                <EndpointList api={api} />
            </div>
        </div>
    );
};

export default ApiDetailsTab;
