"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../../lib/context/auth-context";
import SearchField from '../../../../../components/adminUI/SearchField.jsx';
import PageFilter from '../../../../../components/ui/PageFilter.jsx';
import DataTable from '../../../../../components/ui/DataTable.jsx';
import Toast from '../../../../../components/ui/Toast.jsx';
import IconButton from '@mui/material/IconButton';
import PermissionGate from '../../../../../components/adminUI/PermissionGate.jsx';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

export default function PermissionGroupsTab() {
  const { apiCall } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const [editing, setEditing] = useState(null); // { id, key, name, description }

  const fetchGroups = useCallback(async (cursor = null, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('perPage', perPage.toString());
      if (cursor) params.append('cursor', cursor.toString());
      if (searchTerm) params.append('search', searchTerm);

      const res = await apiCall(`/api/admin/permission-groups?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch permission groups');
      const json = await res.json();

      const items = (json.data && (json.data.groups || json.data.permissionGroups || json.data)) || [];
      if (cursor) {
        setGroups(prev => [...prev, ...items]);
      } else {
        setGroups(items);
      }

      setNextCursor(json.data.pagination?.nextCursor || null);
      setHasMore(json.data.pagination?.hasMore || false);
      setTotal(json.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load groups', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  }, [apiCall, perPage]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setGroups([]);
    setNextCursor(null);
    fetchGroups(null, searchInput);
  };

  const handleLoadMore = () => {
    if (nextCursor && !loading) fetchGroups(nextCursor, search);
  };

  const handlePerPageChange = (n) => {
    setGroups([]);
    setNextCursor(null);
    setPerPage(n);
  };

  const handleCreateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newKey) {
      setToast({ message: 'Key is required', type: 'error', visible: true });
      return;
    }
    try {
      setCreating(true);
      const res = await apiCall('/api/admin/permission-groups', {
        method: 'POST',
        body: JSON.stringify({ key: newKey, name: newName, description: newDescription }),
      });
      if (!res.ok) throw new Error('Failed to create group');
      const json = await res.json();
      setGroups(prev => [json.data, ...prev]);
      setNewKey(''); setNewName(''); setNewDescription('');
      setCreateOpen(false);
      setToast({ message: 'Group created', type: 'info', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Create failed', type: 'error', visible: true });
    } finally {
      setCreating(false);
    }
  };

  const openDeleteConfirm = (id, name) => setToast({ message: `Confirm delete ${name}`, type: 'info', visible: true, confirm: { id, name } });

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      const res = await apiCall(`/api/admin/permission-groups?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete group');
      await res.json();
      setGroups(prev => prev.filter(g => g.id !== id));
      setToast({ message: 'Group deleted', type: 'info', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Delete failed', type: 'error', visible: true });
    }
  };

  const startEdit = (g) => setEditing({ id: g.id, key: g.key, name: g.name || '', description: g.description || '' });

  const saveEdit = async () => {
    if (!editing || !editing.id) return;
    try {
      const res = await apiCall('/api/admin/permission-groups', { method: 'PUT', body: JSON.stringify(editing) });
      if (!res.ok) throw new Error('Failed to update');
      const json = await res.json();
      setGroups(prev => prev.map(g => (g.id === json.data.id ? json.data : g)));
      setEditing(null);
      setToast({ message: 'Group updated', type: 'info', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Update failed', type: 'error', visible: true });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID' },
    { field: 'key', headerName: 'Key' },
    { field: 'name', headerName: 'Name', render: (r) => r.name || '-' },
    {
      field: 'description',
      headerName: 'Description',
      render: (r) => (
        <div className="max-w-xs truncate overflow-hidden whitespace-nowrap" title={r.description || ''}>
          {r.description || '-'}
        </div>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', render: (r) => (
        <div className="flex items-center gap-2">
          <PermissionGate requiredPermissions={"permission-groups.update"} disableOnDenied>
            <IconButton aria-label={`edit-${r.id}`} size="small" onClick={() => startEdit(r)} className="text-blue-600">
              <EditIcon fontSize="small" />
            </IconButton>
          </PermissionGate>

          <PermissionGate requiredPermissions={"permission-groups.delete"} disableOnDenied>
            <IconButton aria-label={`delete-${r.id}`} size="small" onClick={() => handleDelete(r.id)} className="text-red-600">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <SearchField
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search groups..."
                showAdornment={false}
                endAdornment={(
                  <IconButton
                    type="submit"
                    size="small"
                    color="primary"
                    className="bg-blue-600 text-white rounded-md"
                    aria-label="search"
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                )}
              />
            </div>

            <div className="flex items-center">
              <PageFilter perPage={perPage} onChange={handlePerPageChange} />
            </div>
          </div>
        </form>

        <div className="w-full sm:w-auto">
          <PermissionGate requiredPermissions={"permission-groups.create"} disableOnDenied>
            <button type="button" onClick={() => setCreateOpen(true)} className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm sm:text-base">Create Group</button>
          </PermissionGate>
        </div>
      </div>

      <div className="mb-4 text-sm text-zinc-600">Showing {groups.length} of {total} groups</div>

      <DataTable columns={columns} rows={groups} loading={loading} />

      {hasMore && (
        <div className="mt-6 text-center">
          <button onClick={handleLoadMore} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md">{loading ? 'Loading...' : 'Load More'}</button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-medium mb-4 text-zinc-900">Edit Group</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-700">Key</label>
              <input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" />
              <label className="text-sm text-zinc-700">Name</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" />
              <label className="text-sm text-zinc-700">Description</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded-md">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-md shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-zinc-900">Create Group</h3>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-zinc-700 block mb-1">Key *</label>
                <input value={newKey} onChange={(e) => setNewKey(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" required />
              </div>
              <div>
                <label className="text-sm text-zinc-700 block mb-1">Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" />
              </div>
              <div>
                <label className="text-sm text-zinc-700 block mb-1">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900" />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded-md">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded-md">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false, confirm: null })} />
    </div>
  );
}
