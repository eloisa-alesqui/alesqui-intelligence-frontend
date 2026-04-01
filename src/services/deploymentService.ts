import apiClient from '../api/axiosConfig';
import { DeploymentInfo } from '../types';

/**
 * Service to retrieve deployment information for the application.
 * This determines whether the app is running in TRIAL or CORPORATE mode.
 */
class DeploymentService {
    /**
     * Fetches the deployment information from the backend.
     * In case of error, returns default CORPORATE mode configuration.
     * @returns {Promise<DeploymentInfo>} The deployment information
     */
    async getDeploymentInfo(): Promise<DeploymentInfo> {
        try {
            const response = await apiClient.get<DeploymentInfo>('/api/public/deployment-info');
            return response.data;
        } catch (error) {
            console.warn('Failed to fetch deployment info, using default CORPORATE mode:', error);
            // Default fallback to CORPORATE mode
            return {
                mode: 'CORPORATE',
                companyName: 'Alesqui Intelligence',
                selfRegistrationEnabled: false
            };
        }
    }
}

export const deploymentService = new DeploymentService();
