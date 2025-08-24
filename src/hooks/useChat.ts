import { useState } from 'react';
import { chatService, ChatSettings } from '../services/chatService';

interface ChatMessage {
    id: number;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    sources?: any[];
    suggestions?: string[];
    conversationId?: string;
    isError?: boolean;
    reasoning?: string[];
    processingType?: string;
    iterations?: number;
    confidenceScore?: number;
    processingTimeMs?: number;
}

interface ConfiguredApi {
    name: string;
    description: string;
    baseUrl: string;
    endpoints?: any[];
}

export const useChat = (addNotification: (message: string, type: string) => void) => {
    const [chatMessages, setChatMessages] = useState < ChatMessage[] > ([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [includeReasoning, setIncludeReasoning] = useState(true);

    /**
     * Send message with proper settings
     */
    const handleSendMessage = async (configuredApis: ConfiguredApi[] = []) => {
        if (!currentMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        const messageToSend = currentMessage;
        setCurrentMessage('');

        try {
            // Create chat settings - you can customize these based on your needs
            const settings: ChatSettings = {
                forceReAct: false,
                maxIterations: 5,
                timeoutSeconds: 90,
                language: 'es', // Spanish since the response was in Spanish
                includeReasoning: includeReasoning
            };

            // Send message with settings
            const response = await chatService.sendMessage(messageToSend, settings);

            // Create bot message from response
            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.content, // ✅ Using 'content' instead of 'message'
                timestamp: response.timestamp, // ✅ Already a Date object
                conversationId: response.conversationId,
                reasoning: response.reasoning,
                processingType: response.processingType,
                iterations: response.iterations,
                confidenceScore: response.confidenceScore,
                processingTimeMs: response.processingTimeMs,
                isError: response.error
            };

            setChatMessages(prev => [...prev, botMessage]);

            // Show success notification if needed
            if (response.processingTimeMs > 0) {
                addNotification(
                    `Message processed in ${response.processingTimeMs}ms (${response.processingType})`,
                    'success'
                );
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            addNotification('Error sending message: ' + errorMessage, 'error');

            const errorBotMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date(),
                isError: true
            };

            setChatMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Send message with ReAct enabled for complex queries
     */
    const handleSendReActMessage = async (configuredApis: ConfiguredApi[] = []) => {
        if (!currentMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        const messageToSend = currentMessage;
        setCurrentMessage('');

        try {
            // Use ReAct for complex reasoning
            const response = await chatService.sendReActMessage(messageToSend, 10);

            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.content,
                timestamp: response.timestamp,
                conversationId: response.conversationId,
                reasoning: response.reasoning,
                processingType: response.processingType,
                iterations: response.iterations,
                confidenceScore: response.confidenceScore,
                processingTimeMs: response.processingTimeMs,
                isError: response.error
            };

            setChatMessages(prev => [...prev, botMessage]);

            addNotification(
                `ReAct processing completed in ${response.iterations} iterations (${response.processingTimeMs}ms)`,
                'info'
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            addNotification('Error sending ReAct message: ' + errorMessage, 'error');

            const errorBotMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I encountered an error with ReAct processing. Please try again.',
                timestamp: new Date(),
                isError: true
            };

            setChatMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Send simple message with default settings
     */
    const handleSendSimpleMessage = async () => {
        if (!currentMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        const messageToSend = currentMessage;
        setCurrentMessage('');

        try {
            const response = await chatService.sendSimpleMessage(messageToSend);

            const botMessage: ChatMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response.content,
                timestamp: response.timestamp,
                conversationId: response.conversationId,
                reasoning: response.reasoning,
                processingType: response.processingType,
                iterations: response.iterations,
                confidenceScore: response.confidenceScore,
                processingTimeMs: response.processingTimeMs,
                isError: response.error
            };

            setChatMessages(prev => [...prev, botMessage]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            addNotification('Error sending simple message: ' + errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setChatMessages([]);
        chatService.clearConversation();
        addNotification('Chat cleared', 'info');
    };

    const handleExampleQuery = (query: string) => {
        setCurrentMessage(query);
    };

    // Get conversation info
    const getConversationInfo = () => {
        return {
            conversationId: chatService.getConversationId(),
            hasActiveConversation: chatService.hasActiveConversation(),
            messageCount: chatMessages.length
        };
    };

    return {
        chatMessages,
        currentMessage,
        isLoading,
        includeReasoning,
        setIncludeReasoning,
        setCurrentMessage,
        handleSendMessage,
        handleSendReActMessage,
        handleSendSimpleMessage,
        clearChat,
        handleExampleQuery,
        getConversationInfo
    };
};