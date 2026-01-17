import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    adminService, 
    AuditLogSummary, 
    AuditAction, 
    EntityType, 
    AuditResult 
} from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { 
    FileText, 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Activity, 
    ChevronRight,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    Shield
} from 'lucide-react';

/**
 * AuditLogList Component
 * 
 * Displays a filterable, searchable list of audit logs for administrative review.
 * Provides comprehensive filtering by action type, entity type, result, and date range.
 */
const AuditLogList: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    // State management
    const [logs, setLogs] = useState<AuditLogSummary[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLogSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('');
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
    const [resultFilter, setResultFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateeTo] = useState<string>('');
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [pageSize] = useState(50);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    /**
     * Loads recent audit logs from the backend
     */
    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await adminService.getRecentAuditLogs(500);
            setLogs(data);
            setFilteredLogs(data);
            setTotalElements(data.length);
            setTotalPages(1);
        } catch (error: any) {
            addNotification(error.message || 'Failed to load audit logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    /**
     * Applies all active filters to the log list and handles pagination
     */
    useEffect(() => {
        let filtered = [...logs];

        // Search filter (username or entity name)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(log => 
                log.actorUsername.toLowerCase().includes(term) ||
                log.entityName.toLowerCase().includes(term)
            );
        }

        // Action type filter
        if (actionFilter) {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        // Entity type filter
        if (entityTypeFilter) {
            filtered = filtered.filter(log => log.entityType === entityTypeFilter);
        }

        // Result filter
        if (resultFilter) {
            filtered = filtered.filter(log => log.result === resultFilter);
        }

        // Date range filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(log => {
                const logTimestamp = typeof log.timestamp === 'string' ? parseFloat(log.timestamp) : log.timestamp;
                const logDate = new Date(logTimestamp * 1000); // Convert seconds to milliseconds
                return logDate >= fromDate;
            });
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(log => {
                const logTimestamp = typeof log.timestamp === 'string' ? parseFloat(log.timestamp) : log.timestamp;
                const logDate = new Date(logTimestamp * 1000); // Convert seconds to milliseconds
                return logDate <= toDate;
            });
        }

        setFilteredLogs(filtered);
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        setPage(0); // Reset to first page when filters change
    }, [searchTerm, actionFilter, entityTypeFilter, resultFilter, dateFrom, dateTo, logs, pageSize]);

    /**
     * Clears all active filters
     */
    const clearFilters = () => {
        setSearchTerm('');
        setActionFilter('');
        setEntityTypeFilter('');
        setResultFilter('');
        setDateFrom('');
        setDateeTo('');
        setPage(0);
    };

    /**
     * Get paginated logs for current page
     */
    const paginatedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize);

    /**
     * Pagination handlers
     */
    const goToPage = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    /**
     * Returns a human-readable label for an action type
     */
    const getActionLabel = (action: AuditAction): string => {
        return action.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    /**
     * Returns appropriate styling for a result badge
     */
    const getResultBadge = (result: AuditResult) => {
        if (result === AuditResult.SUCCESS) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" />
                    Success
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <XCircle className="w-3 h-3" />
                Failed
            </span>
        );
    };

    /**
     * Formats a timestamp for display
     * Converts Unix timestamp (seconds) to milliseconds for JavaScript Date
     */
    const formatTimestamp = (timestamp: string | number): string => {
        const timestampNum = typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;
        // Backend sends Unix timestamp in seconds, multiply by 1000 for milliseconds
        const date = new Date(timestampNum * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading audit logs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Audit Logs
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Track all administrative actions and system events
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-900">{paginatedLogs.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{filteredLogs.length}</span> filtered
                    {filteredLogs.length !== logs.length && (
                        <span> (from {logs.length} total)</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
                    {(searchTerm || actionFilter || entityTypeFilter || resultFilter || dateFrom || dateTo) && (
                        <button
                            onClick={clearFilters}
                            className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by user or entity..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    {/* Action Filter */}
                    <select
                        value={actionFilter}
                        onChange={e => setActionFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="">All Actions</option>
                        {Object.values(AuditAction).map(action => (
                            <option key={action} value={action}>
                                {getActionLabel(action)}
                            </option>
                        ))}
                    </select>

                    {/* Entity Type Filter */}
                    <select
                        value={entityTypeFilter}
                        onChange={e => setEntityTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="">All Entity Types</option>
                        {Object.values(EntityType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    {/* Result Filter */}
                    <select
                        value={resultFilter}
                        onChange={e => setResultFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="">All Results</option>
                        <option value={AuditResult.SUCCESS}>Success</option>
                        <option value={AuditResult.FAILURE}>Failed</option>
                    </select>

                    {/* Date From */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="From date"
                        />
                    </div>

                    {/* Date To */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={e => setDateeTo(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="To date"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            {filteredLogs.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No audit logs found matching your filters</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Result
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedLogs.map(log => (
                                    <tr 
                                        key={log.id} 
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/admin/audit-logs/${log.id}`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatTimestamp(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {log.actorUsername}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">
                                                {log.actionDescription}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="text-gray-900 font-medium">{log.entityName}</div>
                                                <div className="text-gray-500 text-xs">{log.entityType}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getResultBadge(log.result)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button 
                                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/audit-logs/${log.id}`);
                                                }}
                                            >
                                                Details
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Page <span className="font-semibold">{page + 1}</span> of{' '}
                                    <span className="font-semibold">{totalPages}</span>
                                    {' • '}
                                    Showing <span className="font-semibold">{page * pageSize + 1}</span>-
                                    <span className="font-semibold">{Math.min((page + 1) * pageSize, filteredLogs.length)}</span> of{' '}
                                    <span className="font-semibold">{filteredLogs.length}</span> results
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page === 0}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    
                                    {/* Page numbers */}
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 5) {
                                                pageNum = i;
                                            } else if (page < 3) {
                                                pageNum = i;
                                            } else if (page >= totalPages - 3) {
                                                pageNum = totalPages - 5 + i;
                                            } else {
                                                pageNum = page - 2 + i;
                                            }
                                            
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                        page === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNum + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page === totalPages - 1}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuditLogList;
