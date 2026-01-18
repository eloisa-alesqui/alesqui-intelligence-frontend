import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, UserDetail as UserDetailType, Group } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { useDeployment } from '../../../context/DeploymentContext';
import { User, Layers, Shield, Save, Loader2, X, Mail, CheckCircle, XCircle, Trash2, Search, Plus, Info } from 'lucide-react';

const UserDetail: React.FC = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const { user: currentUser } = useAuth();
    const { isCorporateMode } = useDeployment();
    const [data, setData] = useState<UserDetailType | null>(null);
    const [draft, setDraft] = useState<{ username: string; roles: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'info' | 'groups' | 'security'>('info');
    const [saving, setSaving] = useState(false);

    // Group assignment state
    const [groupAssignOpen, setGroupAssignOpen] = useState(false);
    const [groupAssignSearch, setGroupAssignSearch] = useState('');
    const [groupAssignLoading, setGroupAssignLoading] = useState(false);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [groupAssignSelected, setGroupAssignSelected] = useState<Set<string>>(new Set());
    const [assigningGroups, setAssigningGroups] = useState(false);

    // Remove group state
    const [removingGroupId, setRemovingGroupId] = useState<string | null>(null);

    const allRoles = [
        { value: 'ROLE_SUPERADMIN', label: 'Super Admin', description: 'Full system access, user management, and configuration' },
        { value: 'ROLE_IT', label: 'IT', description: 'API configuration, diagnostics, and technical management' },
        { value: 'ROLE_BUSINESS', label: 'Business', description: 'Business user access to assigned APIs' },
        { value: 'ROLE_TRIAL', label: 'Trial', description: 'Limited trial access to the system' }
    ];

    // Filter roles based on deployment mode:
    // In CORPORATE mode, exclude ROLE_TRIAL
    // In TRIAL mode, include all roles
    const availableRoles = useMemo(() => {
        if (isCorporateMode) {
            return allRoles.filter(role => role.value !== 'ROLE_TRIAL');
        }
        return allRoles;
    }, [isCorporateMode]);

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await adminService.getUser(userId);
            setData(res);
            setDraft({ username: res.username, roles: res.roles });
        } catch (e: any) {
            addNotification(e.message || 'Error loading user', 'error');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [userId]);

    // Load available groups for assignment
    useEffect(() => {
        const fetchGroups = async () => {
            if (!groupAssignOpen || !data) return;
            try {
                setGroupAssignLoading(true);
                const all = await adminService.listGroups();
                const assignedIds = new Set(data.groups.map(g => g.id));
                let list = all.filter(g => !assignedIds.has(g.id));

                // Search filter
                const term = groupAssignSearch.toLowerCase();
                if (term) {
                    list = list.filter(g =>
                        g.code.toLowerCase().includes(term) ||
                        g.name.toLowerCase().includes(term)
                    );
                }

                setAvailableGroups(list);
            } catch (e: any) {
                addNotification(e.message || 'Error loading groups', 'error');
            } finally {
                setGroupAssignLoading(false);
            }
        };
        fetchGroups();
    }, [groupAssignOpen, groupAssignSearch, data?.groups]);



    const isDirty = !!(data && draft && (
        JSON.stringify([...draft.roles].sort()) !== JSON.stringify([...data.roles].sort())
    ));

    const handleSave = async () => {
        if (!data || !draft || !userId) return;

        if (draft.roles.length === 0) {
            addNotification('At least one role is required', 'error');
            return;
        }

        try {
            setSaving(true);
            await adminService.updateUser(userId, {
                roles: JSON.stringify([...draft.roles].sort()) !== JSON.stringify([...data.roles].sort()) ? draft.roles : undefined,
            });
            addNotification('User updated successfully', 'success');
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error updating user', 'error');
        } finally {
            setSaving(false);
        }
    };



    const selectRole = (role: string) => {
        if (!draft) return;
        setDraft(prev => {
            if (!prev) return prev;
            return { ...prev, roles: [role] };
        });
    };

    const handleRemoveGroup = async (groupId: string) => {
        if (!userId) return;
        try {
            setRemovingGroupId(groupId);
            await adminService.removeUserFromGroupDirect(userId, groupId);
            addNotification('User removed from group', 'success');
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error removing user from group', 'error');
        } finally {
            setRemovingGroupId(null);
        }
    };

    const handleAssignGroups = async () => {
        if (!userId || groupAssignSelected.size === 0) return;
        try {
            setAssigningGroups(true);
            await adminService.addUserToGroups(userId, Array.from(groupAssignSelected));
            addNotification(`Added to ${groupAssignSelected.size} group(s)`, 'success');
            setGroupAssignOpen(false);
            setGroupAssignSelected(new Set());
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error assigning groups', 'error');
        } finally {
            setAssigningGroups(false);
        }
    };

    const isCurrentUser = data && currentUser?.sub === data.username;

    if (loading) return (
        <div className="flex justify-center items-center min-h-[12rem] text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
            <span>Loading user details...</span>
        </div>
    );

    if (!data || !draft) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">User not found</div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-start justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <User className="w-6 h-6 text-blue-600" />
                        {data.username}
                        {isCurrentUser && (
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">(You)</span>
                        )}
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-200 flex overflow-x-auto">
                    {[
                        { key: 'info', label: 'INFO', icon: Info },
                        { key: 'groups', label: 'GROUPS', icon: Layers, count: data.groups.length },
                        { key: 'security', label: 'SECURITY', icon: Shield },
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key as any)}
                                className={`px-5 py-3 text-sm font-medium tracking-wide border-b-2 transition-colors flex items-center gap-2
                ${tab === t.key ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                                {t.count !== undefined && (
                                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
                <div className="p-6 space-y-6">
                    {/* Tab Content */}
                    {tab === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1.5" />
                                    Email (Username)
                                </label>
                                <input
                                    type="email"
                                    value={data.username}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">This email serves as the username for login</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <div className="flex items-center gap-2">
                                    {data.active ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-800 border border-green-200 rounded text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded text-sm font-medium">
                                            <XCircle className="w-4 h-4" />
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'groups' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Group Memberships ({data.groups.length})
                                </h3>
                        <button
                            onClick={() => setGroupAssignOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Add to Groups
                        </button>
                    </div>

                    {data.groups.length === 0 ? (
                        <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
                            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">Not a member of any groups</p>
                            <p className="text-sm mt-1">Add this user to groups to grant API access</p>
                        </div>
                    ) : (
                        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">APIs</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.groups.map(g => (
                                        <tr key={g.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700">{g.code}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{g.apiCount ?? 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button
                                                    onClick={() => handleRemoveGroup(g.id)}
                                                    disabled={removingGroupId === g.id}
                                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    {removingGroupId === g.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin inline" />
                                                    ) : 'Remove'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'security' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Assigned Roles
                        </h3>
                        <div className="space-y-3">
                            {availableRoles.map(role => (
                                <label
                                    key={role.value}
                                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${
                                        draft.roles.includes(role.value)
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="userRole"
                                        checked={draft.roles.includes(role.value)}
                                        onChange={() => selectRole(role.value)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="font-medium text-sm text-gray-900">{role.label}</span>
                                        <p className="text-xs text-gray-600 mt-0.5">{role.description}</p>
                                    </div>
                                    {draft.roles.includes(role.value) && (
                                        <CheckCircle className="w-5 h-5 text-blue-600" />
                                    )}
                                </label>
                            ))}
                        </div>
                        {draft.roles.length === 0 && (
                            <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />
                                At least one role is required
                            </p>
                        )}
                        
                        {isDirty && (
                            <div className="mt-6 pt-4 border-t">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || draft.roles.length === 0}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
                </div>
            </div>

            {/* Assign Groups Modal */}
            {groupAssignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl border max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Add to Groups</h3>
                            <button
                                onClick={() => {
                                    setGroupAssignOpen(false);
                                    setGroupAssignSelected(new Set());
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={groupAssignSearch}
                                    onChange={e => setGroupAssignSearch(e.target.value)}
                                    placeholder="Search groups by code or name..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {groupAssignLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                </div>
                            ) : availableGroups.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No groups available</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableGroups.map(g => (
                                        <label
                                            key={g.id}
                                            className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${groupAssignSelected.has(g.id)
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={groupAssignSelected.has(g.id)}
                                                onChange={() => {
                                                    setGroupAssignSelected(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(g.id)) next.delete(g.id);
                                                        else next.add(g.id);
                                                        return next;
                                                    });
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-900">{g.name}</div>
                                                <div className="text-xs text-gray-600 font-mono">{g.code}</div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {g.apiCount ?? 0} API{g.apiCount !== 1 ? 's' : ''}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {groupAssignSelected.size} group{groupAssignSelected.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setGroupAssignOpen(false);
                                        setGroupAssignSelected(new Set());
                                    }}
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignGroups}
                                    disabled={groupAssignSelected.size === 0 || assigningGroups}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {assigningGroups && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add to Groups
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetail;
