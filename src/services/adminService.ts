import apiClient from '../api/axiosConfig';

// ---- Types ----
export interface Group {
    id: string;
    code: string;
    name: string;
    description?: string;
    createdAt?: string;
    apiCount?: number; 
    userCount?: number; 
}

export interface CreateGroupRequest { code: string; name: string; description?: string; }
export interface UpdateGroupRequest { name?: string; description?: string; }
export interface AssignApisRequest { apiIds: string[]; }
export interface AssignUsersRequest { userIds: string[]; }
export interface ReplaceRolesRequest { roles: string[]; }

export interface User {
    id: string;
    username: string; // email address
    roles: string[];
    createdAt?: string;
    groupCount?: number; 
    active?: boolean;
}

export interface CreateUserRequest {
    username: string; // email
    password?: string; // Optional - for activation flow, password is set later
    roles: string[];
}

export interface UpdateUserRequest {
    username?: string; // email
    password?: string;
    roles?: string[];
}

export interface UserDetailResponse {
    id: string;
    username: string;
    roles: string[];
    createdAt?: string;
    groupCount: number;
    groups: GroupSummaryResponse[];
}

export interface UserDetail extends User {
    groups: Group[];
}

export interface ApiSummary { id: string; name: string; description?: string; active: boolean; version?: string; tags?: string[]; isPublic?: boolean; }
export interface UserSummary { id: string; username: string; roles: string[]; }

export interface GroupDetail extends Group {
    apis: ApiSummary[];
    users: UserSummary[];
}

// Backend response DTO for summary list
export interface GroupSummaryResponse {
    id: string;
    code: string;
    name: string;
    description?: string;
    createdAt?: string;
    userCount: number;
    apiCount: number;
}

export interface ApiSummaryResponse {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    version?: string;
    tags?: string[];
    isPublic?: boolean;
}

export interface UserSummaryResponse { id: string; username: string; roles: string[]; }

export interface GroupDetailResponse extends GroupSummaryResponse {
    apis: ApiSummaryResponse[];
    users: UserSummaryResponse[];
}

// ---- Audit Types ----
export enum AuditAction {
    USER_CREATED = 'USER_CREATED',
    USER_UPDATED = 'USER_UPDATED',
    USER_DELETED = 'USER_DELETED',
    USER_ACTIVATED = 'USER_ACTIVATED',
    USER_DEACTIVATED = 'USER_DEACTIVATED',
    USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
    USER_ROLES_CHANGED = 'USER_ROLES_CHANGED',
    USER_ASSIGNED_TO_GROUP = 'USER_ASSIGNED_TO_GROUP',
    USER_REMOVED_FROM_GROUP = 'USER_REMOVED_FROM_GROUP',
    GROUP_CREATED = 'GROUP_CREATED',
    GROUP_UPDATED = 'GROUP_UPDATED',
    GROUP_DELETED = 'GROUP_DELETED',
    GROUP_USERS_ASSIGNED = 'GROUP_USERS_ASSIGNED',
    GROUP_USER_REMOVED = 'GROUP_USER_REMOVED',
    GROUP_APIS_ASSIGNED = 'GROUP_APIS_ASSIGNED',
    GROUP_API_REMOVED = 'GROUP_API_REMOVED',
    API_CREATED = 'API_CREATED',
    API_UPDATED = 'API_UPDATED',
    API_DELETED = 'API_DELETED',
    API_ASSIGNED_TO_GROUP = 'API_ASSIGNED_TO_GROUP',
    API_REMOVED_FROM_GROUP = 'API_REMOVED_FROM_GROUP',
    AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
    AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE',
    AUTH_LOGOUT = 'AUTH_LOGOUT',
    AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
    AUTH_PASSWORD_RESET_REQUESTED = 'AUTH_PASSWORD_RESET_REQUESTED',
    AUTH_PASSWORD_RESET_COMPLETED = 'AUTH_PASSWORD_RESET_COMPLETED'
}

export enum EntityType {
    USER = 'USER',
    GROUP = 'GROUP',
    API = 'API',
    GROUP_MEMBERSHIP = 'GROUP_MEMBERSHIP',
    API_GROUP_LINK = 'API_GROUP_LINK'
}

