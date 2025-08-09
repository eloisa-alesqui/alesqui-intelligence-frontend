// Generic type for MongoDB document
export interface SwaggerDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    originalFileName?: string;
    openApi?: any; // OpenAPI specification object
    tags?: string[];
    team: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy: string;
    lastModifiedBy?: string;
    active?: boolean;
    [key: string]: any; // Allows any additional property
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errorCode?: string;
}

// List response for paginated results
export interface SwaggerListResponse {
    content: SwaggerDocument[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// Import request interface
export interface ImportRequest {
    name: string;
    team: string;
    createdBy: string;
    description?: string;
    contentType?: string;
}

class SwaggerService {
    private baseUrl = '/api/swagger';

    /**
     * Retrieves all Swagger documents
     */
    async getAllSwaggerDocuments(): Promise<SwaggerDocument[]> {
        try {
            const response = await fetch(this.baseUrl, {
                headers: {
                    'Accept': 'application/x-ndjson'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle NDJSON response
            const text = await response.text();
            const documents: SwaggerDocument[] = [];
            
            if (text.trim()) {
                const lines = text.trim().split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        documents.push(JSON.parse(line));
                    }
                }
            }

            return documents;
        } catch (error) {
            console.error('Error fetching Swagger documents:', error);
            throw error;
        }
    }

    /**
     * Retrieves a Swagger document by its ID
     */
    async getSwaggerDocumentById(id: string): Promise<SwaggerDocument | null> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching Swagger document by ID:', error);
            throw error;
        }
    }

    /**
     * Retrieves a Swagger document by its name
     */
    async getSwaggerDocumentByName(name: string): Promise<SwaggerDocument | null> {
        try {
            const response = await fetch(`${this.baseUrl}/by-name?name=${encodeURIComponent(name)}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching Swagger document by name:', error);
            throw error;
        }
    }

    /**
     * Creates or updates a Swagger document
     */
    async saveSwaggerDocument(document: SwaggerDocument): Promise<SwaggerDocument> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(document)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving Swagger document:', error);
            throw error;
        }
    }

    /**
     * Deletes a Swagger document by its ID
     */
    async deleteSwaggerDocument(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting Swagger document:', error);
            throw error;
        }
    }

    /**
     * Imports a Swagger document from a file
     */
    async importFromFile(
        file: File, 
        importData: ImportRequest
    ): Promise<SwaggerDocument> {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', importData.name);
            formData.append('team', importData.team);
            formData.append('createdBy', importData.createdBy);
            
            if (importData.description) {
                formData.append('description', importData.description);
            }

            const response = await fetch(`${this.baseUrl}/import`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error importing Swagger document from file:', error);
            throw error;
        }
    }

    /**
     * Imports a Swagger document from JSON/YAML content
     */
    async importFromContent(
        content: string,
        importData: ImportRequest & { contentType: string }
    ): Promise<SwaggerDocument> {
        try {
            const params = new URLSearchParams({
                name: importData.name,
                team: importData.team,
                createdBy: importData.createdBy,
                contentType: importData.contentType
            });

            if (importData.description) {
                params.append('description', importData.description);
            }

            const response = await fetch(`${this.baseUrl}/import-json?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': importData.contentType === 'yaml' ? 'text/plain' : 'application/json'
                },
                body: content
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error importing Swagger document from content:', error);
            throw error;
        }
    }

    /**
     * Performs a health check on the Swagger service
     */
    async healthCheck(): Promise<ApiResponse<string>> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error performing health check:', error);
            throw error;
        }
    }

    /**
     * Gets statistics about Swagger documents
     */
    async getSwaggerStats(): Promise<{
        totalDocuments: number;
        totalEndpoints: number;
        teams: string[];
        activeDocuments: number;
        lastUpdated?: string;
    }> {
        try {
            const documents = await this.getAllSwaggerDocuments();

            const stats = {
                totalDocuments: documents.length,
                activeDocuments: documents.filter(doc => doc.active !== false).length,
                totalEndpoints: documents.reduce((total, doc) => {
                    // Extract endpoint count from OpenAPI specification
                    if (doc.openApi?.paths) {
                        const paths = Object.keys(doc.openApi.paths);
                        const endpointCount = paths.reduce((count, path) => {
                            const pathItem = doc.openApi.paths[path];
                            const methods = Object.keys(pathItem).filter(key => 
                                ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(key)
                            );
                            return count + methods.length;
                        }, 0);
                        return total + endpointCount;
                    }
                    return total;
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
        } catch (error) {
            console.error('Error getting Swagger stats:', error);
            throw error;
        }
    }

    /**
     * Helper to extract basic information from a Swagger document
     */
    static extractBasicInfo(document: SwaggerDocument) {
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
    }

    /**
     * Helper to format dates
     */
    static formatDate(dateString?: string): string {
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
            return dateString;
        }
    }

    /**
     * Helper to get status color based on document state
     */
    static getStatusColor(document: SwaggerDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.openApi?.paths || Object.keys(document.openApi.paths).length === 0) return 'yellow';
        return 'green';
    }

    /**
     * Helper to get server URLs from OpenAPI specification
     */
    static getServerUrls(document: SwaggerDocument): string[] {
        if (!document.openApi?.servers || !Array.isArray(document.openApi.servers)) {
            return [];
        }

        return document.openApi.servers.map((server: any) => {
            return server.url || '';
        }).filter(Boolean);
    }

    /**
     * Helper to get all HTTP methods and paths from OpenAPI specification
     */
    static getEndpoints(document: SwaggerDocument): Array<{
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

        Object.entries(document.openApi.paths).forEach(([path, pathItem]: [string, any]) => {
            const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
            
            methods.forEach(method => {
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
    }

    /**
     * Helper to validate if content is valid JSON or YAML
     */
    static validateContent(content: string, contentType: 'json' | 'yaml'): boolean {
        try {
            if (contentType === 'json') {
                JSON.parse(content);
                return true;
            } else if (contentType === 'yaml') {
                // Basic YAML validation - you might want to use a proper YAML parser
                return content.trim().length > 0 && !content.startsWith('{');
            }
            return false;
        } catch {
            return false;
        }
    }
}

export const swaggerService = new SwaggerService();
export default swaggerService;