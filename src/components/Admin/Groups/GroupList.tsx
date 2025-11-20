import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, Group } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import CreateGroupModal from './CreateGroupModal.tsx';
import { Loader2, AlertCircle, Inbox, User, Search, Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const GroupList: React.FC = () => {
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [codeSortDir, setCodeSortDir] = useState<'asc'|'desc'>('asc');
    
    // Delete modal state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

    const load = async () => {
        try {
            setLoading(true);
            const data = await adminService.listGroups();
            setGroups(data);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Error loading groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const base = groups.filter(g => {
            const txt = (g.code + ' ' + g.name).toLowerCase();
            if (!txt.includes(filterText.toLowerCase())) return false;
            return true;
        });
        const sorted = [...base].sort((a, b) => {
            const cmp = a.code.localeCompare(b.code);
            return codeSortDir === 'asc' ? cmp : -cmp;
        });
        return sorted;
    }, [groups, filterText, codeSortDir]);

    const openDeleteModal = (g: Group) => {
        setGroupToDelete(g);
        setDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        if (!deleting) {
            setDeleteConfirm('');
            setDeleteOpen(false);
            setGroupToDelete(null);
        }
    };

    const performDelete = async () => {
        if (!groupToDelete) return;
        if (deleteConfirm !== groupToDelete.code) return;
        
        const apiCount = groupToDelete.apiCount ?? 0;
        const userCount = groupToDelete.userCount ?? 0;
        if (apiCount > 0 || userCount > 0) return;

        try {
            setDeleting(true);
            await adminService.deleteGroup(groupToDelete.id);
            addNotification('Group deleted', 'success');
            closeDeleteModal();
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error deleting group', 'error');
        } finally {
            setDeleting(false);
        }
    };

        const handleDelete = async (g: Group) => {
            // Guard: cannot delete if group has any APIs or users
            const apiCount = g.apiCount ?? 0;
            const userCount = g.userCount ?? 0;
            if (apiCount > 0 || userCount > 0) {
                addNotification(`Cannot delete a group with ${apiCount} API${apiCount!==1?'s':''} and ${userCount} user${userCount!==1?'s':''}. Remove them first.`, 'error');
                return;
            }
            if (!window.confirm(`Delete group '${g.name}'? This action is irreversible.`)) return;
            try {
                await adminService.deleteGroup(g.id);
                addNotification('Group deleted', 'success');
                load();
            } catch (e: any) {
                addNotification(e.message || 'Error deleting group', 'error');
            }
        };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading groups...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <div>
                        <h4 className="font-bold">Failed to load groups</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="text-center text-gray-500 h-64 flex flex-col justify-center items-center">
                    <Inbox className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No groups found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or create a new group.</p>
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
                                onClick={() => setCodeSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                                aria-sort={codeSortDir === 'asc' ? 'ascending' : 'descending'}
                                title={`Sort by code (${codeSortDir === 'asc' ? 'ascending' : 'descending'})`}
                            >
                                <div className="flex items-center gap-1">
                                    Code
                                    {codeSortDir === 'asc' ? (
                                        <ChevronUp className="w-3 h-3 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3 text-gray-400" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">APIs</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtered.map(g => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700">{g.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{g.apiCount ?? '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{g.userCount ?? '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => navigate(`/admin/groups/${g.id}`)} className="text-blue-600 hover:text-blue-900">Manage</button>
                                    <button
                                        onClick={() => openDeleteModal(g)}
                                        className={`${(g.apiCount ?? 0) > 0 || (g.userCount ?? 0) > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                                        title={(g.apiCount ?? 0) > 0 || (g.userCount ?? 0) > 0 ? 'Remove all APIs and users before deleting' : 'Delete group'}
                                    >Delete</button>
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
                    <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
                    <p className="text-gray-600 mt-1">Manage visibility and memberships.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                </button>
            </div>

            <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border rounded-lg shadow-sm"
            >
                <div className="relative w-full md:w-auto md:flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Filter by name or code..."
                    />
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
                <CreateGroupModal
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); load(); }}
                />
            )}

            {deleteOpen && groupToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" /> Delete Group
                        </h3>
                        {((groupToDelete.apiCount ?? 0) > 0 || (groupToDelete.userCount ?? 0) > 0) && (
                            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                                This group still has <strong>{groupToDelete.apiCount ?? 0}</strong> API{groupToDelete.apiCount !== 1 ? 's' : ''} and <strong>{groupToDelete.userCount ?? 0}</strong> user{groupToDelete.userCount !== 1 ? 's' : ''}. Remove them before deleting.
                            </div>
                        )}
                        {((groupToDelete.apiCount ?? 0) === 0 && (groupToDelete.userCount ?? 0) === 0) && (
                            <div className="mt-4 space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    This action permanently deletes the group <span className="font-semibold">{groupToDelete.name}</span>. Type the group code
                                    <span className="mx-1 font-mono px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">{groupToDelete.code}</span>
                                    to confirm.
                                </p>
                                <input
                                    autoFocus
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    placeholder="Type group code to confirm"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >Cancel</button>
                            <button
                                onClick={performDelete}
                                disabled={((groupToDelete.apiCount ?? 0) > 0 || (groupToDelete.userCount ?? 0) > 0) || deleteConfirm !== groupToDelete.code || deleting}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${(((groupToDelete.apiCount ?? 0) > 0 || (groupToDelete.userCount ?? 0) > 0) || deleteConfirm !== groupToDelete.code || deleting) ? 'bg-red-200 text-red-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`}
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupList;
