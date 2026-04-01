import apiClient from '../api/axiosConfig';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * Represents the structure of a Swagger/OpenAPI document stored in MongoDB.
 */
export interface SwaggerDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    originalFileName?: string;
    openApi?: any; // The full OpenAPI specification object
    tags?: string[];
    team: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy: string;
    lastModifiedBy?: string;
    active?: boolean;
    [key: string]: any; // Allows for additional, untyped properties
}

/**
 * A generic wrapper for API responses from the backend.
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errorCode?: string;
}

/**
 * Defines the structure for a request to import a document.
 */
export interface ImportRequest {
    name: string;
    team: string;
    createdBy: string;
    description?: string;
}

// ================================================================================================
// API SERVICE CLASS
// ================================================================================================

/**
 * Service class for interacting with the Swagger/OpenAPI document API endpoints.
 *
 * This class handles all HTTP communication with the backend for Swagger-related
 * operations. It uses the centralized `apiClient` to ensure all requests are
 * authenticated and consistently handled.
 */
class SwaggerApiService {
    private baseUrl = '/api/swagger';

    /**
     * Retrieves all Swagger documents from the backend as an NDJSON stream.
     * @returns A promise that resolves to an array of SwaggerDocument objects.
     */
    async getAllSwaggerDocuments(): Promise<SwaggerDocument[]> {
        const response = await apiClient.get<string>(this.baseUrl, {
            headers: { 'Accept': 'application/x-ndjson' },
            responseType: 'text' // Important: handle the response as raw text first
        });

        const text = response.data;
        if (!text || !text.trim()) return [];

        // Parse the NDJSON text response into an array of documents
        return text.trim().split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
    }

    /**
     * Retrieves a single Swagger document by its unique identifier.
     * @param id The unique ID of the Swagger document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getSwaggerDocumentById(id: string): Promise<SwaggerDocument | null> {
        try {
            const response = await apiClient.get<SwaggerDocument>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Retrieves a single Swagger document by its name.
     * @param name The name of the Swagger document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getSwaggerDocumentByName(name: string): Promise<SwaggerDocument | null> {
        try {
            const response = await apiClient.get<SwaggerDocument>(`${this.baseUrl}/by-name`, {
                params: { name } // Axios handles URL encoding for query parameters
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Creates or updates a Swagger document by sending the full object.
     * @param document The SwaggerDocument object to save.
     * @returns A promise that resolves to the saved document.
     */
    async saveSwaggerDocument(document: SwaggerDocument): Promise<SwaggerDocument> {
        const response = await apiClient.post<SwaggerDocument>(this.baseUrl, document);
        return response.data;
    }

    /**
     * Deletes a Swagger document by its unique identifier.
     * @param id The ID of the document to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deleteSwaggerDocument(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Imports a Swagger document by uploading a file.
     * @param file The file object (from an input element).
     * @param importData Metadata for the import (name, team, etc.).
     * @returns A promise that resolves to the newly created SwaggerDocument.
     */
    async importFromFile(file: File, importData: ImportRequest): Promise<SwaggerDocument> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', importData.name);
        formData.append('team', importData.team);
        formData.append('createdBy', importData.createdBy);
        if (importData.description) {
            formData.append('description', importData.description);
        }

