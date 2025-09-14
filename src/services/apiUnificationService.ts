import apiClient from '../api/axiosConfig';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * Represents the main unified API document structure, which is the result
 * of merging Swagger/OpenAPI and Postman collections. This is the central
 * data model for a configured API in the application.
 */
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

/**
 * Describes a server providing access to the API.
 */
export interface ApiServer {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariable>;
}

/**
 * Represents a variable for server URL template substitution.
 */
export interface ServerVariable {
    enum?: string[];
    default: string;
    description?: string;
}

/**
 * Represents a single endpoint within the unified document.
 */  
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

/**
 * Describes a single parameter for an endpoint.
 */
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

/**
 * Describes the request body for an endpoint.
 */
export interface UnifiedRequestBody {
    description?: string;
    content: Record<string, MediaType>;
    required?: boolean;
}

/**
 * Defines the content for a specific media type in a request or response.
 */
export interface MediaType {
    schema?: UnifiedSchema;
    example?: any;
    examples?: Record<string, Example>;
    encoding?: Record<string, Encoding>;
}

/**
 * Defines the structure for the response after a unification request.
 */
export interface UnifiedResponse {
    description: string;
    headers?: Record<string, UnifiedHeader>;
    content?: Record<string, MediaType>;
    links?: Record<string, Link>;
}

/**
 * Describes a single header for a response.
 */
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

/**
 * Represents a data schema, following the OpenAPI/JSON Schema specification.
 */
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

/**
 * Describes the authentication mechanism for an API.
 */
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

/**
 * Container for the various OAuth2 flows.
 */
export interface OAuthFlows {
    implicit?: OAuthFlow;
    password?: OAuthFlow;
    clientCredentials?: OAuthFlow;
    authorizationCode?: OAuthFlow;
}

/**
 * Configuration details for a single OAuth2 flow.
 */
export interface OAuthFlow {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes: Record<string, string>;
}

/**
 * Security Requirement interface
 */
export interface SecurityRequirement {
    [name: string]: string[];
}

/**
 * Example interface
 */
export interface Example {
    summary?: string;
    description?: string;
    value?: any;
    externalValue?: string;
}

/**
 * Encoding interface
 */
export interface Encoding {
    contentType?: string;
    headers?: Record<string, UnifiedHeader>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}

/**
 * Link interface
 */
export interface Link {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, any>;
    requestBody?: any;
    description?: string;
    server?: ApiServer;
}

/**
 * Discriminator interface
 */
export interface Discriminator {
    propertyName: string;
    mapping?: Record<string, string>;
}

/**
 * XML interface
 */
export interface XML {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
}
 
/**
 * External Documentation interface
 */
export interface ExternalDocumentation {
    description?: string;
    url: string;
}

/**
 * Unification request interface
 */
export interface UnificationRequest {
    apiName: string;
}

/**
 * Unification response interface
 */
export interface UnificationResponse {
    success: boolean;
    message: string;
    document?: UnifiedApiDocument;
    errors?: string[];
}

/**
 * A generic wrapper for API responses.
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
    errorCode?: string;
}

// ================================================================================================
// API SERVICE CLASS
// ================================================================================================

/**
 * Service class for interacting with the API Unification endpoints.
 * This class handles all HTTP communication with the backend related to creating,
 * fetching, and managing unified API documents.
 */
class ApiUnificationService {
    private baseUrl = '/api/unification';

    /**
     * Triggers the unification process on the backend for a given API name.
     * This process typically involves fetching corresponding Swagger and Postman
     * documents and merging them into a single UnifiedApiDocument.
     * @param apiName The name of the API to unify.
     * @returns A promise that resolves to a confirmation message or ID.
     */
    async unifyAndSaveApiDocuments(apiName: string): Promise<string> {
        // The original method expected text, let's assume the response is the ID of the new document.
        const response = await apiClient.post<string>(`${this.baseUrl}/unify`, null, { // No body needed if apiName is a param
            params: { apiName }
        });
        return response.data;
    }

    /**
     * Updates the runtime configuration for a specific unified API.
     * @param apiName The name of the API to configure.
     * @param apiConfig The configuration object to apply.
     * @returns A promise that resolves to the updated unified API document.
     */
    async updateConfiguration(apiName: string, apiConfig: object): Promise<UnifiedApiDocument> {
        const response = await apiClient.put<UnifiedApiDocument>(`${this.baseUrl}/${apiName}/configuration`, apiConfig);
        return response.data;
    }

