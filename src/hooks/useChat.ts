import { useState, useCallback } from 'react';
import { chatService, ChatSettings, ChatResponse, ConversationSummary } from '../services/chatService';
import { useNotifications } from '../context/NotificationContext';
import { ChartDataType } from '../components/Chat/ChatMessageChart';

// Define the shape of a single chat message for the UI state.
// This interface now mirrors the backend's ChatResponse DTO more closely.
export interface ChatMessage {
    id: number;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    isError?: boolean;
    chart?: ChartDataType | null;
    reasoning?: string;
    conversationId?: string;
}

/**
 * A comprehensive custom hook to manage the state and logic of a chat conversation.
 *
 * It encapsulates message history, loading states, user input, and the core logic for
 * sending messages to the backend. It integrates with NotificationContext to display
 * global notifications and with ChatService for API communication.
 */
export const useChat = () => {
    const { addNotification } = useNotifications();

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    
    const [includeReasoning, setIncludeReasoning] = useState(true);
    const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    /**
     * Sends the current message using customizable settings.
     */
    const handleSendMessage = useCallback(async () => {
        const message = currentMessage;
        if (!message.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date(),
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setCurrentMessage('');
        setStatusMessage('Connecting');

        const settings: ChatSettings = {
            forceReAct: includeReasoning,
            maxIterations: 10,
            timeoutSeconds: 120,
            language: 'en',
            includeReasoning: includeReasoning,
        };

        await chatService.streamMessage(message, settings, {
            onStatus: (status) => {
                setStatusMessage(status);
            },
            onFinalResponse: (response: ChatResponse) => {
                const botMessage: ChatMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: response.content,
                    timestamp: new Date(response.timestamp),
                    isError: !response.success,
                    chart: response.chart || null,
                    reasoning: response.reasoning,
                    conversationId: response.conversationId,
                };
                setChatMessages(prev => [...prev, botMessage]);
                fetchHistory(); 
            },
            onError: (errorMsg) => {
                const errorBotMessage: ChatMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: `Sorry, an error occurred: ${errorMsg}`,
                    timestamp: new Date(),
                    isError: true,
                };
                setChatMessages(prev => [...prev, errorBotMessage]);
                addNotification(errorMsg, 'error');
            },
            onClose: () => {
                setIsLoading(false);
                setStatusMessage(null);
            }
        });

    }, [currentMessage, includeReasoning, addNotification]);
        
    /**
     * Clears the current chat history to start a new conversation.
     */
    const clearChat = useCallback(() => {
        setChatMessages([]);
        chatService.clearConversation();
        addNotification('New chat started', 'info');
    }, [addNotification]);

    /**
     * Sets the content of the chat input box to an example query.
     */
    const handleExampleQuery = useCallback((query: string) => {
        setCurrentMessage(query);
    }, []);

    /**
     * Gets information about the current conversation session.
     */
    const getConversationInfo = useCallback(() => {
        return {
            conversationId: chatService.getConversationId(),
            hasActiveConversation: chatService.hasActiveConversation(),
            messageCount: chatMessages.length
        };
    }, [chatMessages.length]);

    /**
     * Fetches the conversation history from the backend and updates the state.
     */
    const fetchHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        try {
            const history = await chatService.getConversationHistory();
            setConversationHistory(history);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addNotification(`Failed to load conversation history: ${errorMessage}`, 'error');
        } finally {
            setIsLoadingHistory(false);
        }
    }, [addNotification]);

    /**
     * Loads a selected conversation's full message history into the main chat view.
     */
    const loadConversation = useCallback(async (conversationId: string) => {
        setIsLoading(true);
        setChatMessages([]);
        try {
            const details = await chatService.getConversationDetails(conversationId);

            const loadedMessages: ChatMessage[] = details.map((detail, index) => {
                const userMessage: ChatMessage = {
                    id: new Date(detail.timestamp).getTime() + index,
                    type: 'user',
                    content: detail.userPrompt,
                    timestamp: new Date(detail.timestamp)
                };
                const botMessage: ChatMessage = {
                    id: new Date(detail.timestamp).getTime() + index + 0.5,
                    type: 'bot',
                    content: detail.responseText,
                    timestamp: new Date(detail.timestamp),
                    isError: detail.isError,
                    chart: detail.responseChart || null,
                    reasoning: detail.stepByStepReasoning
                };
                return [userMessage, botMessage];
            }).flat();

            setChatMessages(loadedMessages);
            chatService.setConversationId(conversationId);
            addNotification(`Conversation ${conversationId.slice(0, 10)}... loaded`, 'success');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addNotification(`Failed to load conversation: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    /**
     * Handles the deletion of a conversation.
     * @param conversationId The ID of the conversation to delete.
     */
    const handleDeleteConversation = useCallback(async (conversationId: string) => {
        try {
            // Call the service to delete the conversation in the backend.
            await chatService.deleteConversation(conversationId);
            addNotification('Conversation deleted successfully', 'success');

            // If the deleted conversation was the active one, clear the chat.
            if (chatService.getConversationId() === conversationId) {
                clearChat();
            }

            // Refetch the history to update the list in the UI.
            fetchHistory();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addNotification(`Error deleting conversation: ${errorMessage}`, 'error');
        }
    }, [addNotification, fetchHistory, clearChat]);

    // Return all the state and handlers that the UI components will need.
    return {
        chatMessages,
        currentMessage,
        isLoading,
        statusMessage, 
        includeReasoning,
        setIncludeReasoning,
        setCurrentMessage,
        handleSendMessage,
        handleExampleQuery,
        conversationHistory,
        isLoadingHistory,
        fetchHistory,
        loadConversation,
        clearChat,
        getConversationInfo,
        handleDeleteConversation,
    };
};