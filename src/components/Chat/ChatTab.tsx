import React, { useState, useEffect, useMemo } from 'react';
import { apiService, ApiDocument } from '../../services/apiService';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExampleQueries from './ExampleQueries';
import ConversationHistory from './ConversationHistory';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Bot, Trash2 } from 'lucide-react';

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
    
    const { addNotification } = useNotifications();
    const { user } = useAuth();

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
    } = useChat();

    /**
     * An effect that runs once on component mount to fetch the user's
     * conversation history.
     */
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

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
     * A memoized transformation of chat messages to ensure their IDs are strings,
     * which is a requirement for the keys in React's list rendering.
     */
    const formattedChatMessages = useMemo(() => chatMessages.map(msg => ({
        ...msg,
        id: String(msg.id),
    })), [chatMessages]);

    /**
     * Retrieves the ID of the currently active conversation from the useChat hook.
     * This is passed to the history panel to highlight the selected chat.
     */
    const currentConversationId = getConversationInfo().conversationId;

    return (
        <div className="h-full w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="h-full flex gap-6">
                {/* --- Left: Conversation History Panel --- */}
                <ConversationHistory
                    history={conversationHistory}
                    isLoading={isLoadingHistory}
                    onNewChat={clearChat}
                    onLoadConversation={loadConversation}
                    currentConversationId={currentConversationId}
                />

                {/* --- Center: Main Chat Area --- */}
                <div className="flex-1 bg-white shadow-lg flex flex-col overflow-hidden rounded-lg h-full">
                    <div className="border-b p-4 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Bot className="w-5 h-5 mr-2 text-blue-600" />
                                    {isItUser ? "Chat with your APIs" : "Ask about your data"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {isItUser ? `Ask anything about your configured APIs (${configuredApis.length} available)` : "Ask any question about the available data sources"}
                                </p>
                            </div>
                            {chatMessages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors"
                                    title="Clear and start new chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <ChatMessages
                        chatMessages={formattedChatMessages}
                        isItUser={isItUser}
                        configuredApis={configuredApis}
                        isLoading={isLoading}
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
                            isItUser={isItUser}
                        />
                    </div>
                </div>

                {/* --- Right: Example Queries Panel --- */}
                <div className="w-92 overflow-hidden hidden lg:block">
                    <ExampleQueries
                        configuredApis={configuredApis}
                        onExampleClick={handleExampleQuery}
                        isItUser={isItUser}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatTab;