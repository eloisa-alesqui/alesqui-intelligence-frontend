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
 * Represents the different authentication types and their required fields.
 * This is a discriminated union based on the 'authType' property.
 */
type AuthConfig = 
    | { authType: 'none' }
    | { authType: 'api_key'; apiKeyName?: string; apiKey?: string; addApiKeyTo?: 'header' | 'query' }
    | { authType: 'bearer'; bearerToken?: string }
    | { authType: 'basic'; basicAuthUsername?: string; basicAuthPassword?: string }
    | { 
        authType: 'oauth2_client_credentials'; 
        oauth2ClientCredentials: {
            clientId?: string;
            clientSecret?: string;
            tokenUrl?: string;
            scopes?: string;
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