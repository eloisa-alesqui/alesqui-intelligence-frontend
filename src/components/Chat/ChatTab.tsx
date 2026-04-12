import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import AssistantCapabilities from './AssistantCapabilities';
import ConversationHistory from './ConversationHistory';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Bot, Trash2, History, X } from 'lucide-react';
import { ApiDocument } from '../../types';

/**
 * The main component for the Chat tab.
 * It orchestrates the entire chat interface, including the conversation history panel,
 * message display, and input controls. It tailors the user experience based on the
 * authenticated user's role (e.g., "IT" vs. "Business").
 */
const ChatTab: React.FC = () => {
    /** State to hold the list of currently configured APIs or data sources. */
    const [configuredApis, setConfiguredApis] = useState<ApiDocument[]>([]);
    /** State to manage the loading status while fetching the API list. */
    const [loadingApis, setLoadingApis] = useState(true);
    /** State to control the mobile conversation history drawer. */
    const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
    
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const location = useLocation();

    /**
     * The useChat hook provides all state and logic for managing the chat conversation,
     * including message history, loading states, and user input.
     */
    const {
        chatMessages,
        currentMessage,
        isLoading,
        includeReasoning,
        conversationHistory,
        isLoadingHistory,
        getConversationInfo,
        setIncludeReasoning,
        setCurrentMessage,
        handleSendMessage,
        clearChat,
        handleExampleQuery,
        fetchHistory,
        loadConversation,
        handleDeleteConversation,
        statusMessage,
    } = useChat();

    /**
     * An effect that runs once on component mount to fetch the user's
     * conversation history.
     */
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Auto-load conversation when navigating from Dashboard
    useEffect(() => {
        const conversationId = (location.state as { conversationId?: string })?.conversationId;
        if (conversationId) {
            loadConversation(conversationId);
            // Clear the state so a browser refresh doesn't re-trigger the load
            window.history.replaceState({}, '');
        }
    }, [location.state, loadConversation]);

    /**
     * An effect that runs once on component mount to load the list of
     * available APIs/data sources.
     */
    useEffect(() => {
        const loadApis = async () => {
            try {
                setLoadingApis(true);
                const data = await apiService.getAllApisSimple();
                setConfiguredApis(data);
            } catch (error) {
                console.error('Error loading APIs:', error);
                addNotification('Error loading configured data sources', 'error');
            } finally {
                setLoadingApis(false);
            }
        };

        loadApis();
    }, [addNotification]);

    /**
     * A memoized value to determine if the current user has an IT role.
     * This is used to conditionally render UI elements like the "reasoning" checkbox.
     */
    const isItUser = useMemo(() =>
        user?.authorities?.includes('ROLE_IT') ?? false,
        [user]
    );

    /**
     * A memoized value to determine if the current user has an SUPERADMIN role.
     * This is used to conditionally render UI elements like the "reasoning" checkbox.
     */
    const isSuperadminUser = useMemo(() =>
        user?.authorities?.includes('ROLE_SUPERADMIN') ?? false,
        [user]
    );

    /**
     * A memoized value to determine if the current user has an TRIAL role.
     * This is used to conditionally render UI elements like the "reasoning" checkbox.
     */
    const isTrialUser = useMemo(() =>
        user?.authorities?.includes('ROLE_TRIAL') ?? false,
        [user]
    );

    /**
     * A combined memoized value to determine if the user should have access to technical features.
     * Users with IT, SUPERADMIN, or TRIAL roles get access to advanced capabilities.
     */
    const hasTechnicalAccess = useMemo(() =>
        isItUser || isSuperadminUser || isTrialUser,
        [isItUser, isSuperadminUser, isTrialUser]
    );  

    /**
     * A memoized transformation of chat messages to ensure their IDs are strings,
     * which is a requirement for the keys in React's list rendering.
     */
    const formattedChatMessages = useMemo(() => chatMessages.map(msg => ({
        ...msg,
        id: String(msg.id),
        recordId: msg.recordId,
    })), [chatMessages]);

    /**
     * Retrieves the ID of the currently active conversation from the useChat hook.
     * This is passed to the history panel to highlight the selected chat.
     */
    const currentConversationId = getConversationInfo().conversationId;

    return (
        <div className="h-full w-full overflow-hidden p-2 sm:p-4 lg:p-6">
            <div className="h-full flex gap-2 sm:gap-4 lg:gap-6 min-w-0">
                {/* --- Left: Conversation History Panel (desktop only) --- */}
                <div className="hidden lg:flex w-80 flex-shrink-0">
                    <ConversationHistory
                        history={conversationHistory}
                        isLoading={isLoadingHistory}
                        onNewChat={clearChat}
                        onLoadConversation={loadConversation}
                        onDeleteConversation={handleDeleteConversation}
                        currentConversationId={currentConversationId}
                    />
                </div>

                {/* --- Center: Main Chat Area --- */}
                <div className="flex-1 min-w-0 bg-white shadow-lg flex flex-col overflow-hidden rounded-lg h-full">
                    <div className="border-b p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Mobile history toggle */}
                                <button
                                    onClick={() => setIsMobileHistoryOpen(true)}
                                    className="lg:hidden p-2 -ml-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    aria-label="Open conversation history"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Bot className="w-5 h-5 mr-2 text-blue-600" />
                                        {hasTechnicalAccess ? "Chat with your APIs" : "Ask about your data"}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {hasTechnicalAccess ? `Ask anything about your configured APIs (${configuredApis.length} available)` : "Ask any question about the available data sources"}
                                    </p>
                                </div>
                            </div>
                            {chatMessages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                    title="Clear and start new chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <ChatMessages
                        chatMessages={formattedChatMessages}
                        hasTechnicalAccess={hasTechnicalAccess}
                        configuredApis={configuredApis}
                        isLoading={isLoading}
                        statusMessage={statusMessage}
                        onExampleClick={handleExampleQuery}
                    />

                    <div className="flex-shrink-0">
                        <ChatInput
                            currentMessage={currentMessage}
                            setCurrentMessage={setCurrentMessage}
                            onSendMessage={handleSendMessage}
                            configuredApis={configuredApis}
                            isLoading={isLoading}
                            includeReasoning={includeReasoning}
                            onReasoningChange={setIncludeReasoning}
                            hasTechnicalAccess={hasTechnicalAccess}
                        />
                    </div>
                </div>

                {/* --- Right: Example Queries Panel --- */}
                <div className="w-92 overflow-hidden hidden lg:block">
                    <AssistantCapabilities
                        configuredApis={configuredApis}
                        onExampleClick={handleExampleQuery}
                        hasTechnicalAccess={hasTechnicalAccess}
                    />
                </div>
            </div>

            {/* Mobile drawer overlay */}
            {isMobileHistoryOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setIsMobileHistoryOpen(false)}
                    />
                    {/* Drawer panel */}
                    <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 flex flex-col">
                        {/* Close header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                            <button
                                onClick={() => setIsMobileHistoryOpen(false)}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Close conversation history"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* ConversationHistory content */}
                        <div className="flex-1 overflow-hidden">
                            <ConversationHistory
                                history={conversationHistory}
                                isLoading={isLoadingHistory}
                                onNewChat={() => { clearChat(); setIsMobileHistoryOpen(false); }}
                                onLoadConversation={(id) => { loadConversation(id); setIsMobileHistoryOpen(false); }}
                                onDeleteConversation={handleDeleteConversation}
                                currentConversationId={currentConversationId}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatTab;