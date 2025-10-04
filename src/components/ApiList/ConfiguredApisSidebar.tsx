import React, { useState, FC } from 'react';
import { Trash2, Loader, Database, Search, ArrowRight } from 'lucide-react';
import { ApiDocument } from '../../services/apiService';
import { Link } from 'react-router-dom';

// ================================================================================================
// INTERFACE DEFINITIONS
// ================================================================================================

/**
 * @interface ConfiguredApisSidebarProps
 * Defines the props required by the sidebar component.
 */
interface ConfiguredApisSidebarProps {
    /** An array of configured API documents to display. */
    configuredApis: ApiDocument[];
    /** Callback function to handle the deletion of an API. */
    onDeleteApi: (apiId: string, apiName: string) => void;
    /** A boolean flag to indicate if the API list is currently being loaded. */
    loading: boolean;
}

// ================================================================================================
// SUB-COMPONENTS (for different states and items)
// ================================================================================================

/**
 * LoadingState Component
 * Displays a spinner and a message while the APIs are being fetched.
 */
const LoadingState: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="mt-2 text-sm">Loading APIs...</p>
    </div>
);

/**
 * EmptyState Component
 * Displays a message when no APIs have been configured yet.
 */
const EmptyState: React.FC = () => (
    <div className="text-center py-8 text-gray-500 h-full flex flex-col justify-center">
        <Database size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="font-semibold text-sm">No APIs configured</p>
        <p className="text-xs text-gray-400 mt-1">They will appear here once set up.</p>
    </div>
);

/**
 * ApiCard Component
 * Renders a single, simplified card for an API, showing its name, version, and a delete button.
 */
const ApiCard: React.FC<{ api: ApiDocument; onDelete: (api: ApiDocument) => void }> = ({ api, onDelete }) => (
    <div className="group relative border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors flex justify-between items-center">
        <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 pr-8">
                <h4 className="text-sm font-medium text-gray-900 truncate" title={api.name}>{api.name}</h4>
                {api.version && (
                    <span className="flex-shrink-0 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        v{api.version}
                    </span>
                )}
            </div>
        </div>
        <button
            onClick={() => onDelete(api)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Delete API: ${api.name}`}
        >
            <Trash2 size={16} />
        </button>
    </div>
);

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


// ================================================================================================
// MAIN SIDEBAR COMPONENT
// ================================================================================================

const ConfiguredApisSidebar: React.FC<ConfiguredApisSidebarProps> = ({ configuredApis, onDeleteApi, loading }) => {
    
    // State to hold the current value of the search input
    const [searchTerm, setSearchTerm] = useState('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [apiToDelete, setApiToDelete] = useState<ApiDocument | null>(null);

    const openConfirmationDialog = (api: ApiDocument) => {
        setApiToDelete(api);
        setIsDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (apiToDelete) {
            onDeleteApi(apiToDelete.id!, apiToDelete.name!);
        }
        setIsDialogOpen(false);
        setApiToDelete(null);
    };

    // Filter the list of APIs based on the search term
    const filteredApis = configuredApis.filter(api =>
        api.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Renders the main content of the list area based on the current state 
     * (loading, empty, or displaying the filtered list).
     */
    const renderContent = () => {
        if (loading) return <LoadingState />;
        if (configuredApis.length === 0) return <EmptyState />;
        if (filteredApis.length === 0 && searchTerm) {
            return <p className="text-center text-sm text-gray-500 p-4">No APIs found for "{searchTerm}".</p>;
        }
        return (
            <div className="space-y-3">
                {filteredApis.map((api) => (
                    <ApiCard key={api.id} api={api} onDelete={openConfirmationDialog} />
                ))}
            </div>
        );
    };

    return (
        // Main container. `h-full` and `flex` are crucial for the scroll to work,
        // as they make the component fill the height provided by its parent flex cell.
        <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Configured APIs
            </h3>
            <p className="text-sm text-gray-500 mb-4">
                {loading ? '...' : `${configuredApis.length} total`}
            </p>

            {/* Search Input Section */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            {/* Scrollable Content Area */}
            {/* `flex-1` makes this container grow to fill available space. */}
            {/* `overflow-y-auto` enables the vertical scrollbar when content exceeds the container's height. */}
            {/* `min-h-0` is the key fix that allows the container to shrink, enabling the scrollbar in a flex context. */}
            <div className="flex-1 overflow-y-auto min-h-0 -mr-2 pr-2 custom-scrollbar">
                {renderContent()}
            </div>

            {/* Footer Link Section */}
            {/* This link directs the user to the main page for managing all APIs. */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <Link 
                    to="/apis" 
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                    Manage All APIs
                    <ArrowRight size={14} className="ml-2" />
                </Link>
            </div>

            <DeleteConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                apiName={apiToDelete?.name || ''}
            />
        </div>
    );
};

export default ConfiguredApisSidebar;