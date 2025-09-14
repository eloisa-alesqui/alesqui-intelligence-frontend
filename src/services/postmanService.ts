import apiClient from '../api/axiosConfig';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * Represents the structure of a Postman Collection document stored in MongoDB.
 */
export interface PostmanDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    originalFileName?: string;
    collection?: PostmanCollection; // The full Postman Collection object
    tags?: string[];
    team: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy: string;
    lastModifiedBy?: string;
    active?: boolean;
    [key: string]: any;
}

/**
 * A simplified interface for a Postman Collection structure.
 */
export interface PostmanCollection {
    info: {
        _postman_id?: string;
        name: string;
        description?: string;
        schema: string;
    };
    item?: PostmanItem[];
    variable?: PostmanVariable[];
    auth?: any;
}

/**
 * Represents an item within a Postman Collection, which can be a request or a folder.
 */
export interface PostmanItem {
    name: string;
    description?: string;
    item?: PostmanItem[]; // For nested folders
    request?: any; // Simplified for this example
}

/**
 * Represents a variable within a Postman Collection.
 */
export interface PostmanVariable {
    key: string;
    value: string;
    type?: string;
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
 * Service class for interacting with the Postman Collection API endpoints.
 * This class handles all HTTP communication with the backend for Postman-related
 * operations. It uses the centralized `apiClient` for authenticated and consistent requests.
 */
class PostmanApiService {
    private baseUrl = '/api/postman';

    /**
     * Retrieves all Postman documents from the backend as an NDJSON stream.
     * @returns A promise that resolves to an array of PostmanDocument objects.
     */
    async getAllPostmanDocuments(): Promise<PostmanDocument[]> {
        const response = await apiClient.get<string>(this.baseUrl, {
            headers: { 'Accept': 'application/x-ndjson' },
            responseType: 'text',
        });

        const text = response.data;
        if (!text || !text.trim()) return [];

        return text.trim().split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
    }

    /**
     * Retrieves a single Postman document by its unique identifier.
     * @param id The unique ID of the Postman document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getPostmanDocumentById(id: string): Promise<PostmanDocument | null> {
        try {
            const response = await apiClient.get<PostmanDocument>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Retrieves a single Postman document by its name.
     * @param name The name of the Postman document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getPostmanDocumentByName(name: string): Promise<PostmanDocument | null> {
        try {
            const response = await apiClient.get<PostmanDocument>(`${this.baseUrl}/by-name`, {
                params: { name },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Creates or updates a Postman document.
     * @param document The PostmanDocument object to save.
     * @returns A promise that resolves to the saved PostmanCollection.
     */
    async savePostmanDocument(document: PostmanDocument): Promise<PostmanCollection> {
        const response = await apiClient.post<PostmanCollection>(this.baseUrl, document);
        return response.data;
    }

    /**
     * Deletes a Postman document by its unique identifier.
     * @param id The ID of the document to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    async deletePostmanDocument(id: string): Promise<void> {
        await apiClient.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * Imports a Postman collection by uploading a file.
     * @param file The file object (from an input element).
     * @param importData Metadata for the import (name, team, etc.).
     * @returns A promise that resolves to the newly created PostmanCollection.
     */
    async importFromFile(file: File, importData: ImportRequest): Promise<PostmanCollection> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', importData.name);
        formData.append('team', importData.team);
        formData.append('createdBy', importData.createdBy);
        if (importData.description) {
            formData.append('description', importData.description);
        }

