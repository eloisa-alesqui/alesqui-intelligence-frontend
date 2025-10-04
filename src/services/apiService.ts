import apiClient from '../api/axiosConfig';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * A generic interface for a document representing a unified API.
 * It's recommended to use the more specific 'UnifiedApiDocument' where possible.
 */
export interface ApiDocument {
    _id?: string;
    id?: string;
    name?: string;
    description?: string;
    version?: string;
    team?: string;
    baseUrl?: string;
    endpoints?: any[];
    servers?: any[];
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
    [key: string]: any; // Allows for any additional properties
}

/**
 * Defines the structure for a paginated list response from the API.
 */
export interface ApiListResponse {
    content: ApiDocument[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number; // The current page number
}

// ================================================================================================
// API SERVICE CLASS
// ================================================================================================

/**
 * A generic service for fetching and managing unified API documents.
 * This class handles all HTTP communication for listing, searching, and retrieving
 * individual API documents.
 */
class ApiService {
    private baseUrl = '/api/unification';

    /**
     * Retrieves a paginated list of all unified APIs.
     * @param page The page number to retrieve (0-indexed).
     * @param size The number of items per page.
     * @returns A promise that resolves to a paginated list of API documents.
     */
    async getAllApis(page = 0, size = 20): Promise<ApiListResponse> {
        const response = await apiClient.get<ApiListResponse | ApiDocument[]>(this.baseUrl, {
            params: { page, size }
        });

        const data = response.data;

        // Handle cases where the backend might return a simple array instead of a paginated object
        if (Array.isArray(data)) {
            return {
                content: data,
                totalElements: data.length,
                totalPages: 1,
                size: data.length,
                number: 0
            };
        }
        
        return data as ApiListResponse;
    }

    /**
     * Retrieves all APIs as a simple, non-paginated list.
     * Note: This fetches a large number of items and should be used cautiously.
     * @returns A promise that resolves to an array of all API documents.
     */
    async getAllApisSimple(): Promise<ApiDocument[]> {
        // Fetch a large page to simulate getting all documents.
        // A dedicated backend endpoint would be more efficient.
        const response = await this.getAllApis(0, 1000);
        return response.content;
    }

    /**
     * Retrieves a single API document by its unique identifier.
     * @param id The unique ID of the document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getApiById(id: string): Promise<ApiDocument | null> {
        try {
            const response = await apiClient.get<ApiDocument>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Retrieves a single API document by its name.
     * @param name The name of the document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getApiByName(name: string): Promise<ApiDocument | null> {
        try {
            const response = await apiClient.get<ApiDocument>(`${this.baseUrl}/by-name`, {
                params: { name }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Searches for APIs based on a search term, with pagination.
     * @param searchTerm The term to search for in the API documents.
     * @param page The page number to retrieve (0-indexed).
     * @param size The number of items per page.
     * @returns A promise that resolves to a paginated list of matching API documents.
     */
    async searchApis(searchTerm: string, page = 0, size = 20): Promise<ApiListResponse> {
        const response = await apiClient.get<ApiListResponse>(`${this.baseUrl}/search`, {
            params: { search: searchTerm, page, size }
        });
        return response.data;
    }

    /**
     * Deletes a single API document by its unique identifier.
     * This will also trigger the deletion of related Swagger and Postman documents on the backend.
     * @param id The unique ID of the document to delete.
     * @returns A promise that resolves when the deletion is successful.
     */
    async deleteApi(id: string): Promise<void> {
        try {
            await apiClient.delete(`${this.baseUrl}/${id}`);
        } catch (error: any) {
            // Log the error and re-throw it to be handled by the calling component
            console.error(`Failed to delete API with id ${id}:`, error);
            throw error;
        }
    }
}

/**
 * Singleton instance of the ApiService.
 */
export const apiService = new ApiService();

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * A collection of pure utility functions for processing generic ApiDocument objects.
 */
export const ApiUtils = {
    /**
     * Calculates and returns a set of statistics from an array of API documents.
     * @param apis An array of ApiDocument objects.
     * @returns An object containing calculated statistics.
     */
    getApiStats(apis: ApiDocument[]): {
        totalApis: number;
        totalEndpoints: number;
        teams: string[];
        lastUpdated?: string;
    } {
        const stats = {
            totalApis: apis.length,
            totalEndpoints: apis.reduce((total, api) => total + (api.endpoints?.length || 0), 0),
            teams: [...new Set(apis.map(api => api.team).filter((team): team is string => !!team))],
            lastUpdated: apis.reduce((latest, api) => {
                const updated = api.updatedAt || api.createdAt;
                if (!updated) return latest;
                if (!latest) return updated;
                return new Date(updated) > new Date(latest) ? updated : latest;
            }, null as string | null) || undefined
        };
        return stats;
    },
    
    /**
     * Extracts a simplified, display-friendly info object from a full API document.
     * @param api The full ApiDocument object.
     * @returns A flattened object with key information.
     */
    extractBasicInfo(api: ApiDocument) {
        return {
            id: api._id || api.id,
            name: api.name || 'Unnamed API',
            description: api.description,
            version: api.version,
            team: api.team,
            baseUrl: api.baseUrl,
            endpointCount: api.endpoints?.length || 0,
            serverCount: api.servers?.length || 0,
            createdAt: api.createdAt,
            updatedAt: api.updatedAt,
            active: api.active !== false
        };
    },

    /**
     * Formats a Unix timestamp or ISO date string into a readable local format.
     * @param timestamp The timestamp (number in seconds) or ISO string.
     * @returns A formatted string (e.g., "12/09/2025, 15:45:30"), or 'N/A'.
     */
    formatDate(timestamp?: string | number): string {
        if (!timestamp) return 'N/A';
        try {
            // Handle both Unix timestamps (numbers) and ISO strings
            const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
            return date.toLocaleString('en-US', { 
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch {
            return String(timestamp);
        }
    },

    /**
     * Determines a status color based on the document's state.
     * @param api The ApiDocument to evaluate.
     * @returns A color string ('green', 'red', or 'yellow').
     */
    getStatusColor(api: ApiDocument): 'green' | 'red' | 'yellow' {
        if (api.active === false) return 'red';
        if (!api.endpoints || api.endpoints.length === 0) return 'yellow';
        return 'green';
    },

    /**
     * Extracts all server URLs from an API document.
     * @param api The ApiDocument.
     * @returns An array of server URL strings.
     */
    getServerUrls(api: ApiDocument): string[] {
        if (!api.servers || !Array.isArray(api.servers)) {
            return api.baseUrl ? [api.baseUrl] : [];
        }
        return api.servers
            .map((server: any) => server.url || server.baseUrl || '')
            .filter(Boolean);
    }
};