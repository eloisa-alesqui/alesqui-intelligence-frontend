import React, { useState, useEffect, FC, useRef } from 'react';
import { diagnosticsService } from '../../services/diagnosticsService';
import { ConversationDetail } from '../../services/chatService';
import { 
    Loader2, X, AlertCircle, Bot, User, Brain, ChevronDown, ChevronUp, 
    MessageSquare, StickyNote, Send, Flag, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChatMessageChart, { ChartDataType } from '../Chat/ChatMessageChart'; // Import the chart component and type
import { useNotifications } from '../../context/NotificationContext'; 
// Assuming you have a date utility function, if not, replace with new Date().toLocaleString()
import { formatSmartTimestamp } from '../../utils/dateUtils'; 
import { TicketStatus, allStatuses } from '../../config/ticketStatusConfig';

// --- Props Interface ---

/**
 * Defines the props for the DiagnosticDetailModal component.
 */
interface DiagnosticDetailModalProps {
    /** The ID of the parent conversation to load. */
    conversationId: string;
    /** The specific ID of the record (ticket) being acted upon. */
    ticketRecordId: string; 
    /** The initial status of the ticket when the modal is opened. */
    initialStatus: TicketStatus;
    /** Callback function to close the modal. */
    onClose: () => void;
    /** Callback function to refresh the inbox list after an action. */
    onActionSuccess: () => void; 
}

// --- Helper Components ---

/**
 * A specialized message bubble component for the diagnostics modal.
 * It renders the user prompt, bot response, reasoning, user feedback,
 * and internal notes all within the flow of the conversation.
 */
const DiagnosticMessageBubble = React.forwardRef<
    HTMLDivElement, // The type of the DOM element we're forwarding
    { detail: ConversationDetail; ticketRecordId: string; } // The component's props
>(({ detail, ticketRecordId }, ref) => {
    const [isReasoningOpen, setIsReasoningOpen] = useState(false);

    // Check if the record being displayed is the one that was reported
    const isReportedTicket = detail.id === ticketRecordId;

    return (
        <div className="space-y-4" ref={ref}>
            {/* --- User Message --- */}
            <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xl shadow-sm">
                    <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <p className="whitespace-pre-wrap">{detail.userPrompt}</p>
                            <p className="text-xs text-blue-200 mt-2 text-right">
                                {formatSmartTimestamp(new Date(detail.timestamp))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Bot Response --- */}
            <div className="flex justify-start">
                <div className={`p-3 rounded-lg max-w-xl shadow-sm
                    ${isReportedTicket ? 'border-2 border-red-500 bg-red-50' : (detail.isError ? 'bg-red-50 border border-red-200' : 'bg-gray-100 border border-gray-200')}
                `}>
                    <div className="flex items-start space-x-3">
                        <Bot className={`w-5 h-5 flex-shrink-0 mt-1 ${
                            detail.isError ? 'text-red-600' : 'text-blue-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                            {/* Main bot content */}
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {detail.responseText}
                                </ReactMarkdown>
                            </div>

                            {/* Chart, if it exists */}
                            {detail.responseChart && (
                                <ChatMessageChart chartData={detail.responseChart as ChartDataType} />
                            )}
                            
                            {/* Reasoning, if it exists */}
                            {detail.stepByStepReasoning && (
                                <div className="mt-4 border-t border-gray-200 pt-3">
                                    <button
                                        onClick={() => setIsReasoningOpen(!isReasoningOpen)}
                                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        {isReasoningOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        <Brain className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium">View step-by-step reasoning</span>
                                    </button>
                                    {isReasoningOpen && (
                                        <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200 prose prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {detail.stepByStepReasoning}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- Feedback & Internal Notes (The diagnostic part) --- */}
                            
                            {/* User Feedback (only if it exists) */}
                            {detail.userFeedbackComment && (
                                <div className="mt-4 border-t-2 border-dashed border-red-200 pt-3">
                                    <h4 className="text-xs font-semibold uppercase text-red-700 flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-2" /> User Feedback
                                    </h4>
                                    <p className="text-sm text-gray-700 italic mt-1">
                                        "{detail.userFeedbackComment}"
                                    </p>
                                </div>
                            )}
                            
                            {/* Highlight the ticket that was actually reported */}
                            {isReportedTicket && !detail.userFeedbackComment && (
                                <div className="mt-4 border-t-2 border-dashed border-red-200 pt-3">
                                    <h4 className="text-xs font-semibold uppercase text-red-700 flex items-center">
                                        <Flag className="w-4 h-4 mr-2" /> This message was reported
                                    </h4>
                                    <p className="text-sm text-gray-700 italic mt-1">
                                        (No comment was provided by the user)
                                    </p>
                                </div>
                            )}

                            {/* Internal Notes (only if they exist) */}
                            {detail.internalNotes && detail.internalNotes.length > 0 && (
                                <div className="mt-4 border-t-2 border-dashed border-yellow-300 pt-3">
                                    <h4 className="text-xs font-semibold uppercase text-yellow-800 flex items-center">
                                        <StickyNote className="w-4 h-4 mr-2" /> Internal Notes
                                    </h4>
                                    <ul className="text-sm text-gray-700 mt-2 space-y-2">
                                        {detail.internalNotes.map((note, i) => (
                                            <li key={i} className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                                {/* Use whitespace-pre-wrap to respect newlines in the note */}
                                                <code className="text-xs whitespace-pre-wrap">{note}</code>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

// --- Main Modal Component ---

/**
 * Renders a modal displaying the full conversation detail for an IT user,
 * including diagnostic information and administrative actions.
 */
const DiagnosticDetailModal: FC<DiagnosticDetailModalProps> = ({ 
    conversationId, 
    ticketRecordId,
    initialStatus,
    onClose,
    onActionSuccess
}) => {
    const { addNotification } = useNotifications();
    const [details, setDetails] = useState<ConversationDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- State for Actions Footer ---
    const [newNote, setNewNote] = useState("");
    const [displayStatus, setDisplayStatus] = useState(initialStatus); 
    const [selectedStatus, setSelectedStatus] = useState(initialStatus);
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

    const messageRefs = useRef(new Map<string, HTMLDivElement | null>());

    /**
     * Fetches the full conversation history from the IT-specific endpoint.
     */
    useEffect(() => {
        const fetchDetails = async () => {
            if (!conversationId) return;
            setIsLoading(true);
            setError(null);
            try {
                messageRefs.current.clear();
                const data = await diagnosticsService.getConversationDetailsForIT(conversationId);
                setDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [conversationId]);

    useEffect(() => {
        // Run this only after loading is false AND details are populated
        if (!isLoading && details.length > 0) {
            // Get the specific DOM element for our ticket
            const ticketRef = messageRefs.current.get(ticketRecordId);
            
            if (ticketRef) {
                // Tell the browser to scroll that element into view
                ticketRef.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // This will try to center it in the modal
                });
            }
        }
    }, [isLoading, details, ticketRecordId]);

    /**
     * Helper function to update the local state after a successful action.
     * This avoids a full re-fetch by merging the updated record from the API.
     * @param updatedRecord The updated ConversationDetail DTO from the backend.
     */
    const updateDetailsForRecord = (updatedRecord: ConversationDetail) => {
        setDetails(prevDetails => 
            prevDetails.map(detail => 
                // Find the matching record and replace it
                detail.id === updatedRecord.id ? updatedRecord : detail
            )
        );
        // Also trigger a refresh of the main inbox list
        onActionSuccess();
    };

    /**
     * Handles the submission of a new internal note.
     */
    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmittingNote(true);
        try {
            // Call the service to add the note to the specific ticket record
            const updatedRecord = await diagnosticsService.addInternalNote(ticketRecordId, newNote);
            updateDetailsForRecord(updatedRecord); // Update local state
            addNotification('Note added successfully', 'success');
            setNewNote(""); // Clear the textarea
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to add note', 'error');
        } finally {
            setIsSubmittingNote(false);
        }
    };

    /**
     * Handles the CLICK event to submit a status change.
     */
    const handleStatusChangeSubmit = async () => {
        setIsSubmittingStatus(true);
        try {
            // Call the service to update the status of the specific ticket record
            const updatedRecord = await diagnosticsService.updateTicketStatus(ticketRecordId, selectedStatus);
            updateDetailsForRecord(updatedRecord); // Update local state
            setDisplayStatus(selectedStatus);
            addNotification('Status updated successfully', 'success');
        } catch (err) {
            addNotification(err instanceof Error ? err.message : 'Failed to update status', 'error');
        } finally {
            setIsSubmittingStatus(false);
        }
    };

    /**
     * Renders the main content of the modal (loading, error, or message list).
     */
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <p>{error}</p>
                </div>
            );
        }
        return (
            <div className="space-y-6">
                {details.map((detail) => (
                    <DiagnosticMessageBubble 
                        key={detail.id} 
                        detail={detail}
                        ticketRecordId={ticketRecordId}
                        ref={el => { 
                            messageRefs.current.set(detail.id, el); 
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        // Modal overlay
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            {/* Modal panel */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                
                {/* --- Modal Header --- */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Conversation Details</h2>
                        <p className="text-sm text-gray-500 truncate" title={conversationId}>
                            ID: {conversationId}
                        </p>
                    </div>
                    {(() => {
                        // It reads from 'displayStatus', the saved state
                        const statusConfig = allStatuses.find(s => s.id === displayStatus);
                        if (!statusConfig) return null;
                        const Icon = statusConfig.icon;
                        return (
                            <span className={`px-3 py-1 inline-flex items-center text-sm font-semibold rounded-full ${statusConfig.badgeClasses}`}>
                                <Icon className={`w-4 h-4 mr-1.5 ${statusConfig.id === 'UNDER_REVIEW' ? 'animate-spin' : ''}`} />
                                {statusConfig.label}
                            </span>
                        );
                    })()}
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- Modal Content Area (Scrollable) --- */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                    {renderContent()}
                </div>

                {/* --- Modal Actions Footer --- */}
                <div className="p-4 border-t border-gray-200 bg-white space-y-4">
                    {/* 1. Change Status Dropdown */}
                    <div>
                        <label htmlFor="ticketStatus" className="block text-sm font-medium text-gray-700 mb-1">
                            Ticket Status
                        </label>
                        <div className="flex items-center space-x-2">
                            <select
                                id="ticketStatus"
                                value={selectedStatus}
                                // The onChange now ONLY updates local state
                                onChange={(e) => setSelectedStatus(e.target.value as any)}
                                disabled={isSubmittingStatus}
                                className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
                            >
                                <option value="REPORTED_BY_USER">Reported by User</option>
                                <option value="ERROR_PROCESSING">Automatic Error</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>

                            {/* New "Update Status" Button */}
                            <button
                                onClick={handleStatusChangeSubmit}
                                disabled={isSubmittingStatus || selectedStatus === displayStatus}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                           flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingStatus ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                                <span className="ml-2 hidden sm:inline">Update Status</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* 2. Add Internal Note Form (no changes) */}
                    <form onSubmit={handleAddNote}>
                        <label htmlFor="internalNote" className="block text-sm font-medium text-gray-700 mb-1">
                            Add Internal Note
                        </label>
                        <div className="flex space-x-2">
                            <textarea
                                id="internalNote"
                                rows={2}
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                placeholder="e.g., Notified backend team. JIRA-1234"
                                disabled={isSubmittingNote}
                            />
                            <button
                                type="submit"
                                disabled={isSubmittingNote || !newNote.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                                           flex items-center justify-center disabled:opacity-50"
                            >
                                {isSubmittingNote ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticDetailModal;