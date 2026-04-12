import apiClient from '../api/axiosConfig';
import { DashboardSummaryResponse } from '../types';

// Handles communication with the dashboard-related API endpoints.
class DashboardService {
    // Fetches the summary data for the user dashboard.
    async getSummary(): Promise<DashboardSummaryResponse> {
        const { data } = await apiClient.get<DashboardSummaryResponse>('/api/dashboard/summary');
        return data;
    }
}

// Singleton instance shared across the application.
export const dashboardService = new DashboardService();