        const response = await apiClient.post<PostmanCollection>(`${this.baseUrl}/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    /**
     * Imports a Postman collection from raw JSON string content.
     * @param content The raw JSON string of the collection.
     * @param importData Metadata for the import.
     * @returns A promise that resolves to the newly created PostmanDocument.
     */
    async importFromContent(content: string, importData: ImportRequest): Promise<PostmanDocument> {
        const response = await apiClient.post<PostmanDocument>(`${this.baseUrl}/import-content`, content, {
            params: { ...importData },
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    }
}

/**
 * Singleton instance of the PostmanApiService.
 */
export const postmanService = new PostmanApiService();

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * A collection of pure utility functions for processing PostmanDocument objects.
 */
export const PostmanUtils = {
    /**
     * Helper method to recursively count requests in a collection's items array.
     * @param items An array of Postman items.
     * @returns The total number of requests.
     */
    countRequests(items?: PostmanItem[]): number {
        if (!items) return 0;
        let count = 0;
        items.forEach(item => {
            if (item.request) {
                count++;
            } else if (item.item) {
                count += this.countRequests(item.item); // Recurse into sub-folders
            }
        });
        return count;
    },

    /**
     * Helper method to recursively count folders in a collection's items array.
     * @param items An array of Postman items.
     * @returns The total number of folders.
     */
    countFolders(items?: PostmanItem[]): number {
        if (!items) return 0;
        let count = 0;
        items.forEach(item => {
            if (item.item && !item.request) { // It's a folder if it has items but no request
                count++;
                count += this.countFolders(item.item); // Recurse into sub-folders
            }
        });
        return count;
    },
    
    /**
     * Extracts a simplified, display-friendly info object from a full document.
     * @param document The full PostmanDocument object.
     * @returns A flattened object with key information.
     */
    extractBasicInfo(document: PostmanDocument) {
        return {
            id: document._id || document.id,
            name: document.name || 'Unnamed Document',
            description: document.description,
            team: document.team,
            originalFileName: document.originalFileName,
            collectionName: document.collection?.info?.name,
            collectionDescription: document.collection?.info?.description,
            requestCount: this.countRequests(document.collection?.item),
            folderCount: this.countFolders(document.collection?.item),
            variableCount: document.collection?.variable?.length || 0,
            tags: document.tags || [],
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            createdBy: document.createdBy,
            lastModifiedBy: document.lastModifiedBy,
            active: document.active !== false,
        };
    },

    /**
     * Formats an ISO date string into a more readable local format.
     * @param dateString The ISO date string to format.
     * @returns A formatted string, or 'N/A' if the date is not provided.
     */
    formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    },

    /**
     * Determines a status color based on the document's state.
     * @param document The PostmanDocument to evaluate.
     * @returns A color string ('green', 'red', or 'yellow').
     */
    getStatusColor(document: PostmanDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.collection?.item || document.collection.item.length === 0) return 'yellow';
        return 'green';
    },

    /**
     * Helper to get all requests from a collection
     */
    getAllRequests(document: PostmanDocument): Array<{
        name: string;
        method?: string;
        url?: string;
        description?: string;
        folder?: string;
    }> {
        if (!document.collection?.item) return [];
  
        const requests: Array<{
            name: string;
            method?: string;
            url?: string;
            description?: string;
            folder?: string;
        }> = [];
  
        const extractRequests = (items: PostmanItem[], folderPath: string = '') => {
            items.forEach(item => {
                if (item.request) {
                    const url = typeof item.request.url === 'string' 
                        ? item.request.url 
                        : item.request.url?.raw || '';
  
                    requests.push({
                        name: item.name,
                        method: item.request.method,
                        url: url,
                        description: item.description || item.request.description,
                        folder: folderPath
                    });
                } else if (item.item) {
                    const newFolderPath = folderPath 
                        ? `${folderPath}/${item.name}` 
                        : item.name;
                    extractRequests(item.item, newFolderPath);
                }
            });
        };
  
        extractRequests(document.collection.item);
        return requests;
    },
  
    /**
     * Helper to get all variables from a collection
     */
    getAllVariables(document: PostmanDocument): PostmanVariable[] {
        if (!document.collection?.variable) return [];
        return document.collection.variable;
    },
  
    /**
     * Helper to validate if content is valid Postman collection JSON
     */
    validatePostmanCollection(content: string): boolean {
        try {
            const parsed = JSON.parse(content);
            
            // Basic validation for Postman collection structure
            return (
                parsed &&
                typeof parsed === 'object' &&
                parsed.info &&
                typeof parsed.info === 'object' &&
                parsed.info.name &&
                parsed.info.schema &&
                typeof parsed.info.schema === 'string' &&
                parsed.info.schema.includes('postman')
            );
        } catch {
            return false;
        }
    },
  
    /**
     * Helper to get collection version from schema
     */
    getCollectionVersion(document: PostmanDocument): string {
        if (!document.collection?.info?.schema) return 'Unknown';
        
        const schema = document.collection.info.schema;
        const versionMatch = schema.match(/v(\d+\.\d+\.\d+)/);
        return versionMatch ? versionMatch[1] : 'Unknown';
    },
  
    /**
     * Helper to check if collection has authentication
     */
    hasAuthentication(document: PostmanDocument): boolean {
        return !!(document.collection?.auth || 
                 document.collection?.item?.some(item => 
                     this.itemHasAuth(item)));
    },
  
    /**
     * Helper to check if an item or its children have authentication
     */
    itemHasAuth(item: PostmanItem): boolean {
        if (item.request?.auth) return true;
        if (item.item) {
            return item.item.some(subItem => this.itemHasAuth(subItem));
        }
        return false;
    },
  
    /**
     * Helper to get unique HTTP methods used in the collection
     */
    getUsedHttpMethods(document: PostmanDocument): string[] {
        if (!document.collection?.item) return [];
  
        const methods = new Set<string>();
        
        const extractMethods = (items: PostmanItem[]) => {
            items.forEach(item => {
                if (item.request?.method) {
                    methods.add(item.request.method.toUpperCase());
                } else if (item.item) {
                    extractMethods(item.item);
                }
            });
        };
  
        extractMethods(document.collection.item);
        return Array.from(methods).sort();
    }
};