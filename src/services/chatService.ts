import apiClient from '../api/axiosConfig';
import { ChartDataType } from '../components/Chat/ChatMessageChart';
import { fetchEventSource } from '@microsoft/fetch-event-source';

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

// DTO from the Backend Stream
export interface SseEvent {
    type: 'STATUS' | 'FINAL_RESPONSE' | 'ERROR';
    payload: any;
}

/**
 * Defines the structure of the response payload received from the backend chat API.
 */
export interface ChatResponse {
    content: string;
    timestamp: number;
    conversationId: string;
    success: boolean;
    processingType: string;
    reasoning: string;
    processingTimeMs: number;
    chart?: any;
}

/**
 * Defines the structure for a conversation summary, used for the history panel.
 */
export interface ConversationSummary {
    conversationId: string;
    title: string;
    lastUpdated: Date; 
}

/**
 * Defines the structure for a single turn in a detailed conversation history.
 */
export interface ConversationDetail {
    userPrompt: string;
    responseText: string;
    responseChart?: ChartDataType;
    stepByStepReasoning?: string;
    timestamp: Date; // ISO date string from backend
    isError: boolean;
}

// --- CALLBACKS INTERFACE FOR THE NEW STREAMING METHOD ---
/*
 * Callbacks interface for the streaming method
*/
interface StreamCallbacks {
    onStatus: (message: string) => void;
    onFinalResponse: (response: ChatResponse) => void;
    onError: (error: string) => void;
    onClose: () => void;
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
    private ctrl: AbortController | null = null; // To allow aborting the stream

    /**
     * Initiates a streaming chat request to the backend.
     * Uses callbacks to handle the flow of events (status, final response, error).
     * @param message The user's query.
     * @param settings The configuration for the chat request.
     * @param callbacks An object containing handler functions for stream events.
     */
    async streamMessage(message: string, settings: ChatSettings, callbacks: StreamCallbacks) {
        if (!this.conversationId) {
            this.conversationId = this.generateConversationId();
        }

        // Abort any previous stream that might still be running
        if (this.ctrl) {
            this.ctrl.abort();
        }
        this.ctrl = new AbortController();

        const requestBody: ChatRequest = {
            query: message,
            conversationId: this.conversationId,
            ...settings,
        };

        const token = localStorage.getItem('accessToken');

        await fetchEventSource(`${this.baseUrl}/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody),
            signal: this.ctrl.signal,

            onmessage(event) {
                const sseEvent: SseEvent = JSON.parse(event.data);
                switch (sseEvent.type) {
                    case 'STATUS':
                        callbacks.onStatus(sseEvent.payload as string);
                        break;
                    case 'FINAL_RESPONSE':
                        const chatResponse = sseEvent.payload as ChatResponse;
                        // Update conversationId from the final response
                        if (chatResponse.conversationId) {
                            chatService.conversationId = chatResponse.conversationId;
                        }
                        callbacks.onFinalResponse(chatResponse);
                        break;
                    case 'ERROR':
                        callbacks.onError(sseEvent.payload as string);
                        break;
                }
            },
            onclose() {
                callbacks.onClose();
                chatService.ctrl = null; // Clear the controller
            },
            onerror(err) {
                callbacks.onError(err.message || 'A network error occurred.');
                chatService.ctrl = null; // Clear the controller
                throw err; // This is important to stop retries
            }
        });
    }
    
    /**
     * Fetches the list of conversation summaries for the authenticated user.
     */
    async getConversationHistory(): Promise<ConversationSummary[]> {
        try {
            // The backend sends a DTO where lastUpdated is a string
            interface ConversationSummaryFromAPI {
                conversationId: string;
                title: string;
                lastUpdated: number;
            }

            const response = await apiClient.get<ConversationSummaryFromAPI[]>(`/api/conversations`);
            
            return response.data.map(conv => ({
                ...conv,
                lastUpdated: new Date(conv.lastUpdated * 1000),
            }));

        } catch (error: any) {
            console.error('Error fetching conversation history:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch history');
        }
    }

    /**
     * Fetches the full message history for a specific conversation.
     * @param conversationId The ID of the conversation to retrieve.
     * @returns A promise that resolves to an array of detailed conversation messages.
     */
    async getConversationDetails(conversationId: string): Promise<ConversationDetail[]> {
        try {
            // Define an interface for the raw data from the API, where timestamp is a number
            interface ConversationDetailFromAPI {
                userPrompt: string;
                responseText: string;
                responseChart?: ChartDataType;
                stepByStepReasoning?: string;
                timestamp: number; // Expecting a Unix timestamp (seconds)
                isError: boolean;
            }

            const response = await apiClient.get<ConversationDetailFromAPI[]>(`/api/conversations/${conversationId}`);
            
            // Map over the results to convert the numeric timestamp into a Date object
            return response.data.map(detail => ({
                ...detail,
                timestamp: new Date(detail.timestamp * 1000),
            }));

        } catch (error: any) {
            console.error(`Error fetching details for conversation ${conversationId}:`, error);
            throw new Error(error.response?.data?.message || `Failed to fetch details for ${conversationId}`);
        }
    }

    /**
     * Sends a request to delete a full conversation.
     * @param conversationId The ID of the conversation to delete.
     */
    async deleteConversation(conversationId: string): Promise<void> {
        try {
            await apiClient.delete(`/api/conversations/${conversationId}`);
        } catch (error: any) {
            console.error(`Error deleting conversation ${conversationId}:`, error);
            // Rethrow the error so the calling hook can handle it and notify the user.
            throw new Error(error.response?.data?.message || `Failed to delete conversation ${conversationId}`);
        }
    }

    /**
     * Handles the download of a secure file by making an authenticated API call.
     * @param downloadUrl The relative URL of the file to download (e.g., /api/files/download/...).
     */
    async downloadFile(downloadUrl: string): Promise<void> {
        try {
            const response = await apiClient.get(downloadUrl, {
                responseType: 'blob',
            });

            const filename = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Limpiamos el enlace temporal
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error: any) {
            console.error('File download error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to download file.';
            alert(`Download Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }
    }

    /**
     * Generates a new unique identifier for a conversation session.
     * @returns A unique string for the conversation ID.
     */
    generateConversationId(): string {
        return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
export const chatService = new ChatService();