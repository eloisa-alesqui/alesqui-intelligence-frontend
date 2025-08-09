// Generic type for MongoDB document
export interface PostmanDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    originalFileName?: string;
    collection?: any; // Postman Collection object
    tags?: string[];
    team: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy: string;
    lastModifiedBy?: string;
    active?: boolean;
    [key: string]: any; // Allows any additional property
  }
  
  // Postman Collection interface (simplified)
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
    event?: any[];
  }
  
  // Postman Item (request or folder)
  export interface PostmanItem {
    name: string;
    description?: string;
    item?: PostmanItem[]; // For folders
    request?: PostmanRequest;
    response?: any[];
    event?: any[];
  }
  
  // Postman Request
  export interface PostmanRequest {
    method: string;
    header?: any[];
    body?: any;
    url: string | PostmanUrl;
    auth?: any;
    description?: string;
  }
  
  // Postman URL object
  export interface PostmanUrl {
    raw: string;
    protocol?: string;
    host?: string[];
    port?: string;
    path?: string[];
    query?: any[];
    variable?: PostmanVariable[];
  }
  
  // Postman Variable
  export interface PostmanVariable {
    key: string;
    value: string;
    type?: string;
    description?: string;
  }
  
  // API Response wrapper
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errorCode?: string;
  }
  
  // Import request interface
  export interface ImportRequest {
    name: string;
    team: string;
    createdBy: string;
    description?: string;
  }
  
  class PostmanService {
    private baseUrl = '/api/postman';
  
    /**
     * Retrieves all Postman documents
     */
    async getAllPostmanDocuments(): Promise<PostmanDocument[]> {
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
            const documents: PostmanDocument[] = [];
            
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
            console.error('Error fetching Postman documents:', error);
            throw error;
        }
    }
  
    /**
     * Retrieves a Postman document by its ID
     */
    async getPostmanDocumentById(id: string): Promise<PostmanDocument | null> {
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
            console.error('Error fetching Postman document by ID:', error);
            throw error;
        }
    }
  
    /**
     * Retrieves a Postman document by its name
     */
    async getPostmanDocumentByName(name: string): Promise<PostmanDocument | null> {
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
            console.error('Error fetching Postman document by name:', error);
            throw error;
        }
    }
  
    /**
     * Creates or updates a Postman document
     */
    async savePostmanDocument(document: PostmanDocument): Promise<PostmanCollection> {
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
            console.error('Error saving Postman document:', error);
            throw error;
        }
    }
  
    /**
     * Deletes a Postman document by its ID
     */
    async deletePostmanDocument(id: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });
  
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting Postman document:', error);
            throw error;
        }
    }
  
    /**
     * Imports a Postman collection from a file
     */
    async importFromFile(
        file: File, 
        importData: ImportRequest
    ): Promise<PostmanCollection> {
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
            console.error('Error importing Postman collection from file:', error);
            throw error;
        }
    }
  
    /**
     * Imports a Postman collection from JSON content
     */
    async importFromContent(
        content: string,
        importData: ImportRequest
    ): Promise<PostmanDocument> {
        try {
            const params = new URLSearchParams({
                name: importData.name,
                team: importData.team,
                createdBy: importData.createdBy
            });
  
            if (importData.description) {
                params.append('description', importData.description);
            }
  
            const response = await fetch(`${this.baseUrl}/import-content?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: content
            });
  
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
  
            return await response.json();
        } catch (error) {
            console.error('Error importing Postman collection from content:', error);
            throw error;
        }
    }
  
    /**
     * Gets statistics about Postman collections
     */
    async getPostmanStats(): Promise<{
        totalDocuments: number;
        totalRequests: number;
        totalFolders: number;
        teams: string[];
        activeDocuments: number;
        lastUpdated?: string;
    }> {
        try {
            const documents = await this.getAllPostmanDocuments();
  
            const stats = {
                totalDocuments: documents.length,
                activeDocuments: documents.filter(doc => doc.active !== false).length,
                totalRequests: documents.reduce((total, doc) => {
                    return total + this.countRequests(doc.collection);
                }, 0),
                totalFolders: documents.reduce((total, doc) => {
                    return total + this.countFolders(doc.collection);
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
            console.error('Error getting Postman stats:', error);
            throw error;
        }
    }
  
    /**
     * Helper method to count requests in a collection
     */
    private countRequests(collection?: PostmanCollection): number {
        if (!collection?.item) return 0;
  
        let count = 0;
        const countInItems = (items: PostmanItem[]) => {
            items.forEach(item => {
                if (item.request) {
                    count++;
                } else if (item.item) {
                    countInItems(item.item);
                }
            });
        };
  
        countInItems(collection.item);
        return count;
    }
  
    /**
     * Helper method to count folders in a collection
     */
    private countFolders(collection?: PostmanCollection): number {
        if (!collection?.item) return 0;
  
        let count = 0;
        const countInItems = (items: PostmanItem[]) => {
            items.forEach(item => {
                if (item.item && !item.request) {
                    count++;
                    countInItems(item.item);
                }
            });
        };
  
        countInItems(collection.item);
        return count;
    }
  
    /**
     * Helper to extract basic information from a Postman document
     */
    static extractBasicInfo(document: PostmanDocument) {
        return {
            id: document._id || document.id,
            name: document.name || 'Unnamed Document',
            description: document.description,
            team: document.team,
            originalFileName: document.originalFileName,
            collectionName: document.collection?.info?.name,
            collectionDescription: document.collection?.info?.description,
            requestCount: this.countRequestsStatic(document.collection),
            folderCount: this.countFoldersStatic(document.collection),
            variableCount: document.collection?.variable?.length || 0,
            tags: document.tags || [],
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            createdBy: document.createdBy,
            lastModifiedBy: document.lastModifiedBy,
            active: document.active !== false // Default to true if not specified
        };
    }
  
    /**
     * Static helper method to count requests
     */
    private static countRequestsStatic(collection?: PostmanCollection): number {
        if (!collection?.item) return 0;
  
        let count = 0;
        const countInItems = (items: PostmanItem[]) => {
            items.forEach(item => {
                if (item.request) {
                    count++;
                } else if (item.item) {
                    countInItems(item.item);
                }
            });
        };
  
        countInItems(collection.item);
        return count;
    }
  
    /**
     * Static helper method to count folders
     */
    private static countFoldersStatic(collection?: PostmanCollection): number {
        if (!collection?.item) return 0;
  
        let count = 0;
        const countInItems = (items: PostmanItem[]) => {
            items.forEach(item => {
                if (item.item && !item.request) {
                    count++;
                    countInItems(item.item);
                }
            });
        };
  
        countInItems(collection.item);
        return count;
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
    static getStatusColor(document: PostmanDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.collection?.item || document.collection.item.length === 0) return 'yellow';
        return 'green';
    }
  
    /**
     * Helper to get all requests from a collection
     */
    static getAllRequests(document: PostmanDocument): Array<{
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
    }
  
    /**
     * Helper to get all variables from a collection
     */
    static getAllVariables(document: PostmanDocument): PostmanVariable[] {
        if (!document.collection?.variable) return [];
        return document.collection.variable;
    }
  
    /**
     * Helper to validate if content is valid Postman collection JSON
     */
    static validatePostmanCollection(content: string): boolean {
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
    }
  
    /**
     * Helper to get collection version from schema
     */
    static getCollectionVersion(document: PostmanDocument): string {
        if (!document.collection?.info?.schema) return 'Unknown';
        
        const schema = document.collection.info.schema;
        const versionMatch = schema.match(/v(\d+\.\d+\.\d+)/);
        return versionMatch ? versionMatch[1] : 'Unknown';
    }
  
    /**
     * Helper to check if collection has authentication
     */
    static hasAuthentication(document: PostmanDocument): boolean {
        return !!(document.collection?.auth || 
                 document.collection?.item?.some(item => 
                     this.itemHasAuth(item)));
    }
  
    /**
     * Helper to check if an item or its children have authentication
     */
    private static itemHasAuth(item: PostmanItem): boolean {
        if (item.request?.auth) return true;
        if (item.item) {
            return item.item.some(subItem => this.itemHasAuth(subItem));
        }
        return false;
    }
  
    /**
     * Helper to get unique HTTP methods used in the collection
     */
    static getUsedHttpMethods(document: PostmanDocument): string[] {
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
  }
  
  export const postmanService = new PostmanService();
  export default postmanService;