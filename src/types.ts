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
 * A generic interface for a document representing a unified API.
 */
export interface ApiDocument {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    version?: string;
    team?: string;
    baseUrl?: string;
    endpoints?: any[];
    servers?: any[];
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
    apiConfiguration: ApiConfig;
    [key: string]: any; // Allows for any additional properties
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