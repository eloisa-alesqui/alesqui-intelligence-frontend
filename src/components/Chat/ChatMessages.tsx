import React, { useEffect, useRef, useState, FC } from 'react';
import { Bot, User, AlertCircle, Download, ChevronDown, ChevronUp, Brain, ExternalLink, Flag, X, Send, Loader2, Zap, FileText, CheckCircle, XCircle, Copy as CopyIcon, Check as CheckIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatSmartTimestamp } from '../../utils/dateUtils';
import { chatService, ReasoningStep, StepType, ToolCallData, ToolCallStatus } from '../../services/chatService'; // Import reasoning types
import ChatMessageChart from './ChatMessageChart';
import { useNotifications } from '../../context/NotificationContext';
import InteractiveReasoning from './InteractiveReasoning';

// --- TYPES ---
// Type definition for a message object used within this component for rendering
type ChatMessageForRender = {
    id: string; // Unique ID for React key prop
    recordId?: string; // Database ID for reporting
    content: string; // Message text
    type: 'user' | 'bot'; // Sender type
    timestamp: Date; // Time of message
    isError?: boolean; // Flag for error messages
    reasoningSteps?: ReasoningStep[]; // Structured reasoning steps
    chart?: any; // Chart data object
};

// Props for the main ChatMessages component
interface ChatMessagesProps {
    chatMessages: ChatMessageForRender[]; // Array of messages to display
    configuredApis: any[]; // List of configured APIs (used for empty state)
    isLoading: boolean; // Flag if the bot is currently processing
    statusMessage: string | null; // Real-time status update text
    isItUser: boolean; // Flag if the logged-in user has an IT role
}

// Props for the ReportIssueModal component
interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => Promise<void>;
    message: ChatMessageForRender | null; // The message being reported
}

// Props for the JsonViewer component
interface JsonViewerProps {
    jsonString: string;
    title: string;
    toolName?: string; // Optional: helps tailor display (e.g., for call_api)
}

// Props for the ToolCallModal component
interface ToolCallModalProps {
    toolCall: ToolCallData | null;
    onClose: () => void;
}

// Props for the InteractiveReasoning component
interface InteractiveReasoningProps {
    steps: ReasoningStep[];
    isExpanded: boolean; // Controlled by parent
    onToggle: () => void; // Function provided by parent
}

// Props for the MessageBubble component
interface MessageBubbleProps {
    message: ChatMessageForRender;
    index: number;
    isReasoningExpanded: boolean; // Controlled by parent
    onToggleReasoning: () => void; // Function provided by parent
    isItUser: boolean;
    onOpenReportModal: (message: ChatMessageForRender) => void;
}


// (InteractiveReasoning implemented as an external component)

// =============================================================================
// Helpers and Markdown components (hoisted to module scope for stability)
// =============================================================================
const urlTransform = (uri: string) => {
    // Transforms sandbox:/ links to actual download URLs
    if (uri && uri.startsWith('sandbox:/')) {
        const filePath = uri.replace('sandbox:/', '');
        const fileName = filePath.split('/').pop();
        return `/api/files/download/${fileName}`;
    }
    return uri;
};

const renderTextWithUrls = (text: string) => {
    // Renders plain text, converting URLs into clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
        if (urlRegex.test(part)) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100 underline break-all inline-flex items-center gap-1 my-1"><ExternalLink className="w-3 h-3 flex-shrink-0" /> <span className="break-all">{part}</span></a>;
        }
        return <span key={index}>{part}</span>;
    });
};

// Custom Markdown components for styling
const CustomOrderedList: FC<any> = ({ children, ...props }) => <ol className="list-decimal list-outside ml-6 my-4 space-y-2" {...props}>{children}</ol>;
const CustomUnorderedList: FC<any> = ({ children, ...props }) => <ul className="list-disc list-outside ml-6 my-4 space-y-2" {...props}>{children}</ul>;
const CustomListItem: FC<any> = ({ children, ...props }) => <li className="text-gray-900 leading-relaxed" {...props}>{children}</li>;
const CustomParagraph: FC<any> = ({ children, ...props }) => <p className="mb-3 leading-relaxed text-gray-900 break-words" {...props}>{children}</p>;
const CustomStrong: FC<any> = ({ children, ...props }) => <strong className="font-semibold text-gray-900" {...props}>{children}</strong>;
const CodeBlock: FC<any> = ({ node, inline, className, children, ...props }) => {
    // Renders code blocks with syntax highlighting and copy button
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);
    if (!inline && language) {
        return (
            <div className="my-4 rounded-lg overflow-hidden">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex justify-between items-center"><span className="capitalize">{language}</span><button onClick={() => copyToClipboard(String(children))} title="Copy code">📋</button></div>
                <SyntaxHighlighter style={vscDarkPlus} language={language} PreTag="div" {...props}>{String(children).replace(/\n$/, '')}</SyntaxHighlighter>
            </div>
        );
    }
    return <code className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono break-all" {...props}>{children}</code>;
};
const CustomLink: FC<any> = ({ href, children, ...props }) => {
    // Renders links, handling special download links
    const isDownloadLink = href && href.includes('/api/files/download/');
    const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault(); try { await chatService.downloadFile(href); } catch (error) { console.error("Error starting download from component.", error); }
    };
    if (isDownloadLink) {
        return <a href={href} onClick={handleDownload} className="inline-flex items-center text-blue-600 hover:text-blue-800 underline break-all" {...props}><Download className="w-4 h-4 mr-1 flex-shrink-0" /><span className="break-all">{children}</span></a>;
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all inline-flex items-center gap-1" {...props}><ExternalLink className="w-3 h-3 flex-shrink-0" /><span className="break-all">{children}</span></a>;
};
// Combine all custom components for ReactMarkdown
const markdownComponents = { code: CodeBlock, a: CustomLink, ol: CustomOrderedList, ul: CustomUnorderedList, li: CustomListItem, p: CustomParagraph, strong: CustomStrong };

