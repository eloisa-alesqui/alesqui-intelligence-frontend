import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, UserDetail as UserDetailType, AdminGroup } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { User, Layers, Shield, Save, Loader2, X, Mail, Lock, CheckCircle, XCircle, Trash2, Search, Plus } from 'lucide-react';

const UserDetail: React.FC = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const { user: currentUser } = useAuth();
    const [data, setData] = useState<UserDetailType | null>(null);
    const [draft, setDraft] = useState<{ username: string; roles: string[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'info' | 'groups' | 'security'>('info');
    const [saving, setSaving] = useState(false);

    // Password change state
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Group assignment state
    const [groupAssignOpen, setGroupAssignOpen] = useState(false);
    const [groupAssignSearch, setGroupAssignSearch] = useState('');
    const [groupAssignLoading, setGroupAssignLoading] = useState(false);
    const [availableGroups, setAvailableGroups] = useState<AdminGroup[]>([]);
    const [groupAssignSelected, setGroupAssignSelected] = useState<Set<string>>(new Set());
    const [assigningGroups, setAssigningGroups] = useState(false);

    // Remove group state
    const [removingGroupId, setRemovingGroupId] = useState<string | null>(null);

    const availableRoles = [
        { value: 'ROLE_SUPERADMIN', label: 'Super Admin', description: 'Full system access, user management, and configuration' },
        { value: 'ROLE_IT', label: 'IT', description: 'API configuration, diagnostics, and technical management' },
        { value: 'ROLE_BUSINESS', label: 'Business', description: 'Business user access to assigned APIs' },
        { value: 'ROLE_TRIAL', label: 'Trial', description: 'Limited trial access to the system' }
    ];

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

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
        if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
        if (!/\d/.test(pwd)) return 'Password must contain a number';
        if (!/[^a-zA-Z0-9]/.test(pwd)) return 'Password must contain a special character';
        return null;
    };

    const getPasswordStrength = (pwd: string): { score: number; label: string; color: string } => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^a-zA-Z0-9]/.test(pwd)) score++;

        if (score <= 1) return { score, label: 'Weak', color: 'text-red-600' };
        if (score <= 3) return { score, label: 'Moderate', color: 'text-amber-600' };
        return { score, label: 'Strong', color: 'text-green-600' };
    };

    const isDirty = !!(data && draft && (
        draft.username !== data.username ||
        JSON.stringify([...draft.roles].sort()) !== JSON.stringify([...data.roles].sort())
    ));

    const handleSave = async () => {
        if (!data || !draft || !userId) return;

        if (!validateEmail(draft.username)) {
            addNotification('Invalid email format', 'error');
            return;
        }

        if (draft.roles.length === 0) {
            addNotification('At least one role is required', 'error');
            return;
        }

        try {
            setSaving(true);
            await adminService.updateUser(userId, {
                username: draft.username !== data.username ? draft.username : undefined,
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

    const handlePasswordChange = async () => {
        if (!userId) return;

        const pwdError = validatePassword(newPassword);
        if (pwdError) {
            setPasswordError(pwdError);
            return;
        }

        try {
            setChangingPassword(true);
            await adminService.updateUser(userId, { password: newPassword });
            addNotification('Password changed successfully', 'success');
            setNewPassword('');
            setShowPasswordChange(false);
            setPasswordError('');
        } catch (e: any) {
            addNotification(e.message || 'Error changing password', 'error');
        } finally {
            setChangingPassword(false);
        }
    };

    const toggleRole = (role: string) => {
        if (!draft) return;
        setDraft(prev => {
            if (!prev) return prev;
            const newRoles = prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles: newRoles };
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

    const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        aria-label="Back to users"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <User className="w-7 h-7 text-blue-600" />
                            {data.username}
                            {isCurrentUser && (
                                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">(You)</span>
                            )}
                        </h1>
                        <p className="text-gray-600 mt-1">User ID: {data.id}</p>
                    </div>
                </div>
                {isDirty && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-8">
                    {[
                        { key: 'info', label: 'Info', icon: User },
                        { key: 'groups', label: 'Groups', icon: Layers, count: data.groups.length },
                        { key: 'security', label: 'Security', icon: Shield },
                    ].map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key as any)}
                                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${tab === t.key
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {t.label}
                                {t.count !== undefined && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {t.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            {tab === 'info' && (
                <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-1.5" />
                            Email (Username)
                        </label>
                        <input
                            type="email"
                            value={draft.username}
                            onChange={e => setDraft(prev => prev ? { ...prev, username: e.target.value } : prev)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">This email serves as the username for login</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                        <input
                            type="text"
                            value={data.id}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                        <input
                            type="text"
                            value={data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-600" />
                                Password Management
                            </h3>
                            {!showPasswordChange && (
                                <button
                                    onClick={() => setShowPasswordChange(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {showPasswordChange && (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => {
                                            setNewPassword(e.target.value);
                                            setPasswordError('');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                    />

                                    {newPassword && passwordStrength && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${passwordStrength.score <= 1 ? 'bg-red-500 w-1/4' :
                                                                passwordStrength.score <= 3 ? 'bg-amber-500 w-2/4' :
                                                                    'bg-green-500 w-full'
                                                            }`}
                                                    />
                                                </div>
                                                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {passwordError && (
                                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                            <XCircle className="w-3.5 h-3.5" />
                                            {passwordError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPasswordChange(false);
                                            setNewPassword('');
                                            setPasswordError('');
                                        }}
                                        disabled={changingPassword}
                                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={changingPassword || !newPassword}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {changingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        )}
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
                <div className="bg-white border rounded-lg shadow-sm p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Assigned Roles
                        </h3>
                        <div className="space-y-3">
                            {availableRoles.map(role => (
                                <label
                                    key={role.value}
                                    className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${draft.roles.includes(role.value)
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={draft.roles.includes(role.value)}
                                        onChange={() => toggleRole(role.value)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                    </div>

                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Role Permissions</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                <span><strong>Super Admin:</strong> Full system access, user management, and configuration</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                <span><strong>IT:</strong> API configuration, diagnostics, and technical management</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                <span><strong>Business:</strong> Business user access to APIs based on group membership</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                                <span><strong>Trial:</strong> Limited trial access to the system</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

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
