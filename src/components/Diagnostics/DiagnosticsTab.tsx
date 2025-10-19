import React, { useState, useEffect, useCallback } from 'react';
import { diagnosticsService, DiagnosticTicketDTO, Page, Pageable } from '../../services/diagnosticsService';
import { Loader2, AlertCircle, Inbox, ChevronLeft, ChevronRight, MessageSquare, Flag, Search, User, Filter, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DiagnosticDetailModal from './DiagnosticDetailModal';
import { allStatuses } from '../../config/ticketStatusConfig';

/**
 * Main component for the Diagnostics Panel.
 * Renders the "Inbox" view of reported issues and errors.
 */
const DiagnosticsTab: React.FC = () => {
    const [tickets, setTickets] = useState<DiagnosticTicketDTO[]>([]);
    const [page, setPage] = useState<Page<DiagnosticTicketDTO> | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterUsername, setFilterUsername] = useState('');
    const [filterStatuses, setFilterStatuses] = useState([
        'REPORTED_BY_USER', 
        'ERROR_PROCESSING'
    ]);

    const [selectedTicket, setSelectedTicket] = useState<DiagnosticTicketDTO | null>(null);

    /**
     * Fetches the tickets from the backend service.
     */
    const fetchTickets = useCallback(async (pageToFetch: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const pageable: Pageable = {
                page: pageToFetch,
                size: 10,
                sort: 'timestamp,desc'
            };
            const result = await diagnosticsService.getTickets(pageable, filterStatuses, filterUsername);
            setTickets(result.content);
            setPage(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatuses, filterUsername]); // Re-fetch if filters change

    useEffect(() => {
        fetchTickets(0);
    }, []);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0); 
        fetchTickets(0);   
    };

    const handleStatusChange = (statusId: string) => {
        setFilterStatuses(prev => {
            if (prev.includes(statusId)) {
                return prev.filter(s => s !== statusId); 
            } else {
                return [...prev, statusId]; 
            }
        });
    };

    /**
     * Renders the content of the tab based on the loading/error state.
     */
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading tickets...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <div>
                        <h4 className="font-bold">Failed to load tickets</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (tickets.length === 0) {
            return (
                <div className="text-center text-gray-500 h-64 flex flex-col justify-center items-center">
                    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">All clear!</p>
                    <p className="text-sm mt-1">There are no open tickets to review.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto shadow rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt & Feedback</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                            <tr key={ticket.recordId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {(() => {
                                        const statusConfig = allStatuses.find(s => s.id === ticket.status);
                                        
                                        if (!statusConfig) {
                                            return (
                                                <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    {ticket.status}
                                                </span>
                                            );
                                        }
                                        
                                        const Icon = statusConfig.icon;
                                        return (
                                            <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusConfig.badgeClasses}`}>
                                                <Icon className="w-3 h-3 mr-1.5" />
                                                {statusConfig.label}
                                            </span>
                                        );
                                    })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{ticket.username}</td>
                                <td className="px-6 py-4 max-w-md">
                                    <p className="text-sm text-gray-900 truncate font-medium" title={ticket.userPrompt}>
                                        <MessageSquare className="w-4 h-4 mr-2 inline text-gray-400" />
                                        {ticket.userPrompt}
                                    </p>
                                    {ticket.userFeedbackComment && (
                                        <p className="text-sm text-gray-600 truncate italic mt-1" title={ticket.userFeedbackComment}>
                                            "{ticket.userFeedbackComment}"
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(ticket.timestamp * 1000), { addSuffix: true })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedTicket(ticket)} // <-- Pasa el DTO del ticket entero
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    /**
     * Renders pagination controls.
     */
    const renderPagination = () => {
        if (!page || page.totalElements === 0) return null;

        return (
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600">
                    Showing {page.size * page.number + 1}
                    -
                    {page.size * page.number + page.content.length}
                    {' '} of {page.totalElements} results
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        disabled={page.first}
                        className="px-3 py-1 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4 inline mr-1" />
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={page.last}
                        className="px-3 py-1 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Diagnostics Inbox</h1>
                <p className="text-gray-600 mt-1">
                    Review user-reported issues and automatic processing errors.
                </p>
            </div>

            <form 
                onSubmit={handleFilterSubmit} 
                className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
            >
                <div className="relative w-full md:w-auto md:flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={filterUsername}
                        onChange={e => setFilterUsername(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Filter by username..."
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center">
                    {allStatuses.map(status => {
                        const isSelected = filterStatuses.includes(status.id);
                        const Icon = status.icon;
                        
                        return (
                            <div key={status.id}>
                                <input
                                    type="checkbox"
                                    id={`status-${status.id}`}
                                    checked={isSelected}
                                    onChange={() => handleStatusChange(status.id)}
                                    className="hidden" 
                                />
                                <label
                                    htmlFor={`status-${status.id}`}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200
                                                ${isSelected ? status.selectedClasses : status.unselectedClasses}
                                                ${isSelected ? 'shadow-md scale-105' : 'opacity-80 hover:opacity-100'}
                                    `}
                                >
                                    <Icon className={`w-3 h-3 mr-1.5 ${status.id === 'UNDER_REVIEW' && isSelected ? 'animate-spin' : ''}`} />
                                    {status.label}
                                </label>
                            </div>
                        );
                    })}
                </div>

                <button
                    type="submit"
                    title="Apply Filters" 
                    className="w-full md:w-auto flex items-center justify-center 
                               p-2.5 h-10 w-10  {/* <-- Ajuste de tamaño para hacerlo cuadrado */}
                               bg-blue-600 text-white rounded-lg 
                               hover:bg-blue-700 transition-colors 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               md:ml-auto flex-shrink-0"
                >
                    <Search className="w-5 h-5" /> 
                </button>
            </form>
            
            <div className="overflow-x-auto">
                {renderContent()}
            </div>

            {renderPagination()}

            {selectedTicket && (
                <DiagnosticDetailModal
                    conversationId={selectedTicket.conversationId}
                    ticketRecordId={selectedTicket.recordId} 
                    initialStatus={selectedTicket.status} 
                    onClose={() => setSelectedTicket(null)}
                    onActionSuccess={() => {
                        fetchTickets(currentPage);
                    }}
                />
            )}

        </div>
    );
};

export default DiagnosticsTab;