export enum AuditResult {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

export interface AuditLogSummary {
    id: string;
    timestamp: string;
    actorUsername: string;
    action: AuditAction;
    actionDescription: string;
    entityType: EntityType;
    entityName: string;
    result: AuditResult;
}

export interface AuditLogDetail {
    id: string;
    timestamp: string;
    actorUsername: string;
    actorUserId: string;
    action: AuditAction;
    actionDescription: string;
    entityType: EntityType;
    entityId: string;
    entityName: string;
    details?: string;
    ipAddress: string;
    userAgent?: string;
    result: AuditResult;
    errorMessage?: string;
    previousData?: string;
    newData?: string;
}

export interface AuditStats {
    totalLogs: number;
    successCount: number;
    failureCount: number;
    actionCounts: Record<string, number>;
    entityTypeCounts: Record<string, number>;
    userActivityCounts: Record<string, number>;
    lastActivityTime: string;
}

export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// ---- Service ----
class AdminService {
    private base = '/api/admin';

    private mapGroupSummary(r: GroupSummaryResponse): Group {
        return {
            id: r.id,
            code: r.code,
            name: r.name,
            description: r.description,
            createdAt: r.createdAt,
            userCount: r.userCount,
            apiCount: r.apiCount,
        };
    }

    private mapApiSummary(a: ApiSummaryResponse): ApiSummary {
        return {
            id: a.id,
            name: a.name,
            description: a.description,
            active: a.active,
            version: a.version,
            tags: a.tags,
            isPublic: a.isPublic,
        };
    }

    // Implemented endpoints
    async createGroup(body: CreateGroupRequest): Promise<Group> {
        const { data } = await apiClient.post<Group>(`${this.base}/groups`, body);
        return data;
    }
    async updateGroup(groupId: string, body: UpdateGroupRequest): Promise<Group> {
        const { data } = await apiClient.patch<Group>(`${this.base}/groups/${groupId}`, body);
        return data;
    }
    async deleteGroup(groupId: string): Promise<void> {
        await apiClient.delete(`${this.base}/groups/${groupId}`);
    }
    async assignApis(groupId: string, body: AssignApisRequest): Promise<any[]> {
        const { data } = await apiClient.post<any[]>(`${this.base}/groups/${groupId}/apis`, body);
        return data;
    }
    async assignUsers(groupId: string, body: AssignUsersRequest): Promise<any[]> {
        const { data } = await apiClient.post<any[]>(`${this.base}/groups/${groupId}/users`, body);
        return data;
    }
    async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
        await apiClient.delete(`${this.base}/groups/${groupId}/users/${userId}`);
    }
    async removeApiFromGroup(groupId: string, apiId: string): Promise<void> {
        await apiClient.delete(`${this.base}/groups/${groupId}/apis/${apiId}`);
    }
    async replaceUserRoles(userId: string, body: ReplaceRolesRequest): Promise<User> {
        const { data } = await apiClient.patch<User>(`${this.base}/users/${userId}/roles`, body);
        return data;
    }

    async listGroups(): Promise<Group[]> {
        const { data } = await apiClient.get<GroupSummaryResponse[]>(`${this.base}/groups`);
        return data.map(this.mapGroupSummary);
    }

    async getGroup(groupId: string): Promise<GroupDetail> {
        const { data } = await apiClient.get<GroupDetailResponse>(`${this.base}/groups/${groupId}`);
        const base = this.mapGroupSummary(data);
        return {
            ...base,
            apis: (data.apis || []).map(a => this.mapApiSummary(a)),
            users: (data.users || []).map(u => ({ id: u.id, username: u.username, roles: u.roles })),
        };
    }
    async listOrphanApis(): Promise<ApiSummary[]> {
        const { data } = await apiClient.get<ApiSummaryResponse[]>(`${this.base}/apis/orphans`);
        return data.map(this.mapApiSummary);
    }
    async listUsers(): Promise<UserSummary[]> {
        const { data } = await apiClient.get<UserSummaryResponse[]>(`${this.base}/users`);
        return (data || []).map(u => ({ id: u.id, username: u.username, roles: u.roles }));
    }

    async listAllUsers(): Promise<User[]> {
        const { data } = await apiClient.get<User[]>(`${this.base}/users`);
        return data;
    }

    async getUser(userId: string): Promise<UserDetail> {
        const { data } = await apiClient.get<UserDetailResponse>(`${this.base}/users/${userId}`);
        return {
            id: data.id,
            username: data.username,
            roles: data.roles,
            createdAt: data.createdAt,
            groupCount: data.groupCount,
            groups: (data.groups || []).map(this.mapGroupSummary),
        };
    }

