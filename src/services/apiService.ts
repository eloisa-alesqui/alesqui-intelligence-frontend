// Tipo genérico para el documento de MongoDB
export interface ApiDocument {
    _id?: string;
    id?: string;
    [key: string]: any; // Permite cualquier propiedad adicional
}

// Respuesta del endpoint de lista
export interface ApiListResponse {
    content: ApiDocument[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

class ApiService {
    private baseUrl = '/api/unification';

    /**
     * Obtiene todas las APIs con paginación opcional
     */
    async getAllApis(page: number = 0, size: number = 20): Promise<ApiListResponse> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });

            const response = await fetch(`${this.baseUrl}?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Si el backend devuelve un array simple (sin paginación)
            if (Array.isArray(data)) {
                return {
                    content: data,
                    totalElements: data.length,
                    totalPages: 1,
                    size: data.length,
                    number: 0
                };
            }

            // Si el backend devuelve con paginación
            return data;
        } catch (error) {
            console.error('Error fetching APIs:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las APIs sin paginación (para casos simples)
     */
    async getAllApisSimple(): Promise<ApiDocument[]> {
        try {
            const response = await this.getAllApis(0, 1000); // Obtener muchas de una vez
            return response.content;
        } catch (error) {
            console.error('Error fetching APIs:', error);
            throw error;
        }
    }

    /**
     * Obtiene una API por su ID
     */
    async getApiById(id: string): Promise<ApiDocument | null> {
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
            console.error('Error fetching API by ID:', error);
            throw error;
        }
    }

    /**
     * Obtiene una API por su nombre
     */
    async getApiByName(name: string): Promise<ApiDocument | null> {
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
            console.error('Error fetching API by name:', error);
            throw error;
        }
    }

    /**
     * Busca APIs por término de búsqueda
     */
    async searchApis(searchTerm: string, page: number = 0, size: number = 20): Promise<ApiListResponse> {
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                page: page.toString(),
                size: size.toString()
            });

            const response = await fetch(`${this.baseUrl}/search?${params}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching APIs:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de las APIs
     */
    async getApiStats(): Promise<{
        totalApis: number;
        totalEndpoints: number;
        teams: string[];
        lastUpdated?: string;
    }> {
        try {
            const apis = await this.getAllApisSimple();

            const stats = {
                totalApis: apis.length,
                totalEndpoints: apis.reduce((total, api) => {
                    const endpoints = api.endpoints || [];
                    return total + (Array.isArray(endpoints) ? endpoints.length : 0);
                }, 0),
                teams: [...new Set(apis.map(api => api.team).filter(Boolean))],
                lastUpdated: apis.reduce((latest, api) => {
                    const updated = api.updatedAt || api.createdAt;
                    if (!updated) return latest;
                    if (!latest) return updated;
                    return new Date(updated) > new Date(latest) ? updated : latest;
                }, null as string | null) || undefined
            };

            return stats;
        } catch (error) {
            console.error('Error getting API stats:', error);
            throw error;
        }
    }

    /**
     * Helpers para extraer información común de los documentos
     */
    static extractBasicInfo(api: ApiDocument) {
        return {
            id: api._id || api.id,
            name: api.name || 'Unnamed API',
            description: api.description,
            version: api.version,
            team: api.team,
            baseUrl: api.baseUrl,
            endpointCount: Array.isArray(api.endpoints) ? api.endpoints.length : 0,
            serverCount: Array.isArray(api.servers) ? api.servers.length : 0,
            createdAt: api.createdAt,
            updatedAt: api.updatedAt,
            active: api.active !== false // Por defecto true si no está especificado
        };
    }

    /**
     * Helper para formatear fechas
     */
    static formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';

        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
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
     * Helper para obtener el color del estado
     */
    static getStatusColor(api: ApiDocument): 'green' | 'red' | 'yellow' {
        if (api.active === false) return 'red';
        if (!api.endpoints || api.endpoints.length === 0) return 'yellow';
        return 'green';
    }

    /**
     * Helper para obtener servidores como strings
     */
    static getServerUrls(api: ApiDocument): string[] {
        if (!api.servers || !Array.isArray(api.servers)) {
            return api.baseUrl ? [api.baseUrl] : [];
        }

        return api.servers.map((server: any) => {
            if (typeof server === 'string') return server;
            return server.url || server.baseUrl || '';
        }).filter(Boolean);
    }
}

export const apiService = new ApiService();
export default apiService;