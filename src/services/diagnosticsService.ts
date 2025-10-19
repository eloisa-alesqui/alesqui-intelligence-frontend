import apiClient from '../api/axiosConfig';
import { ConversationDetail } from './chatService';

/**
 * Represents the Spring Pageable object for requests.
 */
export interface Pageable {
    page: number;
    size: number;
    sort?: string; // e.g., "timestamp,desc"
}

/**
 * Represents the Spring Page object from responses.
 */
export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // Current page number
    size: number;
    first: boolean;
    last: boolean;
}

/**
 * Represents the ticket DTO from the backend.
 *
 */
export interface DiagnosticTicketDTO {
    recordId: string;
    conversationId: string;
    username: string;
    timestamp: number; 
    status: 'REPORTED_BY_USER' | 'ERROR_PROCESSING' | 'UNDER_REVIEW' | 'RESOLVED';
    userPrompt: string;
    userFeedbackComment: string | null;
}

// --- Service Class ---

class DiagnosticsService {
    private baseUrl = '/api/diagnostics';

    /**
     * Fetches a paginated list of diagnostic tickets from the backend.
     * @param pageable The pagination and sorting parameters.
     * @param statuses The statuses to filter by.
     */
    async getTickets(
        pageable: Pageable,
        statuses: string[],
        username: string
    ): Promise<Page<DiagnosticTicketDTO>> {
        
        try {
            const params: any = {
                page: pageable.page,
                size: pageable.size,
                sort: pageable.sort,
                statuses: statuses.join(',')
            };

            if (username) {
                params.username = username;
            }

            const response = await apiClient.get<Page<DiagnosticTicketDTO>>(
                `${this.baseUrl}/tickets`,
                { params } 
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching diagnostic tickets:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
        }
    }

    /**
     * Fetches the full detailed conversation history for an IT user.
     * This includes internal notes and full reasoning.
     * @param conversationId The ID of the conversation to fetch.
     */
    async getConversationDetailsForIT(conversationId: string): Promise<ConversationDetail[]> {
        try {
            interface ConversationDetailFromAPI {
                id: string;
                userPrompt: string;
                responseText: string;
                responseChart?: any; // Reutiliza tu tipo ChartDataType si lo tienes
                stepByStepReasoning?: string;
                timestamp: number;
                isError: boolean;
                userFeedbackComment?: string;
                internalNotes?: string[];
            }
            
            const response = await apiClient.get<ConversationDetailFromAPI[]>(
                `${this.baseUrl}/conversations/${conversationId}`
            );

            return response.data.map(detail => ({
                ...detail,
                timestamp: new Date(detail.timestamp * 1000),
            }));

        } catch (error: any) {
            console.error(`Error fetching IT details for conversation ${conversationId}:`, error);
            throw new Error(error.response?.data?.message || `Failed to fetch IT conversation details`);
        }
    }

    /**
     * Updates the status of a single ticket record.
     * @param recordId The ID of the ConversationRecord.
     * @param status The new status to set (e.g., "RESOLVED").
     * @returns A promise that resolves to the updated ConversationDetail object.
     */
    async updateTicketStatus(recordId: string, status: string): Promise<ConversationDetail> {
        try {
            const response = await apiClient.put<any>(
                `${this.baseUrl}/tickets/${recordId}/status`,
                { status } // Request body is: { "status": "..." }
            );
            return this.mapDetailResponse(response.data);
        } catch (error: any) {
            console.error('Error updating ticket status:', error);
            throw new Error(error.response?.data?.message || 'Failed to update status');
        }
    }

    /**
     * Adds an internal note to a single ticket record.
     * @param recordId The ID of the ConversationRecord.
     * @param note The text content of the note to add.
     * @returns A promise that resolves to the updated ConversationDetail object.
     */
    async addInternalNote(recordId: string, note: string): Promise<ConversationDetail> {
        try {
            const response = await apiClient.post<any>(
                `${this.baseUrl}/tickets/${recordId}/notes`,
                { note } // Request body is: { "note": "..." }
            );
            return this.mapDetailResponse(response.data);
        } catch (error: any) {
            console.error('Error adding internal note:', error);
            throw new Error(error.response?.data?.message || 'Failed to add note');
        }
    }

    /**
     * Private helper to map the raw API response to the ConversationDetail interface.
     * The API returns a numeric timestamp (Java Instant as epoch seconds + nanoseconds),
     * so it must be multiplied by 1000 to convert to JavaScript milliseconds.
     * @param data The raw data object from the API response.
     * @returns A ConversationDetail object with a valid Date timestamp.
     */
    private mapDetailResponse(data: any): ConversationDetail {
        return {
            ...data,
            timestamp: new Date(data.timestamp * 1000)
        };
    }
    
}

export const diagnosticsService = new DiagnosticsService();