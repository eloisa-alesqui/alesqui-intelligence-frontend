// Unified API Document interface
export interface UnifiedApiDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    version?: string;
    baseUrl?: string;
    servers?: ApiServer[];
    endpoints?: UnifiedEndpoint[];
    schemas?: Record<string, UnifiedSchema>;
    authentication?: UnifiedAuthentication;
    globalHeaders?: Record<string, string>;
    globalVariables?: Record<string, any>;
    tags?: string[];
    team?: string;
    sourcePostmanId?: string;
    sourceSwaggerId?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    lastModifiedBy?: string;
    active?: boolean;
    [key: string]: any; // Allows any additional property
  }
  
  // API Server interface
  export interface ApiServer {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariable>;
  }
  
  // Server Variable interface
  export interface ServerVariable {
    enum?: string[];
    default: string;
    description?: string;
  }
  
  // Unified Endpoint interface
  export interface UnifiedEndpoint {
    path: string;
    method: string;
    operationId?: string;
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: UnifiedParameter[];
    requestBody?: UnifiedRequestBody;
    responses?: Record<string, UnifiedResponse>;
    security?: SecurityRequirement[];
    deprecated?: boolean;
    externalDocs?: ExternalDocumentation;
  }
  
  // Unified Parameter interface
  export interface UnifiedParameter {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: UnifiedSchema;
    example?: any;
    examples?: Record<string, Example>;
  }
  
  // Unified Request Body interface
  export interface UnifiedRequestBody {
    description?: string;
    content: Record<string, MediaType>;
    required?: boolean;
  }
  
  // Media Type interface
  export interface MediaType {
    schema?: UnifiedSchema;
    example?: any;
    examples?: Record<string, Example>;
    encoding?: Record<string, Encoding>;
  }
  
  // Unified Response interface
  export interface UnifiedResponse {
    description: string;
    headers?: Record<string, UnifiedHeader>;
    content?: Record<string, MediaType>;
    links?: Record<string, Link>;
  }
  
  // Unified Header interface
  export interface UnifiedHeader {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: UnifiedSchema;
    example?: any;
    examples?: Record<string, Example>;
  }
  
  // Unified Schema interface
  export interface UnifiedSchema {
    type?: string;
    format?: string;
    title?: string;
    description?: string;
    default?: any;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
    properties?: Record<string, UnifiedSchema>;
    additionalProperties?: boolean | UnifiedSchema;
    items?: UnifiedSchema;
    allOf?: UnifiedSchema[];
    oneOf?: UnifiedSchema[];
    anyOf?: UnifiedSchema[];
    not?: UnifiedSchema;
    discriminator?: Discriminator;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: XML;
    externalDocs?: ExternalDocumentation;
    example?: any;
    deprecated?: boolean;
  }
  
  // Unified Authentication interface
  export interface UnifiedAuthentication {
    type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
    description?: string;
    name?: string; // For apiKey
    in?: 'query' | 'header' | 'cookie'; // For apiKey
    scheme?: string; // For http
    bearerFormat?: string; // For http bearer
    flows?: OAuthFlows; // For oauth2
    openIdConnectUrl?: string; // For openIdConnect
  }
  
  // OAuth Flows interface
  export interface OAuthFlows {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
  }
  
  // OAuth Flow interface
  export interface OAuthFlow {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
  }
  
  // Security Requirement interface
  export interface SecurityRequirement {
    [name: string]: string[];
  }
  
  // Example interface
  export interface Example {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
  }
  
  // Encoding interface
  export interface Encoding {
    contentType?: string;
    headers?: Record<string, UnifiedHeader>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
  }
  
  // Link interface
  export interface Link {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, any>;
    requestBody?: any;
    description?: string;
    server?: ApiServer;
  }
  
  // Discriminator interface
  export interface Discriminator {
    propertyName: string;
    mapping?: Record<string, string>;
  }
  
  // XML interface
  export interface XML {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
  }
  
  // External Documentation interface
  export interface ExternalDocumentation {
    description?: string;
    url: string;
  }
  
  // Unification request interface
  export interface UnificationRequest {
    apiName: string;
  }
  
  // Unification response interface
  export interface UnificationResponse {
    success: boolean;
    message: string;
    document?: UnifiedApiDocument;
    errors?: string[];
  }
  
  // API Response wrapper
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errorCode?: string;
  }
  
  class ApiUnificationService {
    private baseUrl = '/api/unification';
  
    /**
     * Unifies Swagger and Postman documents by API name and saves the unified document
     */
    async unifyAndSaveApiDocuments(apiName: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/unify?apiName=${encodeURIComponent(apiName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
  
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
  
            return await response.text();
        } catch (error) {
            console.error('Error unifying API documents:', error);
            throw error;
        }
    }
  
    /**
     * Retrieves all unified API documents
     */
    async getAllUnifiedDocuments(): Promise<UnifiedApiDocument[]> {
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
            const documents: UnifiedApiDocument[] = [];
            
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
            console.error('Error fetching unified API documents:', error);
            throw error;
        }
    }
  
    /**
     * Retrieves a unified API document by its ID
     */
    async getUnifiedDocumentById(id: string): Promise<UnifiedApiDocument | null> {
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
            console.error('Error fetching unified API document by ID:', error);
            throw error;
        }
    }
  
    /**
     * Retrieves a unified API document by its name
     */
    async getUnifiedDocumentByName(name: string): Promise<UnifiedApiDocument | null> {
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
            console.error('Error fetching unified API document by name:', error);
            throw error;
        }
    }
  
    /**
     * Gets statistics about unified API documents
     */
    async getUnifiedApiStats(): Promise<{
        totalDocuments: number;
        totalEndpoints: number;
        totalSchemas: number;
        teams: string[];
        activeDocuments: number;
        authenticationTypes: string[];
        lastUpdated?: string;
        averageEndpointsPerApi: number;
    }> {
        try {
            const documents = await this.getAllUnifiedDocuments();
  
            const authTypes = new Set<string>();
            let totalEndpoints = 0;
            let totalSchemas = 0;
  
            documents.forEach(doc => {
                if (doc.endpoints) {
                    totalEndpoints += doc.endpoints.length;
                }
                if (doc.schemas) {
                    totalSchemas += Object.keys(doc.schemas).length;
                }
                if (doc.authentication?.type) {
                    authTypes.add(doc.authentication.type);
                }
            });
  
            const stats = {
                totalDocuments: documents.length,
                activeDocuments: documents.filter(doc => doc.active !== false).length,
                totalEndpoints,
                totalSchemas,
                teams: [...new Set(documents.map(doc => doc.team).filter((team): team is string => Boolean(team)))],
                authenticationTypes: Array.from(authTypes),
                averageEndpointsPerApi: documents.length > 0 ? Math.round(totalEndpoints / documents.length * 100) / 100 : 0,
                lastUpdated: documents.reduce((latest, doc) => {
                    const updated = doc.updatedAt || doc.createdAt;
                    if (!updated) return latest;
                    if (!latest) return updated;
                    return new Date(updated) > new Date(latest) ? updated : latest;
                }, null as string | null) || undefined
            };
  
            return stats;
        } catch (error) {
            console.error('Error getting unified API stats:', error);
            throw error;
        }
    }
  
    /**
     * Helper to extract basic information from a unified API document
     */
    static extractBasicInfo(document: UnifiedApiDocument) {
        return {
            id: document._id || document.id,
            name: document.name || 'Unnamed API',
            description: document.description,
            version: document.version,
            baseUrl: document.baseUrl,
            team: document.team,
            endpointCount: document.endpoints?.length || 0,
            schemaCount: document.schemas ? Object.keys(document.schemas).length : 0,
            serverCount: document.servers?.length || 0,
            hasAuthentication: !!document.authentication,
            authenticationType: document.authentication?.type,
            tags: document.tags || [],
            sourcePostmanId: document.sourcePostmanId,
            sourceSwaggerId: document.sourceSwaggerId,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            createdBy: document.createdBy,
            lastModifiedBy: document.lastModifiedBy,
            active: document.active !== false // Default to true if not specified
        };
    }
  
    /**
     * Helper to get all HTTP methods used in the unified document
     */
    static getUsedHttpMethods(document: UnifiedApiDocument): string[] {
        if (!document.endpoints) return [];
  
        const methods = new Set<string>();
        document.endpoints.forEach(endpoint => {
            if (endpoint.method) {
                methods.add(endpoint.method.toUpperCase());
            }
        });
  
        return Array.from(methods).sort();
    }
  
    /**
     * Helper to get all unique tags from endpoints
     */
    static getAllEndpointTags(document: UnifiedApiDocument): string[] {
        if (!document.endpoints) return [];
  
        const tags = new Set<string>();
        document.endpoints.forEach(endpoint => {
            if (endpoint.tags) {
                endpoint.tags.forEach(tag => tags.add(tag));
            }
        });
  
        return Array.from(tags).sort();
    }
  
    /**
     * Helper to get endpoints grouped by tag
     */
    static getEndpointsByTag(document: UnifiedApiDocument): Record<string, UnifiedEndpoint[]> {
        if (!document.endpoints) return {};
  
        const endpointsByTag: Record<string, UnifiedEndpoint[]> = {};
        
        document.endpoints.forEach(endpoint => {
            if (endpoint.tags && endpoint.tags.length > 0) {
                endpoint.tags.forEach(tag => {
                    if (!endpointsByTag[tag]) {
                        endpointsByTag[tag] = [];
                    }
                    endpointsByTag[tag].push(endpoint);
                });
            } else {
                // Endpoints without tags go to 'default'
                if (!endpointsByTag['default']) {
                    endpointsByTag['default'] = [];
                }
                endpointsByTag['default'].push(endpoint);
            }
        });
  
        return endpointsByTag;
    }
  
    /**
     * Helper to get server URLs
     */
    static getServerUrls(document: UnifiedApiDocument): string[] {
        if (!document.servers) return document.baseUrl ? [document.baseUrl] : [];
  
        return document.servers.map(server => server.url).filter(Boolean);
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
    static getStatusColor(document: UnifiedApiDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.endpoints || document.endpoints.length === 0) return 'yellow';
        return 'green';
    }
  
    /**
     * Helper to get authentication status
     */
    static getAuthenticationStatus(document: UnifiedApiDocument): {
        hasAuth: boolean;
        type?: string;
        description?: string;
    } {
        return {
            hasAuth: !!document.authentication,
            type: document.authentication?.type,
            description: document.authentication?.description
        };
    }
  
    /**
     * Helper to get schema complexity score
     */
    static getSchemaComplexity(document: UnifiedApiDocument): {
        score: number;
        level: 'low' | 'medium' | 'high';
        details: {
            totalSchemas: number;
            nestedSchemas: number;
            referencedSchemas: number;
        };
    } {
        if (!document.schemas) {
            return {
                score: 0,
                level: 'low',
                details: { totalSchemas: 0, nestedSchemas: 0, referencedSchemas: 0 }
            };
        }
  
        const schemas = Object.values(document.schemas);
        const totalSchemas = schemas.length;
        let nestedSchemas = 0;
        let referencedSchemas = 0;
  
        schemas.forEach(schema => {
            if (schema.properties && Object.keys(schema.properties).length > 0) {
                nestedSchemas++;
            }
            if (schema.allOf || schema.oneOf || schema.anyOf) {
                referencedSchemas++;
            }
        });
  
        const score = totalSchemas + (nestedSchemas * 2) + (referencedSchemas * 3);
        let level: 'low' | 'medium' | 'high' = 'low';
  
        if (score > 50) level = 'high';
        else if (score > 20) level = 'medium';
  
        return {
            score,
            level,
            details: { totalSchemas, nestedSchemas, referencedSchemas }
        };
    }
  
    /**
     * Helper to validate unified document structure
     */
    static validateUnifiedDocument(document: UnifiedApiDocument): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];
  
        // Required fields validation
        if (!document.name) errors.push('Document name is required');
        if (!document.team) errors.push('Team is required');
  
        // Endpoints validation
        if (!document.endpoints || document.endpoints.length === 0) {
            warnings.push('Document has no endpoints defined');
        } else {
            document.endpoints.forEach((endpoint, index) => {
                if (!endpoint.path) errors.push(`Endpoint ${index + 1}: path is required`);
                if (!endpoint.method) errors.push(`Endpoint ${index + 1}: method is required`);
                if (!endpoint.responses || Object.keys(endpoint.responses).length === 0) {
                    warnings.push(`Endpoint ${index + 1}: no responses defined`);
                }
            });
        }
  
        // Servers validation
        if (document.servers) {
            document.servers.forEach((server, index) => {
                if (!server.url) errors.push(`Server ${index + 1}: URL is required`);
            });
        }
  
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
  
    /**
     * Helper to search endpoints by criteria
     */
    static searchEndpoints(
        document: UnifiedApiDocument,
        criteria: {
            method?: string;
            path?: string;
            tag?: string;
            summary?: string;
        }
    ): UnifiedEndpoint[] {
        if (!document.endpoints) return [];
  
        return document.endpoints.filter(endpoint => {
            if (criteria.method && endpoint.method?.toLowerCase() !== criteria.method.toLowerCase()) {
                return false;
            }
            if (criteria.path && !endpoint.path?.includes(criteria.path)) {
                return false;
            }
            if (criteria.tag && !endpoint.tags?.includes(criteria.tag)) {
                return false;
            }
            if (criteria.summary && !endpoint.summary?.toLowerCase().includes(criteria.summary.toLowerCase())) {
                return false;
            }
            return true;
        });
    }
  }
  
  export const apiUnificationService = new ApiUnificationService();
  export default apiUnificationService;