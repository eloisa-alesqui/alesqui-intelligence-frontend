import apiClient from '../api/axiosConfig';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * Defines the configurable settings for a chat interaction.
 */
export interface ChatSettings {
    forceReAct: boolean;
    maxIterations: number;
    timeoutSeconds: number;
    language: string;
    includeReasoning: boolean;
}

/**
 * Defines the structure of the request payload sent to the backend chat API.
 */
export interface ChatRequest {
    query: string;
    conversationId: string;
    // Includes all settings from ChatSettings
    [key: string]: any; 
}

/**
 * Defines the structure of the response payload received from the backend chat API.
 */
export interface ChatResponse {
    content: string;
    timestamp: number; // Expecting a Unix timestamp (seconds)
    conversationId: string;
    success: boolean;
    processingType: string;
    iterations: number;
    reasoning: string;
    processingTimeMs: number;
    confidenceScore: number;
    metadata?: Record<string, any>;
    chart?: any; // Can be any chart data structure
    error?: string;
}

/**
 * Defines the structure of the final, processed response returned by the service.
 * This is a more frontend-friendly version of ChatResponse.
 */
export interface SendMessageResponse {
    content: string;
    timestamp: Date; // Converted to a Date object
    conversationId: string;
    success: boolean;
    processingType: string;
    reasoning: string;
    processingTimeMs: number;
    metadata?: Record<string, any>;
    chart?: any;
    error: boolean;
}

// ================================================================================================
// CHAT SERVICE CLASS
// ================================================================================================

/**
 * Service for managing chat conversations with the backend AI.
 *
 * This class handles the state of the current conversation (via conversationId)
 * and orchestrates the sending and receiving of messages to the chat API.
 */
class ChatService {
    private baseUrl = '/api/chat';
    private conversationId: string | null = null;

    /**
     * Generates a new unique identifier for a conversation session.
     * @returns A unique string for the conversation ID.
     */
    private generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Sends a message to the backend chat service with the specified settings.
     * This is the core method for communicating with the AI.
     * @param message The user's query.
     * @param settings The configuration for the chat request.
     * @returns A promise that resolves to a frontend-friendly chat response.
     */
    async sendMessage(message: string, settings: ChatSettings): Promise<SendMessageResponse> {
        // Ensure a conversation ID exists for this session.
        if (!this.conversationId) {
            this.conversationId = this.generateConversationId();
        }

        const requestBody: ChatRequest = {
            query: message,
            conversationId: this.conversationId,
            ...settings,
        };

        try {
            // Use the centralized apiClient for the authenticated request.
            const response = await apiClient.post<ChatResponse>(`${this.baseUrl}/message`, requestBody);
            const data = response.data;

            // Update the conversation ID from the response to maintain state.
            if (data.conversationId) {
                this.conversationId = data.conversationId;
            }

            // Map the backend response to a more frontend-friendly format.
            return {
                content: data.content,
                timestamp: new Date(data.timestamp * 1000), // Convert Unix timestamp
                conversationId: data.conversationId,
                success: data.success,
                processingType: data.processingType,
                reasoning: data.reasoning || '',
                processingTimeMs: data.processingTimeMs,
                metadata: data.metadata,
                chart: data.chart,
                error: !data.success
            };
        } catch (error: any) {
            console.error('Error sending message:', error);

            // Construct a standardized error response.
            const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
            return {
                content: `Error: ${errorMessage}`,
                timestamp: new Date(),
                conversationId: this.conversationId || 'error-no-id',
                success: false,
                processingType: 'ERROR',
                reasoning: '',
                processingTimeMs: 0,
                metadata: undefined,
                chart: undefined,
                error: true
            };
        }
    }

    /**
     * Resets the current conversation, forcing a new conversationId on the next message.
     */
    clearConversation(): void {
        this.conversationId = null;
    }

    /**
     * Retrieves the ID of the currently active conversation.
     * @returns The current conversation ID or null if none is active.
     */
    getConversationId(): string | null {
        return this.conversationId;
    }

    /**
     * Manually sets the conversation ID, for example, to continue a previous session.
     * @param conversationId The ID of the conversation to resume.
     */
    setConversationId(conversationId: string): void {
        this.conversationId = conversationId;
    }

    /**
     * Check if there's an active conversation
     */
    hasActiveConversation(): boolean {
      return this.conversationId !== null;
    }
}

/**
 * Singleton instance of the ChatService.
 */
export const chatService = new ChatService();

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * A collection of pure utility functions related to the chat service.
 */
export const ChatUtils = {
    /**
     * Creates a default set of chat settings for standard queries.
     * @returns A ChatSettings object with default values.
     */
    createDefaultSettings(): ChatSettings {
        return {
            forceReAct: false,
            maxIterations: 5,
            timeoutSeconds: 30,
            language: 'en',
            includeReasoning: false,
        };
    },

    /**
     * Creates a set of chat settings specifically for ReAct-based queries.
     * @param maxIterations The maximum number of agent iterations.
     * @returns A ChatSettings object configured for the ReAct engine.
     */
    createReActSettings(maxIterations = 10): ChatSettings {
        return {
            forceReAct: true,
            maxIterations,
            timeoutSeconds: 60,
            language: 'en',
            includeReasoning: true,
        };
    },

    /**
     * Validates a ChatSettings object to ensure its values are within acceptable ranges.
     * @param settings The settings object to validate.
     * @returns True if the settings are valid, otherwise false.
     */
    validateSettings(settings: ChatSettings): boolean {
        return (
            typeof settings.forceReAct === 'boolean' &&
            settings.maxIterations >= 1 && settings.maxIterations <= 20 &&
            settings.timeoutSeconds >= 0 &&
            settings.language.length > 0 && settings.language.length <= 5 &&
            typeof settings.includeReasoning === 'boolean'
        );
    }

};