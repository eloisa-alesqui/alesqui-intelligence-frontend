/**
 * Describes the shape of the form state for the API setup wizard.
 */
export interface ApiFormState {
    name: string;
    team?: string;
    description?: string;
    swaggerFile?: File | null;
    postmanFile?: File | null;
    swaggerUploaded: boolean;
    postmanUploaded: boolean;
}

export interface SchemaProperty {
    // Basic properties
    type?: string;
    format?: string;
    title?: string;
    description?: string;
    example?: any;
    defaultValue?: any;
    $ref?: string;

    // Numeric validations
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
    multipleOf?: number;

    // String validations
    minLength?: number;
    maxLength?: number;
    pattern?: string;

    // Array validations
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;

    // Object properties
    properties?: { [key: string]: SchemaProperty };
    required?: string[];
    minProperties?: number;
    maxProperties?: number;

    // Additional properties
    additionalProperties?: any;
    additionalPropertiesSchema?: SchemaProperty;

    // Array items
    items?: SchemaProperty;

    // Enumerations
    enumValues?: any[];

    // Composition
    allOf?: SchemaProperty[];
    oneOf?: SchemaProperty[];
    anyOf?: SchemaProperty[];
    not?: SchemaProperty;

    // Discriminator
    discriminator?: {
        propertyName?: string;
        mapping?: { [key: string]: string };
    };

    // Metadata
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    deprecated?: boolean;

    // XML
    xml?: any;

    // Extensions
    extensions?: { [key: string]: any };
}

export interface Schema {
    type?: string;
    properties?: {
        [key: string]: SchemaProperty;
    };
    required?: string[];
    example?: any;
    description?: string;
    enumValues?: any[];
    format?: string;
    $ref?: string;
}

/**
 * Represents a single tag with a name and an optional description.
 */
export interface Tag {
    name: string;
    description?: string;
}

/**
 * Represents the AI-generated business capabilities for an API.
 */
export interface GeneratedCapabilities {
    category: string;
    capabilities: string[];
}

/**
 * A generic interface for a document representing a unified API.
 */
export interface ApiDocument {
    id: string;
    name: string;
    description?: string;
    version?: string;
    team?: string;
    tags?: Tag[];
    baseUrl?: string;
    endpoints?: Endpoint[];
    schemas?: { [key: string]: Schema };
    servers?: any[];
    createdAt?: string;
    updatedAt?: string;
    active: boolean;
    apiConfiguration: ApiConfig;
    capabilities?: GeneratedCapabilities; 
    [key: string]: any; // Allows for any additional properties
}

/**
 * Represents a single endpoint.
 */
export interface Endpoint {
    _id?: string;
    path: string;
    method: string;
    summary?: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses?: {
        [statusCode: string]: Response;
    };
    deprecated?: boolean;
    security?: any[];
    servers?: any[];
}

export interface MediaType {
    schema?: {
        $ref?: string;
        type?: string;
    };
    example?: any;
    examples?: { [key: string]: any };
}

/**
 * Describes the request body for an endpoint.
 */
export interface RequestBody {
    description?: string;
    required?: boolean;
    content?: {
        [contentType: string]: MediaType;
    };
}

/**
 * Defines the structure for a response from an endpoint.
 */
export interface Response {
    description?: string;
    content?: {
        [contentType: string]: MediaType;
    };
    headers?: { [key: string]: any };
    links?: { [key: string]: any };
}

/**
 * Describes a single parameter for an endpoint.
 */
export interface Parameter {
    name: string;
    in: 'query' | 'header' | 'path' | 'cookie';
    description?: string;
    required?: boolean;
    schema?: any;
    [key: string]: any;
}

/**
 * Represents the different authentication types and their required fields.
 * This is a discriminated union based on the 'authType' property.
 */
type AuthConfig =
    | { authType: 'none' }
    | { authType: 'api_key'; apiKeyName?: string; apiKey?: string; addApiKeyTo?: 'header' | 'query' }
    | { authType: 'bearer'; bearerToken?: string }
    | { authType: 'basic'; basicAuthUsername?: string; basicAuthPassword?: string }
    | {
        authType: 'oauth2';
        oauth2?: {
            grantType: 'client_credentials' | 'password';
            tokenUrl?: string;
            clientId?: string;
            clientSecret?: string;
            scopes?: string;
            username?: string;
            password?: string;
        }
    };

/**
 * Defines the structure for the API's runtime configuration.
 */
export interface ApiConfig {
    baseUrl?: string;
    timeoutSeconds: number;
    maxRetries: number;
    enableLogging: boolean;
    rateLimit: number;
    auth: AuthConfig;
}