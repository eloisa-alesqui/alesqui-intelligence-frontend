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

/**
 * Represents the deployment information for the application.
 * Determines whether the app is running in TRIAL or CORPORATE mode.
 */
export interface DeploymentInfo {
    mode: 'TRIAL' | 'CORPORATE';
    companyName: string;
    selfRegistrationEnabled: boolean;
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
    items?: SchemaProperty; // For array item schemas

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
    additionalProperties?: boolean | SchemaProperty;
}

export interface ChatMessageForRender {
    id: string;
    conversationId: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: string;
    isError?: boolean;
    recordId?: string;
    reasoning?: any; // Added to support reasoning display
    steps?: any[]; // You might want to replace 'any' with a more specific type for steps
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
    createdBy?: string; // Username of the user who created this API
    active: boolean;
    apiConfiguration: ApiConfig;
    capabilities?: GeneratedCapabilities; 
    [key: string]: any; // Allows for any additional properties
}

/**
 * Represents a single endpoint.
 */
export interface Endpoint {
    id?: string;
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
    readOnly: boolean;
    auth: AuthConfig;
}

// --- Dashboard types ---

/**
 * Summarises the most recent conversation associated with a user,
 * providing enough context to display a "last activity" preview.
 */
export interface LastConversationInfo {
    conversationId: string;
    title: string;
    lastUpdated: number;
}

/**
 * Contains the identifying information for a user as returned by the
 * dashboard summary endpoint.
 */
export interface DashboardUserInfo {
    username: string;
    roles: string[];
    memberSince: number;
}

/**
 * Aggregates the user's platform activity metrics shown on the dashboard,
 * including conversation, message, and chart counts.
 */
export interface DashboardActivityInfo {
    totalConversations: number;
    totalMessages: number;
    chartsGenerated: number;
    lastConversation: LastConversationInfo | null;
}

/**
 * Represents a single API available to the user, as listed in the
 * dashboard summary response.
 */
export interface DashboardApiItem {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

/**
 * Describes the current state of a user's trial period, including
 * expiry date and whether the trial has already ended.
 */
export interface DashboardTrialInfo {
    daysRemaining: number;
    trialEndDate: string;
    expired: boolean;
}

/**
 * Provides platform-wide statistics visible only to admin users,
 * such as totals for users, APIs, groups, and open support tickets.
 */
export interface DashboardAdminInfo {
    totalUsers: number;
    totalApis: number;
    totalGroups: number;
    openTickets: number;
}

/**
 * Contains support-related metrics available to support-role users,
 * currently limited to the count of open tickets.
 */
export interface DashboardSupportInfo {
    openTickets: number;
}

/**
 * Root response shape returned by `/api/dashboard/summary`.
 * Optional fields (trial, admin, support) are only present when the
 * authenticated user has the corresponding role or deployment mode.
 */
export interface DashboardSummaryResponse {
    user: DashboardUserInfo;
    activity: DashboardActivityInfo;
    apis: DashboardApiItem[];
    trial?: DashboardTrialInfo;
    admin?: DashboardAdminInfo;
    support?: DashboardSupportInfo;
}