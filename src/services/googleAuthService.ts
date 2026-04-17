import { AxiosError } from 'axios';
import apiClient from '../api/axiosConfig';

export interface OAuth2AuthResponse {
    accessToken: string | null;
    refreshToken: string | null;
    authProvider: string;
    newUser: boolean;
    linkRequired: boolean;
    linkChallenge?: string;
}

class GoogleAuthService {
    private base = '/api/auth/oauth2';

    async loginWithGoogle(idToken: string): Promise<OAuth2AuthResponse> {
        try {
            const { data } = await apiClient.post<OAuth2AuthResponse>(
                `${this.base}/google`,
                { idToken }
            );
            return data;
        } catch (error) {
            throw new Error(this.mapError(error as AxiosError));
        }
    }

    async confirmGoogleLink(idToken: string, linkChallenge: string): Promise<OAuth2AuthResponse> {
        try {
            const { data } = await apiClient.post<OAuth2AuthResponse>(
                `${this.base}/google/link`,
                { idToken, linkChallenge }
            );
            return data;
        } catch (error) {
            throw new Error(this.mapError(error as AxiosError));
        }
    }

    private mapError(error: AxiosError): string {
        switch (error.response?.status) {
            case 401: return 'Could not validate your Google account. Please try again.';
            case 403: return 'Your organization requires an invitation. Contact your administrator.';
            case 404: return 'Google login is currently unavailable.';
            case 429: return 'Too many attempts. Please wait a few minutes.';
            case 503: return 'Google authentication service is unavailable. Try again later.';
            default:  return 'An unexpected error occurred.';
        }
    }
}

export const googleAuthService = new GoogleAuthService();