// =============================================================================
// MessageBubble Component (hoisted to module scope to avoid remounts)
// =============================================================================
const MessageBubble: FC<MessageBubbleProps> = ({ message, index, isReasoningExpanded, onToggleReasoning, isItUser, onOpenReportModal }) => {
    const isUser = message.type === 'user';
    const canReport = !isUser && message.recordId; // Can only report bot messages with a DB record ID
    const [copied, setCopied] = useState(false);

    const handleCopyMessage = async () => {
        const textToCopy = message.content || '';
        try {
            if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                (document as any).execCommand && (document as any).execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            {/* Message Bubble Styling */}
            <div className={`max-w-4xl px-4 py-3 rounded-lg ${isUser ? 'bg-blue-600 text-white' : message.isError ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-gray-100 text-gray-900'}`}>
                <div className="flex items-start space-x-3">
                    {/* Sender Icon */}
                    <div className="flex-shrink-0 mt-1">
                        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        {/* Message Content */}
                        <div className="break-words">
                            {isUser ? (
                                // Render user messages with URL handling
                                <div className="text-white leading-relaxed whitespace-pre-wrap">{renderTextWithUrls(message.content || '')}</div>
                            ) : (
                                // Render bot messages using Markdown
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents} urlTransform={urlTransform}>
                                        {message.content || ''}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>

                        {/* Optional: Render Chart if present */}
                        {message.type === 'bot' && message.chart && (
                            <ChatMessageChart chartData={message.chart} />
                        )}

                        {/* Optional: Render Interactive Reasoning if present and user is IT */}
                        {message.type === 'bot' && !message.isError && message.reasoningSteps && message.reasoningSteps.length > 0 && isItUser && (
                            <InteractiveReasoning
                                steps={message.reasoningSteps}
                                isExpanded={isReasoningExpanded} // Pass down the expansion state
                                onToggle={onToggleReasoning} // Pass down the toggle function
                            />
                        )}

                        {/* Footer: Report Button and Timestamp */}
                        <div className="flex justify-between items-center mt-2">
                            {canReport ? (
                                <button onClick={() => onOpenReportModal(message)} className="flex items-center text-xs text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Report an issue with this response">
                                    <Flag className="w-3 h-3 mr-1" /> Report issue
                                </button>
                            ) : <div />} {/* Placeholder for alignment */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyMessage}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/5 ${isUser ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                    title={copied ? 'Copied' : 'Copy message'}
                                    aria-label="Copy message"
                                >
                                    {copied ? (
                                        <CheckIcon className="w-3.5 h-3.5" />
                                    ) : (
                                        <CopyIcon className="w-3.5 h-3.5" />
                                    )}
                                </button>
                                <p className={`text-xs ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>{formatSmartTimestamp(message.timestamp)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// Report Issue Modal (No changes)
// =============================================================================
const ReportIssueModal: FC<ReportIssueModalProps> = ({ isOpen, onClose, onSubmit, message }) => {
    // ... (Code remains the same)
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) setComment("");
    }, [isOpen]);

    if (!isOpen || !message) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(comment);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Flag className="w-5 h-5 mr-2 text-red-500" />
                        Report an issue with this response
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                    You are reporting an issue for the following message:
                </p>
                <div className="bg-gray-100 p-3 rounded-md border border-gray-200 max-h-32 overflow-y-auto mb-4">
                    <p className="text-sm text-gray-700 italic truncate">
                        {message.content}
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <label htmlFor="reportComment" className="text-sm font-medium text-gray-700 block mb-2">
                        Optional: What went wrong?
                    </label>
                    <textarea
                        id="reportComment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., The data seems incorrect, the chart is wrong..."
                    />
                    
                    <div className="flex justify-end space-x-3 mt-5">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 flex items-center disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Send className="w-4 h-4 mr-2" />
                            )}
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =============================================================================
// Main ChatMessages Component (Manages Expansion State)
// =============================================================================
const ChatMessages: FC<ChatMessagesProps> = ({ chatMessages, configuredApis, isLoading, statusMessage, isItUser }) => {
    // Refs for scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    
    // State for managing which reasoning sections are expanded (lifted state)
    // Key: message.id, Value: boolean (true if expanded)
    const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

    // State for file downloads (if needed)
    const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
    const { addNotification } = useNotifications(); // For showing success/error messages

    // State for the report issue modal
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportingMessage, setReportingMessage] = useState<ChatMessageForRender | null>(null);

    // Function to toggle the expansion state for a specific message's reasoning
    const toggleReasoning = (messageId: string) => {
        setExpandedReasoning(prev => ({
            ...prev, // Keep existing states
            [messageId]: !prev[messageId] // Flip the state for the clicked message ID
        }));
    };

    // --- Handlers for Report Modal ---
    const handleOpenReportModal = (message: ChatMessageForRender) => {
        setReportingMessage(message);
        setIsReportModalOpen(true);
    };
    const handleCloseReportModal = () => {
        setIsReportModalOpen(false);
        setReportingMessage(null);
    };
    const handleSubmitReport = async (comment: string) => {
        if (!reportingMessage || !reportingMessage.recordId) {
            addNotification("Cannot report message: Missing message ID.", 'error');
            return;
        }
        try {
            await chatService.reportRecord(reportingMessage.recordId, comment);
            addNotification("Issue reported successfully. Thank you for your feedback!", 'success');
            handleCloseReportModal();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addNotification(`Error submitting report: ${errorMessage}`, 'error');
        }
    };

    // markdown helpers and MessageBubble hoisted above

    // --- Loading and Empty State Components (No Changes) ---
    const LoadingIndicator = () => (
        <div className="flex justify-start"><div className="bg-gray-100 rounded-lg px-4 py-3 max-w-md"><div className="flex items-center space-x-3"><div className="relative flex items-center justify-center w-8 h-8"><Bot className="w-5 h-5 text-blue-700 z-10 relative" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-400 rounded-full animate-ping opacity-80"></div></div><div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 border border-blue-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.6s', animationDuration: '1.5s' }}></div></div></div><span className="text-sm text-gray-600">{statusMessage || 'Thinking...'}</span></div></div></div>
    );
    const EmptyState = () => (
        <div className="text-center text-gray-500 mt-8"><Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" /><p className="text-base font-medium">Hello! I'm your AI assistant.</p><p className="text-sm mt-1">{isItUser ? "Ask me about your configured APIs." : "Ask me about your available data."}</p>{configuredApis.length === 0 && (<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg inline-flex"><AlertCircle className="w-4 h-4 text-yellow-600 mr-2" /><p className="text-xs text-yellow-700">{isItUser ? "Configure some APIs first to start chatting!" : "Data sources are not available yet."}</p></div>)}</div>
    );

    // --- Auto-scroll Effect ---
    useEffect(() => {
        // Scrolls to the bottom when new messages arrive or loading starts/stops,
        // but only if the user is already near the bottom.
        const container = containerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom || shouldAutoScroll) {
            setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' }), 100);
        }
    }, [chatMessages, isLoading]); // Dependency array includes messages and loading state

    // --- Scroll Handler ---
    const handleScroll = () => {
        // Tracks if the user has scrolled up, disabling auto-scroll if they have.
        const container = containerRef.current;
        if (!container) return;
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
        setShouldAutoScroll(isAtBottom);
    };

    // --- Main Render Logic ---
    return (
        // Container div with scroll handling and ref
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

            {/* Render the Report Issue Modal (conditionally visible) */}
            <ReportIssueModal
                isOpen={isReportModalOpen}
                onClose={handleCloseReportModal}
                onSubmit={handleSubmitReport}
                message={reportingMessage}
            />

            {/* Display Empty State or Messages */}
            {chatMessages.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* Map through messages and render MessageBubble for each */}
                    {chatMessages.map((message, index) => (
                        <MessageBubble
                            key={message.id || index}
                            message={message}
                            index={index}
                            // Pass the correct expansion state for *this* message
                            isReasoningExpanded={expandedReasoning[message.id] || false}
                            // Pass the toggle function specific to *this* message ID
                            onToggleReasoning={() => toggleReasoning(message.id)}
                            isItUser={isItUser}
                            onOpenReportModal={handleOpenReportModal}
                        />
                    ))}
                    {/* Show loading indicator if processing */}
                    {isLoading && <LoadingIndicator />}
                </>
            )}
            {/* Empty div at the end to help with scrolling to the bottom */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;