    async createUser(body: CreateUserRequest): Promise<User> {
        const { data } = await apiClient.post<User>(`${this.base}/users`, body);
        return data;
    }

    async updateUser(userId: string, body: UpdateUserRequest): Promise<User> {
        const { data } = await apiClient.patch<User>(`${this.base}/users/${userId}`, body);
        return data;
    }

    async deleteUser(userId: string): Promise<void> {
        await apiClient.delete(`${this.base}/users/${userId}`);
    }

    async addUserToGroups(userId: string, groupIds: string[]): Promise<void> {
        await apiClient.post(`${this.base}/users/${userId}/groups`, { groupIds });
    }

    async removeUserFromGroupDirect(userId: string, groupId: string): Promise<void> {
        await apiClient.delete(`${this.base}/users/${userId}/groups/${groupId}`);
    }

    async countAdminUsers(): Promise<number> {
        const { data } = await apiClient.get<{ count: number }>(`${this.base}/users/count/admins`);
        return data.count;
    }

    async getCurrentUserGroups(): Promise<Group[]> {
        const { data } = await apiClient.get<GroupSummaryResponse[]>('/api/me/groups');
        return data.map(this.mapGroupSummary);
    }

    async assignApiToGroups(apiId: string, groupIds: string[]): Promise<void> {
        await apiClient.post(`${this.base}/apis/${apiId}/groups`, { groupIds });
    }

    async getApiGroups(apiId: string): Promise<Group[]> {
        try {
            const { data } = await apiClient.get<GroupSummaryResponse[]>(`${this.base}/apis/${apiId}/groups`);
            return data.map(this.mapGroupSummary);
        } catch (error) {
            console.error(`Error fetching groups for API ${apiId}:`, error);
            return [];
        }
    }

    /**
     * Fetches recent audit logs with optional limit
     */
    async getRecentAuditLogs(limit: number = 100): Promise<AuditLogSummary[]> {
        const { data } = await apiClient.get<AuditLogSummary[]>(
            `${this.base}/audit-logs/recent`, 
            { params: { limit } }
        );
        return data;
    }

    /**
     * Fetches audit logs for a specific user with pagination
     */
    async getAuditLogsByUser(
        username: string, 
        page: number = 0, 
        size: number = 50
    ): Promise<PagedResponse<AuditLogDetail>> {
        const { data } = await apiClient.get<PagedResponse<AuditLogDetail>>(
            `${this.base}/audit-logs/user/${username}`,
            { params: { page, size } }
        );
        return data;
    }

    /**
     * Fetches audit logs for a specific entity with pagination
     */
    async getAuditLogsByEntity(
        entityType: EntityType, 
        entityId: string,
        page: number = 0,
        size: number = 50
    ): Promise<PagedResponse<AuditLogDetail>> {
        const { data } = await apiClient.get<PagedResponse<AuditLogDetail>>(
            `${this.base}/audit-logs/entity/${entityType}/${entityId}`,
            { params: { page, size } }
        );
        return data;
    }

    /**
     * Fetches audit logs by action type with pagination
     */
    async getAuditLogsByAction(
        action: AuditAction,
        page: number = 0,
        size: number = 50
    ): Promise<PagedResponse<AuditLogSummary>> {
        const { data } = await apiClient.get<PagedResponse<AuditLogSummary>>(
            `${this.base}/audit-logs/action/${action}`,
            { params: { page, size } }
        );
        return data;
    }

    /**
     * Fetches audit logs within a date range with pagination
     */
    async getAuditLogsByDateRange(
        startDate: string, 
        endDate: string,
        page: number = 0,
        size: number = 50
    ): Promise<PagedResponse<AuditLogSummary>> {
        const { data } = await apiClient.get<PagedResponse<AuditLogSummary>>(
            `${this.base}/audit-logs/date-range`,
            { params: { startDate, endDate, page, size } }
        );
        return data;
    }

    /**
     * Fetches detailed information about a specific audit log
     */
    async getAuditLogById(logId: string): Promise<AuditLogDetail> {
        const { data } = await apiClient.get<AuditLogDetail>(
            `${this.base}/audit-logs/${logId}`
        );
        return data;
    }

    /**
     * Fetches audit statistics
     */
    async getAuditStats(): Promise<AuditStats> {
        const { data } = await apiClient.get<AuditStats>(
            `${this.base}/audit-logs/stats`
        );
        return data;
    }
}

export const adminService = new AdminService();
