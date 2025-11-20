import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService, GroupDetail as GroupDetailType } from '../../../services/adminService';
import { useNotifications } from '../../../context/NotificationContext';
import { Layers, Users as UsersIcon, Settings, Trash2, Save, Loader2, Server, Search, X, Info } from 'lucide-react';
import { apiService, ApiListResponse } from '../../../services/apiService';
import { ApiDocument } from '../../../types';

const GroupDetail: React.FC = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [data, setData] = useState<GroupDetailType | null>(null);
    const [draft, setDraft] = useState<{ name: string; description?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'info' | 'apis' | 'users'>('info');
    const [removingApiId, setRemovingApiId] = useState<string | null>(null);
    const [apiDialogOpen, setApiDialogOpen] = useState(false);
    const [apiToRemove, setApiToRemove] = useState<string | null>(null);
    // Assign APIs modal state
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [assignSearch, setAssignSearch] = useState('');
    const [assignSearchRaw, setAssignSearchRaw] = useState('');
    const [assignActiveFilter, setAssignActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [assignTagFilter, setAssignTagFilter] = useState<string[]>([]);
    const [assignPage, setAssignPage] = useState(0);
    const [assignSize] = useState(10);
    const [assignResults, setAssignResults] = useState<ApiDocument[]>([]);
    const [assignTotalPages, setAssignTotalPages] = useState(0);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [assignSelected, setAssignSelected] = useState<Set<string>>(new Set());
    const [assigning, setAssigning] = useState(false);
    const [assignSelectedHasPublic, setAssignSelectedHasPublic] = useState(false);
    const [orphanPublicIds, setOrphanPublicIds] = useState<Set<string>>(new Set());
    // Users assignment state
    const [userAssignOpen, setUserAssignOpen] = useState(false);
    const [userAssignLoading, setUserAssignLoading] = useState(false);
    const [userAssignError, setUserAssignError] = useState<string | null>(null);
    const [userAssignSearch, setUserAssignSearch] = useState('');
    const [userAssignSearchRaw, setUserAssignSearchRaw] = useState('');
    const [userAssignPage, setUserAssignPage] = useState(0);
    const [userAssignSize] = useState(10);
    const [userAssignResults, setUserAssignResults] = useState<{ id: string; username: string; roles: string[] }[]>([]);
    const [userAssignTotalPages, setUserAssignTotalPages] = useState(0);
    const [userAssignSelected, setUserAssignSelected] = useState<Set<string>>(new Set());
    const [userAssignAssigning, setUserAssignAssigning] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    // Remove user dialog state
    const [removingUserId, setRemovingUserId] = useState<string | null>(null);
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<string | null>(null);

    const load = async () => {
        if (!groupId) return;
        setLoading(true);
        const res = await adminService.getGroup(groupId);
        setData(res);
        setDraft({ name: res.name, description: res.description });
        setLoading(false);
    };

    useEffect(() => { load(); }, [groupId]);

    // Load assignable APIs (client-side filtering to avoid server 500 on search)
    useEffect(() => {
        const fetchCandidates = async () => {
            if (!assignOpen) return;
            try {
                setAssignLoading(true);
                setAssignError(null);
                // Always fetch paged list then filter locally (similar to ApiList)
                const resp = await apiService.getAllApis(assignPage, assignSize);
                const term = assignSearch.trim().toLowerCase();
                // Exclude already assigned
                const assignedIds = new Set((data?.apis || []).map(a => String(a.id)));
                let content = resp.content.filter(a => !assignedIds.has(String(a.id)));
                // Local search filter (name, description, team)
                if (term.length > 0) {
                    content = content.filter(a => (
                        a.name?.toLowerCase().includes(term) ||
                        a.description?.toLowerCase().includes(term) ||
                        a.team?.toLowerCase().includes(term)
                    ));
                }
                // Active filter
                if (assignActiveFilter !== 'all') {
                    const wantActive = assignActiveFilter === 'active';
                    content = content.filter(a => (a.active !== false) === wantActive);
                }
                // Tag filter list from filtered content
                const tagsFromPage = Array.from(new Set(content.flatMap(a => (a.tags || []).map(t => typeof t === 'string' ? t : t.name)).filter(Boolean) as string[]));
                setAvailableTags(tagsFromPage);
                if (assignTagFilter.length > 0) {
                    const wanted = new Set(assignTagFilter);
                    content = content.filter(a => {
                        const names = (a.tags || []).map(t => (typeof t === 'string' ? t : t.name));
                        return names.some(n => wanted.has(n));
                    });
                }
                setAssignResults(content);
                setAssignTotalPages(resp.totalPages); // pagination still reflects backend pages
            } catch (e: any) {
                setAssignError(e.message || 'Failed to load APIs');
            } finally {
                setAssignLoading(false);
            }
        };
        fetchCandidates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignOpen, assignSearch, assignActiveFilter, assignTagFilter, assignPage, data?.apis?.length]);

    // Debounce raw search input -> assigned search value
    useEffect(() => {
        const handle = setTimeout(() => {
            setAssignSearch(assignSearchRaw.trim());
            setAssignPage(0);
        }, 300);
        return () => clearTimeout(handle);
    }, [assignSearchRaw]);

    // Debounce user search input -> effective
    useEffect(() => {
        const handle = setTimeout(() => {
            setUserAssignSearch(userAssignSearchRaw.trim());
            setUserAssignPage(0);
        }, 300);
        return () => clearTimeout(handle);
    }, [userAssignSearchRaw]);

    // Load orphan (public) APIs list when drawer opens (only once per open)
    useEffect(() => {
        const loadOrphans = async () => {
            if (!assignOpen) return;
            try {
                // Backend should return APIs not in any group; using adminService.listOrphanApis placeholder.
                const orphanApis = await adminService.listOrphanApis();
                setOrphanPublicIds(new Set(orphanApis.map(a => String(a.id))));
            } catch {
                // Silently ignore; we just won't mark any as PUBLIC if call fails.
            }
        };
        loadOrphans();
    }, [assignOpen]);

    // Detect if any selected API is Public
    useEffect(() => {
        if (!assignOpen) return;
        const hasPublic = Array.from(assignSelected).some(id => {
            if (orphanPublicIds.has(id)) return true;
            return false;
        });
        setAssignSelectedHasPublic(hasPublic);
    }, [assignSelected, orphanPublicIds, assignResults, assignOpen]);

    const saveInfo = async () => {
        if (!data || !draft) return;
        try {
            await adminService.updateGroup(data.id, { name: draft.name, description: draft.description });
            addNotification('Group updated', 'success');
            // Refresh to get server-confirmed values and keep header in sync
            load();
        } catch (e: any) {
            addNotification(e.message || 'Error updating group', 'error');
        }
    };

    // Delete group modal state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const canDelete = (data?.apis.length === 0) && (data?.users.length === 0);
    const openDelete = () => setDeleteOpen(true);
    const closeDelete = () => { if (!deleting) { setDeleteConfirm(''); setDeleteOpen(false); } };
    const performDelete = async () => {
        if (!data) return;
        if (deleteConfirm !== data.code) return;
        if (!canDelete) return;
        try {
            setDeleting(true);
            await adminService.deleteGroup(data.id);
            addNotification('Group deleted', 'success');
            navigate('/admin/groups');
        } catch (e: any) {
            addNotification(e.message || 'Error deleting group', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const openRemoveApiDialog = (apiId: string) => {
        setApiToRemove(apiId);
        setApiDialogOpen(true);
    };

    const confirmRemoveApi = async () => {
        if (!data || !apiToRemove) return;
        try {
            setRemovingApiId(apiToRemove);
            await adminService.removeApiFromGroup(data.id, apiToRemove);
            setData(prev => prev ? { ...prev, apis: prev.apis.filter(a => String(a.id) !== String(apiToRemove)) } : prev);
            addNotification('API removed from group', 'success');
            setApiDialogOpen(false);
            setApiToRemove(null);
        } catch (e: any) {
            addNotification(e.message || 'Error removing API from group', 'error');
        } finally {
            setRemovingApiId(null);
        }
    };

    const cancelRemoveApi = () => {
        if (removingApiId) return; // prevent closing during removal
        setApiDialogOpen(false);
        setApiToRemove(null);
    };

    // Users remove flow
    const openRemoveUserDialog = (userId: string) => {
        setUserToRemove(userId);
        setUserDialogOpen(true);
    };
    const cancelRemoveUser = () => {
        if (removingUserId) return;
        setUserDialogOpen(false);
        setUserToRemove(null);
    };
    const confirmRemoveUser = async () => {
        if (!data || !userToRemove) return;
        try {
            setRemovingUserId(userToRemove);
            await adminService.removeUserFromGroup(data.id, userToRemove);
            setData(prev => prev ? { ...prev, users: prev.users.filter(u => u.id !== userToRemove) } : prev);
            addNotification('User removed from group', 'success');
            setUserDialogOpen(false);
            setUserToRemove(null);
        } catch (e: any) {
            addNotification(e.message || 'Error removing user from group', 'error');
        } finally {
            setRemovingUserId(null);
        }
    };

    // Load assignable users and filter client-side
    useEffect(() => {
        const loadUsers = async () => {
            if (!userAssignOpen) return;
            try {
                setUserAssignLoading(true);
                setUserAssignError(null);
                const all = await adminService.listUsers();
                // Exclude already assigned and SUPERADMIN users
                const assignedIds = new Set((data?.users || []).map(u => u.id));
                const isSuperAdmin = (u: { roles: string[] }) => u.roles.some(r => r.toUpperCase() === 'ROLE_SUPERADMIN');
                let list = all.filter(u => !assignedIds.has(u.id) && !isSuperAdmin(u));
                // Search
                const term = userAssignSearch.toLowerCase();
                if (term) {
                    list = list.filter(u => u.username.toLowerCase().includes(term) || u.roles.some(r => r.toLowerCase().includes(term)));
                }
                // Roles filter
                if (roleFilter.length > 0) {
                    const wanted = new Set(roleFilter);
                    list = list.filter(u => u.roles.some(r => wanted.has(r)));
                }
                // Available roles
                setAvailableRoles(Array.from(new Set(list.flatMap(u => u.roles))));
                // Client-side pagination with total pages
                const totalPages = Math.ceil(list.length / userAssignSize) || 1;
                setUserAssignTotalPages(totalPages);
                const start = userAssignPage * userAssignSize;
                setUserAssignResults(list.slice(start, start + userAssignSize));
            } catch (e: any) {
                setUserAssignError(e.message || 'Failed to load users');
            } finally {
                setUserAssignLoading(false);
            }
        };
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAssignOpen, userAssignSearch, userAssignPage, roleFilter, data?.users?.length]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[12rem] text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
            <span>Loading group details...</span>
        </div>
    );

    if (!data || !draft) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">Group not found</div>
    );

    const isDirty = !!(data && draft && (
        draft.name !== data.name ||
        (draft.description ?? '') !== (data.description ?? '')
    ));

    return (
        <>
            <div className="space-y-8">
                {/* Header Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex items-start justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Layers className="w-6 h-6 text-blue-600" />
                            {data.name}
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono text-xs border border-gray-200">{data.code}</span>
                            <span className="text-gray-500">{data.description?.slice(0, 80)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <button
                            onClick={openDelete}
                            disabled={!canDelete}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shadow-sm ${canDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            title={canDelete ? 'Delete group' : 'Remove all APIs and users before deleting'}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 flex overflow-x-auto">
                        {(['info', 'apis', 'users'] as const).map(k => (
                            <button
                                key={k}
                                onClick={() => setTab(k)}
                                className={`px-5 py-3 text-sm font-medium tracking-wide border-b-2 transition-colors flex items-center gap-2
                ${tab === k ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
                            >
                                {k === 'info' && <Info className="w-4 h-4" />}
                                {k === 'apis' && <Server className="w-4 h-4" />}
                                {k === 'users' && <UsersIcon className="w-4 h-4" />}
                                {k.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="p-6 space-y-6">
                        {tab === 'info' && (
                            <div className="space-y-6">
                                <div className="grid sm:grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={draft.name}
                                            onChange={e => setDraft({ ...draft, name: e.target.value })}
                                            placeholder="Group name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows={4}
                                        value={draft.description || ''}
                                        onChange={e => setDraft({ ...draft, description: e.target.value })}
                                        placeholder="Optional description"
                                    />
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={saveInfo}
                                        disabled={!isDirty}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        title={!isDirty ? 'No changes to save' : 'Save changes'}
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                    {!isDirty && (
                                        <p className="mt-2 text-xs text-gray-500">Make changes to enable saving.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === 'apis' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Server className="w-4 h-4 text-blue-600" /> Assigned APIs</h3>
                                    <button
                                        className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                        onClick={() => { setAssignOpen(true); setAssignSelected(new Set()); setAssignPage(0); }}
                                    >Assign APIs</button>
                                </div>
                                {data.apis.length === 0 ? (
                                    <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center">No APIs assigned yet</div>
                                ) : (
                                    <ul className="space-y-3">
                                        {data.apis.map(a => (
                                            <li key={String(a.id)} className="bg-white border border-gray-200 rounded-md p-4 hover:shadow-sm transition-shadow">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                                            {a.name}
                                                            {a.version && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{a.version}</span>}
                                                        </div>
                                                        {a.description && <div className="text-xs text-gray-500 line-clamp-2">{a.description}</div>}
                                                        {a.tags && a.tags.length > 0 && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {a.tags.slice(0, 6).map(t => (
                                                                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{t}</span>
                                                                ))}
                                                                {a.tags.length > 6 && <span className="text-[10px] text-gray-400">+{a.tags.length - 6}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {!a.active && <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">INACTIVE</span>}
                                                        <button
                                                            onClick={() => openRemoveApiDialog(String(a.id))}
                                                            disabled={removingApiId === String(a.id)}
                                                            className={`p-1.5 rounded-full transition-colors ${removingApiId === String(a.id) ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                                                            title="Remove API from group"
                                                        >
                                                            {removingApiId === String(a.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {apiDialogOpen && apiToRemove && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                        <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <Trash2 className="w-5 h-5 text-red-600" /> Remove API
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-4">Are you sure you want to remove this API from the group? This only unlinks it; the API itself is not deleted.</p>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    onClick={cancelRemoveApi}
                                                    disabled={!!removingApiId}
                                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={confirmRemoveApi}
                                                    disabled={!!removingApiId}
                                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {removingApiId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    {removingApiId ? 'Removing...' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Assign APIs Drawer */}
                                {assignOpen && (
                                    <div className="fixed inset-0 z-50">
                                        <div className="absolute inset-0 bg-black/40" onClick={() => !assigning && setAssignOpen(false)} />
                                        <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl border-l border-gray-200 flex flex-col">
                                            {/* Header */}
                                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Assign APIs</h3>
                                                    <p className="text-xs text-gray-500">Search and select APIs to link to this group.</p>
                                                </div>
                                                <button className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700" onClick={() => !assigning && setAssignOpen(false)}>
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {/* Controls */}
                                            <div className="p-4 border-b border-gray-100 space-y-3">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-4 h-4" /></div>
                                                    <input
                                                        value={assignSearchRaw}
                                                        onChange={e => setAssignSearchRaw(e.target.value)}
                                                        placeholder="Search by name, description, team..."
                                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="text-xs text-gray-500 mr-2">Status:</div>
                                                    {(['all', 'active', 'inactive'] as const).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => { setAssignActiveFilter(s); setAssignPage(0); }}
                                                            className={`px-2 py-1 rounded-full text-xs border ${assignActiveFilter === s ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                                        >{s.toUpperCase()}</button>
                                                    ))}
                                                </div>
                                                {availableTags.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="text-xs text-gray-500 mr-2">Tags:</div>
                                                        {availableTags.slice(0, 12).map(t => {
                                                            const active = assignTagFilter.includes(t);
                                                            return (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => {
                                                                        setAssignTagFilter(prev => active ? prev.filter(x => x !== t) : [...prev, t]);
                                                                        setAssignPage(0);
                                                                    }}
                                                                    className={`px-2 py-0.5 rounded border text-xs ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                                                                >{t}</button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                {assignSelectedHasPublic && (
                                                    <div className="mt-1 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] leading-snug text-amber-800">
                                                        <span className="font-semibold">Warning:</span>
                                                        <span>Assigning a PUBLIC API will remove its public visibility and make it accessible only to this group (and any others you assign later).</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* List */}
                                            <div className="flex-1 overflow-y-auto p-4">
                                                {assignLoading ? (
                                                    <div className="h-48 flex items-center justify-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading APIs...</div>
                                                ) : assignError ? (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{assignError}</div>
                                                ) : assignResults.length === 0 ? (
                                                    <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md">No APIs match your filters.</div>
                                                ) : (
                                                    <ul className="space-y-3">
                                                        {assignResults.map(api => {
                                                            const checked = assignSelected.has(String(api.id));
                                                            return (
                                                                <li key={String(api.id)} className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                                            checked={checked}
                                                                            onChange={() => {
                                                                                setAssignSelected(prev => {
                                                                                    const next = new Set(prev);
                                                                                    const id = String(api.id);
                                                                                    if (next.has(id)) next.delete(id); else next.add(id);
                                                                                    return next;
                                                                                });
                                                                            }}
                                                                        />
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="font-medium text-gray-900 truncate">{api.name}</div>
                                                                                {api.version && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">v{api.version}</span>}
                                                                            </div>
                                                                            {api.team && (
                                                                                <div className="mt-1 flex items-center text-[11px] text-gray-500 gap-1">
                                                                                    <UsersIcon className="w-3 h-3 text-gray-400" />
                                                                                    <span className="truncate">{api.team}</span>
                                                                                </div>
                                                                            )}
                                                                            {api.description && <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">{api.description}</div>}
                                                                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                                                                {api.active === false ? (
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">INACTIVE</span>
                                                                                ) : (
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 font-medium">ACTIVE</span>
                                                                                )}
                                                                                {(orphanPublicIds.has(String(api.id)) || (api as any).isPublic === true || (api.tags || []).some(t => (typeof t === 'string' ? t : t.name).toLowerCase() === 'public')) && (
                                                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">PUBLIC</span>
                                                                                )}
                                                                                {(api.tags || []).slice(0, 6).map(t => (
                                                                                    <span key={typeof t === 'string' ? t : t.name} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{typeof t === 'string' ? t : t.name}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                            {/* Footer */}
                                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                                <div className="text-sm text-gray-600">Selected: <span className="font-semibold">{assignSelected.size}</span></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-gray-500">Page {assignPage + 1} of {Math.max(assignTotalPages, 1)}</div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-50"
                                                            disabled={assignPage === 0 || assignLoading}
                                                            onClick={() => setAssignPage(p => Math.max(0, p - 1))}
                                                        >Previous</button>
                                                        <button
                                                            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-50"
                                                            disabled={assignLoading || (assignPage + 1 >= assignTotalPages)}
                                                            onClick={() => setAssignPage(p => p + 1)}
                                                        >Next</button>
                                                    </div>
                                                    <button
                                                        disabled={assignSelected.size === 0 || assigning}
                                                        onClick={async () => {
                                                            if (!data) return;
                                                            try {
                                                                setAssigning(true);
                                                                await adminService.assignApis(data.id, { apiIds: Array.from(assignSelected) });
                                                                addNotification('APIs assigned to group', 'success');
                                                                setAssignOpen(false);
                                                                setAssignSelected(new Set());
                                                                load();
                                                            } catch (e: any) {
                                                                addNotification(e.message || 'Failed to assign APIs', 'error');
                                                            } finally {
                                                                setAssigning(false);
                                                            }
                                                        }}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm ${assignSelected.size === 0 || assigning ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                    >
                                                        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><UsersIcon className="w-4 h-4 text-blue-600" /> Group Users</h3>
                                    <button
                                        className="px-3 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                                        onClick={() => { setUserAssignOpen(true); setUserAssignSelected(new Set()); setUserAssignPage(0); }}
                                    >Assign Users</button>
                                </div>
                                {data.users.length === 0 ? (
                                    <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md p-4 text-center">No users assigned yet</div>
                                ) : (
                                    <ul className="space-y-3">
                                        {data.users.map(u => (
                                            <li key={u.id} className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                                <div>
                                                    <div className="font-medium text-gray-900">{u.username}</div>
                                                    <div className="text-xs text-gray-500 flex flex-wrap gap-1 mt-1">
                                                        {u.roles.map(r => <span key={r} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 text-[10px]">{r}</span>)}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => openRemoveUserDialog(u.id)}
                                                    disabled={removingUserId === u.id}
                                                    className={`p-1.5 rounded-full transition-colors ${removingUserId === u.id ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}
                                                    title="Remove user from group"
                                                >
                                                    {removingUserId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {userDialogOpen && userToRemove && (
                                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                                        <div className="bg-white w-full max-w-sm rounded-lg shadow-xl p-6">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <Trash2 className="w-5 h-5 text-red-600" /> Remove User
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-4">Are you sure you want to remove this user from the group?</p>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button
                                                    onClick={cancelRemoveUser}
                                                    disabled={!!removingUserId}
                                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                                                >Cancel</button>
                                                <button
                                                    onClick={confirmRemoveUser}
                                                    disabled={!!removingUserId}
                                                    className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {removingUserId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    {removingUserId ? 'Removing...' : 'Remove'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Assign Users Drawer */}
                                {userAssignOpen && (
                                    <div className="fixed inset-0 z-50">
                                        <div className="absolute inset-0 bg-black/40" onClick={() => !userAssignAssigning && setUserAssignOpen(false)} />
                                        <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl border-l border-gray-200 flex flex-col">
                                            {/* Header */}
                                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Assign Users</h3>
                                                    <p className="text-xs text-gray-500">Search and select users to add to this group.</p>
                                                </div>
                                                <button className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700" onClick={() => !userAssignAssigning && setUserAssignOpen(false)}>
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {/* Controls */}
                                            <div className="p-4 border-b border-gray-100 space-y-3">
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-4 h-4" /></div>
                                                    <input
                                                        value={userAssignSearchRaw}
                                                        onChange={e => setUserAssignSearchRaw(e.target.value)}
                                                        placeholder="Search username or role..."
                                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                {availableRoles.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="text-xs text-gray-500 mr-2">Roles:</div>
                                                        {availableRoles.slice(0, 20).map(r => {
                                                            const active = roleFilter.includes(r);
                                                            return (
                                                                <button
                                                                    key={r}
                                                                    onClick={() => { setRoleFilter(prev => active ? prev.filter(x => x !== r) : [...prev, r]); setUserAssignPage(0); }}
                                                                    className={`px-2 py-0.5 rounded border text-xs ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                                                                >{r}</button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            {/* List */}
                                            <div className="flex-1 overflow-y-auto p-4">
                                                {userAssignLoading ? (
                                                    <div className="h-48 flex items-center justify-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading users...</div>
                                                ) : userAssignError ? (
                                                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{userAssignError}</div>
                                                ) : userAssignResults.length === 0 ? (
                                                    <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded-md">No users match your filters.</div>
                                                ) : (
                                                    <ul className="space-y-3">
                                                        {userAssignResults.map(u => {
                                                            const checked = userAssignSelected.has(u.id);
                                                            return (
                                                                <li key={u.id} className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow">
                                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                                            checked={checked}
                                                                            onChange={() => {
                                                                                setUserAssignSelected(prev => {
                                                                                    const next = new Set(prev);
                                                                                    if (next.has(u.id)) next.delete(u.id); else next.add(u.id);
                                                                                    return next;
                                                                                });
                                                                            }}
                                                                        />
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="font-medium text-gray-900 truncate">{u.username}</div>
                                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                                {u.roles.map(r => <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{r}</span>)}
                                                                            </div>
                                                                        </div>
                                                                    </label>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                            {/* Footer */}
                                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                                <div className="text-sm text-gray-600">Selected: <span className="font-semibold">{userAssignSelected.size}</span></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-gray-500">Page {userAssignPage + 1} of {Math.max(userAssignTotalPages, 1)}</div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-50"
                                                            disabled={userAssignPage === 0 || userAssignLoading}
                                                            onClick={() => setUserAssignPage(p => Math.max(0, p - 1))}
                                                        >Previous</button>
                                                        <button
                                                            className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-50"
                                                            disabled={userAssignLoading || (userAssignPage + 1 >= userAssignTotalPages)}
                                                            onClick={() => setUserAssignPage(p => p + 1)}
                                                        >Next</button>
                                                    </div>
                                                    <button
                                                        disabled={userAssignSelected.size === 0 || userAssignAssigning}
                                                        onClick={async () => {
                                                            if (!data) return;
                                                            try {
                                                                setUserAssignAssigning(true);
                                                                await adminService.assignUsers(data.id, { userIds: Array.from(userAssignSelected) });
                                                                addNotification('Users assigned to group', 'success');
                                                                setUserAssignOpen(false);
                                                                setUserAssignSelected(new Set());
                                                                load();
                                                            } catch (e: any) {
                                                                addNotification(e.message || 'Failed to assign users', 'error');
                                                            } finally {
                                                                setUserAssignAssigning(false);
                                                            }
                                                        }}
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm ${userAssignSelected.size === 0 || userAssignAssigning ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                    >
                                                        {userAssignAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {deleteOpen && data ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-600" /> Delete Group
                        </h3>
                        {!canDelete && (
                            <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                                This group still has <strong>{data.apis.length}</strong> API{data.apis.length !== 1 ? 's' : ''} and <strong>{data.users.length}</strong> user{data.users.length !== 1 ? 's' : ''}. Remove them before deleting.
                            </div>
                        )}
                        {canDelete && (
                            <div className="mt-4 space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    This action permanently deletes the group <span className="font-semibold">{data.name}</span>. Type the group code
                                    <span className="mx-1 font-mono px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">{data.code}</span>
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
                                onClick={closeDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >Cancel</button>
                            <button
                                onClick={performDelete}
                                disabled={!canDelete || deleteConfirm !== data.code || deleting}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${(!canDelete || deleteConfirm !== data.code || deleting) ? 'bg-red-200 text-red-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`}
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default GroupDetail;
