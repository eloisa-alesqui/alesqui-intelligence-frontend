import apiClient from '../api/axiosConfig';

export interface ValidateTokenResponse {
    valid: boolean;
    email?: string;
    expired?: boolean;
    message?: string;
}

export interface ActivateAccountRequest {
    token: string;
    password: string;
}

export interface ActivateAccountResponse {
    success: boolean;
    message: string;
}

class ActivationService {
    private base = '/api/auth';

    /**
     * Validates an activation token
     * @param token - The activation token from the URL
     * @returns Token validation response with user email if valid
     */
    async validateToken(token: string): Promise<ValidateTokenResponse> {
        const { data } = await apiClient.get<ValidateTokenResponse>(
            `${this.base}/validate-token`,
            { params: { token } }
        );
        return data;
    }

    /**
     * Activates a user account with a password
     * @param request - Token and password
     * @returns Activation result
     */
    async activateAccount(request: ActivateAccountRequest): Promise<ActivateAccountResponse> {
        const { data } = await apiClient.post<ActivateAccountResponse>(
            `${this.base}/activate-account`,
            request
        );
        return data;
    }

    /**
     * Requests a new activation token (if previous expired)
     * @param email - User's email address
     * @returns Success response
     */
    async resendActivationEmail(email: string): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>(
            `${this.base}/resend-activation`,
            { email }
        );
        return data;
    }
}

export const activationService = new ActivationService();
