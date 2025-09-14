import React, { useState, useEffect, useMemo } from 'react';
import { apiService, ApiDocument } from '../../services/apiService';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ExampleQueries from './ExampleQueries';
import { useChat } from '../../hooks/useChat';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Bot, Trash2 } from 'lucide-react';

/**
 * The main component for the Chat tab.
 * It orchestrates the chat interface, including message display, input,
 * and example queries, tailoring the experience based on the user's role.
 */
const ChatTab: React.FC = () => {
    const [configuredApis, setConfiguredApis] = useState<ApiDocument[]>([]);
    const [loadingApis, setLoadingApis] = useState(true);
    
    const { addNotification } = useNotifications();
    const { user } = useAuth();

    // The useChat hook manages the state and logic of the conversation.
    const {
        chatMessages,
        currentMessage,
        isLoading,
        includeReasoning,
        setIncludeReasoning,
        setCurrentMessage,
        handleSendMessage,
        clearChat,
        handleExampleQuery
    } = useChat();

    // Determine if the current user has an IT role.
    const isItUser = useMemo(() =>
        user?.authorities?.includes('ROLE_IT') ?? false,
        [user]
    );

    // Effect to load the list of configured data sources on component mount.
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

    const formattedChatMessages = useMemo(() => chatMessages.map(msg => ({
        ...msg,
        id: String(msg.id), // Convert number to string
    })), [chatMessages]);

    return (
        <div className="h-full flex gap-4">
            <div className="flex-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
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
                                title="Clear chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <ChatMessages
                    chatMessages={formattedChatMessages} // Use the correctly typed messages
                    isItUser={isItUser}
                    configuredApis={configuredApis}
                    isLoading={isLoading}
                />

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

            <div className="w-96 overflow-hidden">
                <ExampleQueries
                    configuredApis={configuredApis}
                    onExampleClick={handleExampleQuery}
                    isItUser={isItUser}
                />
            </div>
        </div>
    );
};

export default ChatTab;