        const response = await apiClient.post<SwaggerDocument>(`${this.baseUrl}/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    /**
     * Imports a Swagger document from raw JSON/YAML string content.
     * @param content The raw string content (JSON or YAML).
     * @param importData Metadata including the content type ('json' or 'yaml').
     * @returns A promise that resolves to the newly created SwaggerDocument.
     */
    async importFromContent(content: string, importData: ImportRequest & { contentType: string }): Promise<SwaggerDocument> {
        const response = await apiClient.post<SwaggerDocument>(`${this.baseUrl}/import-json`, content, {
            params: {
                name: importData.name,
                team: importData.team,
                createdBy: importData.createdBy,
                contentType: importData.contentType,
                description: importData.description,
            },
            headers: {
                'Content-Type': importData.contentType === 'yaml' ? 'text/plain' : 'application/json'
            },
        });
        return response.data;
    }

    /**
     * Performs a health check on the Swagger service endpoint.
     * @returns A promise that resolves to the API's health status response.
     */
    async healthCheck(): Promise<ApiResponse<string>> {
        const response = await apiClient.get<ApiResponse<string>>(`${this.baseUrl}/health`);
        return response.data;
    }

    /**
     * Retrieves calculated statistics about all Swagger documents.
     * NOTE: This logic performs a fetch and then client-side calculations. For performance,
     * consider creating a dedicated backend endpoint (e.g., /api/swagger/stats) in the future.
     * @returns A promise that resolves to an object with calculated stats.
     */
    async getSwaggerStats(): Promise<any> { // Define a proper type for the stats object
        const documents = await this.getAllSwaggerDocuments();
        const stats = {
            totalDocuments: documents.length,
            activeDocuments: documents.filter(doc => doc.active !== false).length,
            totalEndpoints: documents.reduce((total, doc) => {
                const endpoints = SwaggerUtils.getEndpoints(doc);
                return total + endpoints.length;
            }, 0),
            teams: [...new Set(documents.map(doc => doc.team).filter(Boolean))],
            lastUpdated: documents.reduce((latest, doc) => {
                const updated = doc.updatedAt || doc.createdAt;
                if (!updated) return latest;
                if (!latest) return updated;
                return new Date(updated) > new Date(latest) ? updated : latest;
            }, null as string | null) || undefined
        };
        return stats;
    }
}

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * A collection of pure utility functions for processing SwaggerDocument objects.
 * These helpers are static-like and do not depend on the API service state.
 * Grouping them here makes them reusable, testable, and separates business
 * logic from data fetching.
 */
export const SwaggerUtils = {

    /**
     * Extracts a simplified, display-friendly info object from a full document.
     * @param document The full SwaggerDocument object.
     * @returns A flattened object with key information for UI display.
     */
    extractBasicInfo(document: SwaggerDocument) {
        return {
            id: document._id || document.id,
            name: document.name || 'Unnamed Document',
            description: document.description,
            team: document.team,
            originalFileName: document.originalFileName,
            version: document.openApi?.info?.version,
            title: document.openApi?.info?.title,
            apiDescription: document.openApi?.info?.description,
            endpointCount: document.openApi?.paths ? Object.keys(document.openApi.paths).length : 0,
            serverCount: document.openApi?.servers?.length || 0,
            tags: document.tags || [],
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            createdBy: document.createdBy,
            lastModifiedBy: document.lastModifiedBy,
            active: document.active !== false // Default to true if not specified
        };
    },

    /**
     * Formats an ISO date string into a more readable local format (e.g., "Sep 12, 2025, 12:05 PM").
     * @param dateString The ISO date string to format.
     * @returns A formatted string, or 'N/A' if the date is not provided.
     */
    formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString; // Return original string if formatting fails
        }
    },

    /**
     * Determines a status color based on the document's state.
     * @param document The SwaggerDocument to evaluate.
     * @returns A color string ('green', 'red', or 'yellow') representing the status.
     */
    getStatusColor(document: SwaggerDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.openApi?.paths || Object.keys(document.openApi.paths).length === 0) return 'yellow';
        return 'green';
    },

    /**
     * Extracts all server URLs from the OpenAPI specification's 'servers' array.
     * @param document The SwaggerDocument.
     * @returns An array of server URL strings.
     */
    getServerUrls(document: SwaggerDocument): string[] {
        if (!document.openApi?.servers || !Array.isArray(document.openApi.servers)) {
            return [];
        }
        return document.openApi.servers
            .map((server: any) => server.url || '')
            .filter(Boolean); // Filter out any empty or null URLs
    },

    /**
     * Extracts and flattens all endpoints (path + method) from the OpenAPI specification.
     * @param document The SwaggerDocument.
     * @returns An array of objects, each representing a specific endpoint.
     */
    getEndpoints(document: SwaggerDocument): Array<{
        path: string;
        method: string;
        summary?: string;
        operationId?: string;
    }> {
        if (!document.openApi?.paths) return [];

        const endpoints: Array<{
            path: string;
            method: string;
            summary?: string;
            operationId?: string;
        }> = [];

        const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
        
        Object.entries(document.openApi.paths).forEach(([path, pathItem]: [string, any]) => {
            validMethods.forEach(method => {
                if (pathItem[method]) {
                    endpoints.push({
                        path,
                        method: method.toUpperCase(),
                        summary: pathItem[method].summary,
                        operationId: pathItem[method].operationId
                    });
                }
            });
        });

        return endpoints;
    },

    /**
     * Validates if a string content is valid JSON or YAML.
     * Note: YAML validation is basic. For strict validation, a dedicated library is recommended.
     * @param content The string content to validate.
     * @param contentType The format to validate against ('json' or 'yaml').
     * @returns True if the content is valid, otherwise false.
     */
    validateContent(content: string, contentType: 'json' | 'yaml'): boolean {
        try {
            if (contentType === 'json') {
                JSON.parse(content);
                return true;
            } else if (contentType === 'yaml') {
                // Basic check: not empty and doesn't look like JSON.
                // For robust validation, a library like 'js-yaml' would be needed.
                return content.trim().length > 0 && !content.trim().startsWith('{');
            }
            return false;
        } catch {
            return false;
        }
    }
};

/**
 * Singleton instance of the SwaggerApiService.
 * This ensures that the same instance is used throughout the application.
 */
export const swaggerService = new SwaggerApiService();