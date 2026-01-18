import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, User } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { useDeployment } from '../../../context/DeploymentContext';
import CreateUserModal from './CreateUserModal';
import { Loader2, AlertCircle, Inbox, Mail, Search, Plus, ChevronUp, ChevronDown, Trash2, Shield, CheckCircle } from 'lucide-react';

const UserList: React.FC = () => {
    const { addNotification } = useNotifications();
    const { user: currentUser } = useAuth();
    const { isCorporateMode } = useDeployment();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [showCreate, setShowCreate] = useState(false);
    const [emailSortDir, setEmailSortDir] = useState<'asc'|'desc'>('asc');
    
    // Delete modal state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            const userData = await adminService.listAllUsers();
            setUsers(userData);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Error loading users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const base = users.filter(u => {
            const txt = u.username.toLowerCase();
            const roles = u.roles.join(' ').toLowerCase();
            
            if (!txt.includes(filterText.toLowerCase()) && !roles.includes(filterText.toLowerCase())) {
                return false;
            }
            
            if (roleFilter && !u.roles.includes(roleFilter)) {
                return false;
            }
            
            return true;
        });
        
        const sorted = [...base].sort((a, b) => {
            const cmp = a.username.localeCompare(b.username);
            return emailSortDir === 'asc' ? cmp : -cmp;
        });
        
        return sorted;
    }, [users, filterText, roleFilter, emailSortDir]);

    const isCurrentUser = (user: User) => {
        return currentUser?.sub === user.username;
    };

    const isLastAdmin = (user: User) => {
        const superAdminUsers = users.filter(u => u.roles.includes('ROLE_SUPERADMIN'));
        return user.roles.includes('ROLE_SUPERADMIN') && superAdminUsers.length <= 1;
    };

    const canDelete = (user: User) => {
        return !isCurrentUser(user) && !isLastAdmin(user);
    };

    const openDeleteModal = (u: User) => {
        setUserToDelete(u);
        setDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setDeleteConfirm('');
            setDeleteOpen(false);
            setUserToDelete(null);
        }
    };

    const performDelete = async () => {
        if (!userToDelete) return;
        if (deleteConfirm !== userToDelete.username) return;
        if (!canDelete(userToDelete)) return;

        try {
            setDeleting(true);
            await adminService.deleteUser(userToDelete.id);
            addNotification('User deleted successfully', 'success');
            closeDeleteModal();
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error deleting user', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ROLE_SUPERADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'ROLE_IT': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ROLE_BUSINESS': return 'bg-green-100 text-green-800 border-green-200';
            case 'ROLE_TRIAL': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'ROLE_SUPERADMIN': return 'Super Admin';
            case 'ROLE_IT': return 'IT';
            case 'ROLE_BUSINESS': return 'Business';
            case 'ROLE_TRIAL': return 'Trial';
            default: return role;
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading users...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <div>
                        <h4 className="font-bold">Failed to load users</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="text-center text-gray-500 h-64 flex flex-col justify-center items-center">
                    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or create a new user.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto shadow rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => setEmailSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                aria-sort={emailSortDir === 'asc' ? 'ascending' : 'descending'}
                                title={`Sort by email (${emailSortDir === 'asc' ? 'ascending' : 'descending'})`}
                            >
                                <div className="flex items-center gap-1">
                                    Email (Username)
                                    {emailSortDir === 'asc' ? (
                                        <ChevronUp className="w-3 h-3 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Groups</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {u.username}
                                        {isCurrentUser(u) && (
                                            <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">(You)</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex flex-wrap gap-1">
                                        {u.roles.map(role => (
                                            <span key={role} className={`px-2 py-0.5 text-xs font-medium rounded border ${getRoleBadgeColor(role)}`}>
                                                {getRoleLabel(role)}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    {u.active ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle className="w-3 h-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border bg-amber-100 text-amber-800 border-amber-200">
                                            <AlertCircle className="w-3 h-3" />
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{u.groupCount ?? 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button 
                                        onClick={() => navigate(`/admin/users/${u.id}`)} 
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Manage
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(u)}
                                        disabled={!canDelete(u)}
                                        className={`${!canDelete(u) ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                                        title={
                                            isCurrentUser(u) 
                                                ? 'Cannot delete your own account' 
                                                : isLastAdmin(u) 
                                                    ? 'Cannot delete the last Super Admin user' 
                                                    : 'Delete user'
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">Manage user accounts and permissions.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                </button>
            </div>

            <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
            >
                <div className="relative w-full md:w-auto md:flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Filter by email or role..."
                    />
                </div>

                <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Roles</option>
                        <option value="ROLE_SUPERADMIN">Super Admin</option>
                        <option value="ROLE_IT">IT</option>
                        <option value="ROLE_BUSINESS">Business</option>
                        {/* Only show ROLE_TRIAL option in TRIAL mode */}
                        {!isCorporateMode && <option value="ROLE_TRIAL">Trial</option>}
                    </select>
                </div>

                <button
                    type="button"
                    title="Apply Filters"
                    className="w-full md:w-auto flex items-center justify-center 
                               p-2.5 h-10 w-10  
                               bg-blue-600 text-white rounded-lg 
                               hover:bg-blue-700 transition-colors 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 
                               md:ml-auto flex-shrink-0"
                >
                    <Search className="w-5 h-5" />
                </button>
            </form>

            <div className="overflow-x-auto">
                {renderContent()}
            </div>

            {showCreate && (
                <CreateUserModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); load(); }}
                />
            )}

            {deleteOpen && userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" /> Delete User
                        </h3>
                        
                        {!canDelete(userToDelete) && (
                            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                                {isCurrentUser(userToDelete) && (
                                    <p>You cannot delete your own account.</p>
                                )}
                                {isLastAdmin(userToDelete) && (
                                    <p>Cannot delete the last Super Admin user in the system.</p>
                                )}
                            </div>
                        )}
                        
                        {canDelete(userToDelete) && (
                            <div className="mt-4 space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    This action permanently deletes the user <span className="font-semibold">{userToDelete.username}</span>
                                    {(userToDelete.groupCount ?? 0) > 0 && (
                                        <span className="block mt-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                                            ⚠️ This user belongs to <strong>{userToDelete.groupCount}</strong> group{userToDelete.groupCount !== 1 ? 's' : ''}. All memberships will be removed.
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Type the email address
                                    <span className="mx-1 font-mono px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">{userToDelete.username}</span>
                                    to confirm.
                                </p>
                                <input
                                    autoFocus
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    placeholder="Type email to confirm"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            {canDelete(userToDelete) && (
                                <button
                                    onClick={performDelete}
                                    disabled={deleteConfirm !== userToDelete.username || deleting}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${(deleteConfirm !== userToDelete.username || deleting) ? 'bg-red-200 text-red-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`}
                                >
                                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
