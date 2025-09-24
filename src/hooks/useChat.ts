import { useState, useCallback } from 'react';
import {
    chatService,
    ChatSettings,
    SendMessageResponse,
    ConversationSummary,
    ConversationDetail
} from '../services/chatService';
import { useNotifications, NotificationType } from '../context/NotificationContext';
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
    processingTimeMs?: number;
    processingType?: string;
    metadata?: Record<string, any>; 

    // Include the full raw response from the service for backward compatibility or deep debugging
    responseDetails?: SendMessageResponse;
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
    const [includeReasoning, setIncludeReasoning] = useState(true);
    const [conversationHistory, setConversationHistory] = useState<ConversationSummary[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    /**
     * A private helper function to handle the common logic of sending a message.
     */
    const performSendMessage = useCallback(async (message: string, settings: ChatSettings, successNotification: { message: string, type: NotificationType }) => {
        if (!message.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setCurrentMessage('');

        try {
            const response = await chatService.sendMessage(message, settings);

            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.content,
                timestamp: response.timestamp,
                isError: !response.success, // Use the success flag from the DTO
                chart: response.chart || null,
                reasoning: response.reasoning,
                conversationId: response.conversationId,
                processingTimeMs: response.processingTimeMs,
                processingType: response.processingType,
                metadata: response.metadata,
                responseDetails: response, // Keep the full object for reference
            };
            setChatMessages(prev => [...prev, botMessage]);

            if (response.success) {
                addNotification(successNotification.message, successNotification.type);
            } else {
                addNotification(response.content, 'error');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            addNotification(`Error: ${errorMessage}`, 'error');

            const errorBotMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an unhandled error. Please check the console and try again.',
                timestamp: new Date(),
                isError: true
            };
            setChatMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
            fetchHistory();
        }
    }, [addNotification]);


    /**
     * Sends the current message using customizable settings.
     */
    const handleSendMessage = useCallback(() => {
        const settings = {
            forceReAct: includeReasoning,
            maxIterations: 10,
            timeoutSeconds: 90,
            language: 'es',
            includeReasoning: includeReasoning
        };
        const notification = {
            message: `Message processed successfully.`,
            type: 'success' as NotificationType
        };
        performSendMessage(currentMessage, settings, notification);
    }, [currentMessage, includeReasoning, performSendMessage]);

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

    // Return all the state and handlers that the UI components will need.
    return {
        chatMessages,
        currentMessage,
        isLoading,
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
        getConversationInfo
    };
};