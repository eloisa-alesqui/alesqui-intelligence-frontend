import apiClient from '../api/axiosConfig';

// ---- Types ----
export interface AdminGroup {
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
    groups: AdminGroup[];
}

export interface ApiSummary { id: string; name: string; description?: string; active: boolean; version?: string; tags?: string[]; isPublic?: boolean; }
export interface UserSummary { id: string; username: string; roles: string[]; }

export interface GroupDetail extends AdminGroup {
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

// ---- Service ----
class AdminService {
    private base = '/api/admin';

    private mapGroupSummary(r: GroupSummaryResponse): AdminGroup {
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
    async createGroup(body: CreateGroupRequest): Promise<AdminGroup> {
        const { data } = await apiClient.post<AdminGroup>(`${this.base}/groups`, body);
        return data;
    }
    async updateGroup(groupId: string, body: UpdateGroupRequest): Promise<AdminGroup> {
        const { data } = await apiClient.patch<AdminGroup>(`${this.base}/groups/${groupId}`, body);
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

    async listGroups(): Promise<AdminGroup[]> {
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
}

export const adminService = new AdminService();
