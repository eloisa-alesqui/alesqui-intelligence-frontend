import React, { useState, useEffect, FC } from 'react';
import { apiService } from '../../services/apiService';
import { ApiDocument } from '../../types';
import { Search, Server, Calendar, Users, Globe, Settings, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeleteConfirmationDialog: FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    apiName: string;
}> = ({ isOpen, onClose, onConfirm, apiName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-lg font-bold text-gray-800">Delete API</h3>
                <p className="text-sm text-gray-600 my-4">
                    Are you sure you want to delete the API <span className="font-semibold">"{apiName}"</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const ApiList: React.FC = () => {
    const navigate = useNavigate();
    const [apis, setApis] = useState<ApiDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [apiToDelete, setApiToDelete] = useState<ApiDocument | null>(null);

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

    const openDeleteDialog = (api: ApiDocument) => {
        setApiToDelete(api);
        setIsDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (apiToDelete) {
            try {
                await apiService.deleteApi(apiToDelete.id);
                loadApis();
                // addNotification(`API "${apiToDelete.name}" deleted.`, 'success');
            } catch (error) {
                // addNotification('Failed to delete API.', 'error');
            }
        }
        setIsDialogOpen(false);
        setApiToDelete(null);
    };

    const handleToggleActive = async (apiId: string, currentState: boolean) => {
        try {
            await apiService.updateApiStatus(apiId, !currentState);
            loadApis();
        } catch (error) {
        }
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                        <div key={api.id} className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col ${
                            !api.active ? 'opacity-50 hover:opacity-100' : ''
                        }`}>
                            <div className="p-6 flex-1">
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
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleToggleActive(api.id, api.active)}>
                                            {api.active ? (
                                                <ToggleRight size={24} className="text-green-500 cursor-pointer" />
                                            ) : (
                                                <ToggleLeft size={24} className="text-gray-400 cursor-pointer" />
                                            )}
                                        </button>

                                        <button 
                                            onClick={() => openDeleteDialog(api)} 
                                            className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
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
                                        <span>{formatDate(api.createdAt)}</span>
                                    </div>

                                    {/* Base URL */}
                                    {api.apiConfiguration?.baseUrl && (
                                        <div className="flex items-center text-gray-600">
                                            <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                                <Globe size={16} />
                                            </div>
                                            <span className="truncate">{api.apiConfiguration.baseUrl}</span>
                                        </div>
                                    )}

                                    {/* Read Only Status */}
                                    {api.apiConfiguration?.readOnly && (
                                        <div className="flex items-center text-amber-600">
                                            <div className="h-4 w-4 mr-2 flex items-center justify-center">
                                                <Settings size={16} />
                                            </div>
                                            <span className="font-medium">Read Only</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                                <button 
                                    onClick={() => navigate(`/apis/${api.id || api._id}`)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                >
                                    <Settings size={14} />
                                    Manage
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <DeleteConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                apiName={apiToDelete?.name || ''}
            />
        </div>
    );
};

export default ApiList;