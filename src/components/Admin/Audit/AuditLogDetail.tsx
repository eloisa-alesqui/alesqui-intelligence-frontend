import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, AuditLogDetail as AuditLogDetailType } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { 
    ArrowLeft, 
    FileText, 
    User, 
    Calendar, 
    Activity, 
    Globe, 
    Monitor,
    CheckCircle,
    XCircle,
    Code,
    AlertTriangle,
    Shield
} from 'lucide-react';

/**
 * AuditLogDetail Component
 * 
 * Displays comprehensive details about a specific audit log entry,
 * including before/after data for state changes.
 */
const AuditLogDetail: React.FC = () => {
    const { logId } = useParams<{ logId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();

    const [log, setLog] = useState<AuditLogDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPreviousData, setShowPreviousData] = useState(false);
    const [showNewData, setShowNewData] = useState(false);

    /**
     * Loads the audit log details from the backend
     */
    useEffect(() => {
        if (!logId) return;

        const loadLog = async () => {
            setLoading(true);
            try {
                const data = await adminService.getAuditLogById(logId);
                setLog(data);
            } catch (error: any) {
                addNotification(error.message || 'Failed to load audit log', 'error');
                navigate('/admin/audit-logs');
            } finally {
                setLoading(false);
            }
        };

        loadLog();
    }, [logId]);

    /**
     * Formats JSON data for display
     */
    const formatJsonData = (jsonString?: string): string => {
        if (!jsonString) return 'N/A';
        try {
            const parsed = JSON.parse(jsonString);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return jsonString;
        }
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading audit log details...</p>
                </div>
            </div>
        );
    }

    if (!log) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600">Audit log not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/audit-logs')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Audit Logs
                </button>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    Audit Log Details
                </h1>
                <p className="text-gray-600 mt-1">Detailed information about this audit event</p>
            </div>

            {/* Result Badge */}
            <div className="flex items-center gap-3">
                {log.result === 'SUCCESS' ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        Operation Successful
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800">
                        <XCircle className="w-5 h-5" />
                        Operation Failed
                    </span>
                )}
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Action Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        Action Information
                    </h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Action Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{log.action}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900">{log.actionDescription}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Timestamp</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(log.timestamp)}</dd>
                        </div>
                    </dl>
                </div>

                {/* User Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        User Information
                    </h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Username</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold">{log.actorUsername}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{log.actorUserId}</dd>
                        </div>
                    </dl>
                </div>

                {/* Entity Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        Entity Information
                    </h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Entity Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{log.entityType}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Entity Name</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-semibold">{log.entityName}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Entity ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{log.entityId}</dd>
                        </div>
                    </dl>
                </div>

                {/* Technical Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-blue-600" />
                        Technical Information
                    </h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-mono">{log.ipAddress}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                            <dd className="mt-1 text-sm text-gray-900 break-all">{log.userAgent || 'N/A'}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Additional Details */}
            {log.details && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.details}</p>
                </div>
            )}

            {/* Error Message (if failed) */}
            {log.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        Error Message
                    </h3>
                    <p className="text-sm text-red-800 font-mono">{log.errorMessage}</p>
                </div>
            )}

            {/* Previous Data (for UPDATE/DELETE operations) */}
            {log.previousData && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setShowPreviousData(!showPreviousData)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Code className="w-5 h-5 text-blue-600" />
                            Previous State
                        </h3>
                        <span className="text-sm text-gray-500">
                            {showPreviousData ? 'Hide' : 'Show'}
                        </span>
                    </button>
                    {showPreviousData && (
                        <div className="px-6 pb-6">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
                                <code>{formatJsonData(log.previousData)}</code>
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* New Data (for CREATE/UPDATE operations) */}
            {log.newData && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setShowNewData(!showNewData)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Code className="w-5 h-5 text-green-600" />
                            New State
                        </h3>
                        <span className="text-sm text-gray-500">
                            {showNewData ? 'Hide' : 'Show'}
                        </span>
                    </button>
                    {showNewData && (
                        <div className="px-6 pb-6">
                            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
                                <code>{formatJsonData(log.newData)}</code>
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuditLogDetail;