    /**
     * Retrieves all unified API documents from the backend as an NDJSON stream.
     * @returns A promise that resolves to an array of UnifiedApiDocument objects.
     */
    async getAllUnifiedDocuments(): Promise<UnifiedApiDocument[]> {
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
     * Retrieves a single unified API document by its unique identifier.
     * @param id The unique ID of the document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getUnifiedDocumentById(id: string): Promise<UnifiedApiDocument | null> {
        try {
            const response = await apiClient.get<UnifiedApiDocument>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }

    /**
     * Retrieves a single unified API document by its name.
     * @param name The name of the document.
     * @returns A promise that resolves to the document, or null if not found (404).
     */
    async getUnifiedDocumentByName(name: string): Promise<UnifiedApiDocument | null> {
        try {
            const response = await apiClient.get<UnifiedApiDocument>(`${this.baseUrl}/by-name`, {
                params: { name }
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) return null;
            throw error;
        }
    }
}

/**
 * Singleton instance of the ApiUnificationService.
 */
export const apiUnificationService = new ApiUnificationService();

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * A collection of pure utility functions for processing UnifiedApiDocument objects.
 * This separation makes the logic reusable and easily testable.
 */
export const UnifiedApiUtils = {

    /**
     * Extracts a simplified, display-friendly info object from a full unified document.
     * @param document The full UnifiedApiDocument object.
     * @returns A flattened object with key information for UI display.
     */
    extractBasicInfo(document: UnifiedApiDocument) {
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
    },

    /**
     * Helper to get all HTTP methods used in the unified document
     */
    getUsedHttpMethods(document: UnifiedApiDocument): string[] {
        if (!document.endpoints) return [];

        const methods = new Set<string>();
        document.endpoints.forEach(endpoint => {
            if (endpoint.method) {
                methods.add(endpoint.method.toUpperCase());
            }
        });

        return Array.from(methods).sort();
    },

    /**
     * Helper to get all HTTP methods used in the unified document.
     * @param document The UnifiedApiDocument.
     * @returns A sorted array of unique uppercase HTTP methods.
     */
    getAllEndpointTags(document: UnifiedApiDocument): string[] {
        if (!document.endpoints) return [];

        const tags = new Set<string>();
        document.endpoints.forEach(endpoint => {
            if (endpoint.tags) {
                endpoint.tags.forEach(tag => tags.add(tag));
            }
        });

        return Array.from(tags).sort();
    },

    /**
     * Helper to get all unique tags from all endpoints in a document.
     * @param document The UnifiedApiDocument.
     * @returns A sorted array of unique tags.
     */
    getEndpointsByTag(document: UnifiedApiDocument): Record<string, UnifiedEndpoint[]> {
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
    },

    /**
     * Groups endpoints by their tag. Endpoints without tags are grouped under 'default'.
     * @param document The UnifiedApiDocument.
     * @returns A record where keys are tags and values are arrays of endpoints.
     */
    getServerUrls(document: UnifiedApiDocument): string[] {
        if (!document.servers) return document.baseUrl ? [document.baseUrl] : [];

        return document.servers.map(server => server.url).filter(Boolean);
    },

    /**
     * Formats an ISO date string into a more readable local format.
     * Example: "Sep 12, 2025, 12:05 PM"
     * @param dateString The ISO-formatted date string to format.
     * @returns A formatted string for UI display, or 'N/A' if the date is not provided.
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
            return dateString; // Fallback to the original string if formatting fails
        }
    },

    /**
     * Determines a status color based on the document's state.
     * This is useful for conditional styling in the UI.
     * - Red: The document is explicitly marked as inactive.
     * - Yellow: The document is active but contains no endpoints (incomplete).
     * - Green: The document is active and has endpoints.
     * @param document The UnifiedApiDocument to evaluate.
     * @returns A color string ('green', 'red', or 'yellow') representing the status.
     */
    getStatusColor(document: UnifiedApiDocument): 'green' | 'red' | 'yellow' {
        if (document.active === false) return 'red';
        if (!document.endpoints || document.endpoints.length === 0) return 'yellow';
        return 'green';
    },

    /**
     * Extracts a summary of the authentication status from a unified document.
     * @param document The UnifiedApiDocument to inspect.
     * @returns An object detailing if authentication is defined, its type, and description.
     */
    getAuthenticationStatus(document: UnifiedApiDocument): {
        hasAuth: boolean;
        type?: string;
        description?: string;
    } {
        return {
            hasAuth: !!document.authentication,
            type: document.authentication?.type,
            description: document.authentication?.description
        };
    },

    /**
     * Calculates a complexity score for the API's schemas.
     * This score provides a quantitative measure of how complex an API's data models are,
     * which can be useful for dashboards and analysis. The score is weighted based on the
     * number of total schemas, nested schemas (with properties), and schemas that use
     * composition (allOf, oneOf, anyOf).
     * @param document The UnifiedApiDocument to analyze.
     * @returns An object containing the score, a qualitative level ('low', 'medium', 'high'),
     * and detailed counts.
     */
    getSchemaComplexity(document: UnifiedApiDocument): {
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

        // The scoring algorithm weights nested and referenced schemas more heavily.
        const score = totalSchemas + (nestedSchemas * 2) + (referencedSchemas * 3);
        let level: 'low' | 'medium' | 'high' = 'low';

        if (score > 50) level = 'high';
        else if (score > 20) level = 'medium';

        return {
            score,
            level,
            details: { totalSchemas, nestedSchemas, referencedSchemas }
        };
    },

    /**
     * Performs a basic structural validation of a unified document.
     * It checks for the presence of required fields and consistency, separating
     * issues into hard errors (making the document invalid) and soft warnings.
     * @param document The UnifiedApiDocument to validate.
     * @returns An object containing a validity flag, and lists of errors and warnings.
     */
    validateUnifiedDocument(document: UnifiedApiDocument): {
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
                    warnings.push(`Endpoint ${index + 1} (${endpoint.method} ${endpoint.path}): no responses defined`);
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
    },

    /**
     * Filters the endpoints of a document based on a set of search criteria.
     * The search is case-insensitive and uses partial matching ('includes') for strings.
     * @param document The UnifiedApiDocument containing the endpoints to search.
     * @param criteria An object with optional search fields (method, path, tag, summary).
     * @returns An array of UnifiedEndpoint objects that match the criteria.
     */
    searchEndpoints(
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
            if (criteria.path && !endpoint.path?.toLowerCase().includes(criteria.path.toLowerCase())) {
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
