"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../../lib/context/auth-context";
import SearchField from '../../../../../components/ui/SearchField.jsx';
import PageFilter from '../../../../../components/ui/PageFilter.jsx';
import DataTable from '../../../../../components/ui/DataTable.jsx';
import Toast from '../../../../../components/ui/Toast.jsx';
import SelectField from '../../../../../components/ui/SelectField.jsx';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

export default function PermissionsTab() {
  const { apiCall } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [groupFilter, setGroupFilter] = useState(null);
  const [perPage, setPerPage] = useState(25);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  const [creating, setCreating] = useState(false);
  const [newItems, setNewItems] = useState([{ key: '', name: '', groupId: null }]);
  const [createOpen, setCreateOpen] = useState(false);

  const [editing, setEditing] = useState(null); // { id, key, name }
  const [groups, setGroups] = useState([]);

  const fetchPermissions = useCallback(async (cursor = null, searchTerm = '', groupId = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('perPage', perPage.toString());
      if (cursor) params.append('cursor', cursor.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (groupId) params.append('groupId', groupId.toString());

      const res = await apiCall(`/api/admin/permissions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch permissions');
      const json = await res.json();

      const items = json.data.permissions || [];
      if (cursor) {
        setPermissions(prev => [...prev, ...items]);
      } else {
        setPermissions(items);
      }

      setNextCursor(json.data.pagination.nextCursor);
      setHasMore(json.data.pagination.hasMore);
      setTotal(json.data.pagination.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load permissions', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  }, [apiCall, perPage]);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await apiCall('/api/admin/permission-groups');
      if (!res.ok) throw new Error('Failed to fetch permission groups');
      const json = await res.json();
      const items = (json?.data && (json.data.permissionGroups || json.data.groups || json.data)) || [];
      setGroups(items);
    } catch (err) {
      console.error(err);
      // silent; not critical for permissions list
    }
  }, [apiCall]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);
  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPermissions([]);
    setNextCursor(null);
    fetchPermissions(null, searchInput, groupFilter);
  };

  const handleLoadMore = () => {
    if (nextCursor && !loading) fetchPermissions(nextCursor, search, groupFilter);
  };

  const handlePerPageChange = (n) => {
    setPermissions([]);
    setNextCursor(null);
    setPerPage(n);
  };

  const handleGroupFilterChange = (id) => {
    setGroupFilter(id);
    setPermissions([]);
    setNextCursor(null);
    fetchPermissions(null, search, id);
  };

  const handleCreateSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const toCreate = (newItems || []).filter(it => it.key && it.key.trim());
    if (!toCreate.length) {
      setToast({ message: 'At least one Key is required', type: 'error', visible: true });
      return;
    }
    try {
      setCreating(true);
      // Send as bulk create (single request)
      const res = await apiCall('/api/admin/permissions', {
        method: 'POST',
        body: JSON.stringify(toCreate),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to create permissions');
      }
      const json = await res.json();
      const createdItems = (json?.data && (json.data.permissions || json.data)) || [];
      if (createdItems.length) setPermissions(prev => [...createdItems, ...prev]);
      setNewItems([{ key: '', name: '', groupId: null }]);
      setCreateOpen(false);
      setToast({ message: `${createdItems.length} permission(s) created`, type: 'info', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Create failed', type: 'error', visible: true });
    } finally {
      setCreating(false);
    }
  };

  const addNewRow = () => setNewItems(prev => [...prev, { key: '', name: '', groupId: null }]);
  const removeRow = (idx) => setNewItems(prev => {
    if (!Array.isArray(prev) || prev.length === 0) return [{ key: '', name: '', groupId: null }];
    if (prev.length === 1) {
      // if only one row left, reset it instead of removing
      return [{ key: '', name: '', groupId: null }];
    }
    return prev.filter((_, i) => i !== idx);
  });
  const updateRow = (idx, field, value) => setNewItems(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

  const openDeleteConfirm = (id, name) => setDeleteConfirm({ open: true, id, name });

  const handleDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    try {
      const res = await apiCall(`/api/admin/permissions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete permission');
      await res.json();
      setPermissions(prev => prev.filter(p => p.id !== id));
      setToast({ message: 'Permission deleted', type: 'info', visible: true });
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Delete failed', type: 'error', visible: true });
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  const startEdit = (p) => setEditing({ id: p.id, key: p.key, name: p.name || '' });

  // when starting edit, include groupId if present
  const startEditWithGroup = (p) => setEditing({ id: p.id, key: p.key, name: p.name || '', groupId: p.group ? p.group.id : null });

  const saveEdit = async () => {
    if (!editing || !editing.id) return;
    try {
      const res = await apiCall('/api/admin/permissions', { method: 'PUT', body: JSON.stringify(editing) });
      if (!res.ok) throw new Error('Failed to update');
      const json = await res.json();
      setPermissions(prev => prev.map(p => (p.id === json.data.id ? json.data : p)));
      setEditing(null);
      setToast({ message: 'Permission updated', type: 'info', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Update failed', type: 'error', visible: true });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID' },
    { field: 'key', headerName: 'Key' },
    { field: 'name', headerName: 'Name', render: (r) => r.name || '-' },
    { field: 'group', headerName: 'Group', render: (r) => (r.group ? r.group.name : '-') },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <IconButton aria-label={`edit-${r.id}`} size="small" onClick={() => startEditWithGroup(r)} className="text-blue-600">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label={`delete-${r.id}`} size="small" onClick={() => openDeleteConfirm(r.id, r.key || r.name)} className="text-red-600">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="flex-1">
              <SearchField 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                placeholder="Search permissions..." 
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

            <div className="flex items-center gap-2">
              <PageFilter perPage={perPage} onChange={handlePerPageChange} />
              <SelectField
                value={groupFilter}
                onChange={(v) => handleGroupFilterChange(v)}
                options={groups}
                emptyOptionLabel="All groups"
                className="px-2 sm:px-3 py-2 border rounded-md text-zinc-900 text-sm"
              />
            </div>
          </div>
        </form>

        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm sm:text-base"
          >
            Create Permission
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-zinc-600">Showing {permissions.length} of {total} permissions</div>

      <DataTable columns={columns} rows={permissions} loading={loading} />

      {hasMore && (
        <div className="mt-6 text-center">
          <button onClick={handleLoadMore} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md">{loading ? 'Loading...' : 'Load More'}</button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-xl">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-zinc-900">Edit Permission</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-zinc-700">Key</label>
              <input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900 placeholder:text-zinc-400" />
              <label className="text-sm text-zinc-700">Name</label>
              <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900 placeholder:text-zinc-400" />
              <label className="text-sm text-zinc-700">Group</label>
              <SelectField
                value={editing.groupId}
                onChange={(v) => setEditing({ ...editing, groupId: v })}
                options={groups}
                emptyOptionLabel="- none -"
                className="w-full px-3 py-2 border rounded-md text-zinc-900"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded-md hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-zinc-900">Create Permission</h3>
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                {newItems.map((it, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-end border-b sm:border-0 pb-3 sm:pb-0">
                    <div className="col-span-4">
                      <label className="text-sm text-zinc-700 block mb-1">Key *</label>
                      <input
                        value={it.key}
                        onChange={(e) => updateRow(idx, 'key', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900 placeholder:text-zinc-400"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="text-sm text-zinc-700 block mb-1">Name</label>
                      <input
                        value={it.name}
                        onChange={(e) => updateRow(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md bg-white text-zinc-900 placeholder:text-zinc-400"
                      />
                    </div>
                    <div className="col-span-4 flex gap-2 items-center">
                      <SelectField
                        value={it.groupId}
                        onChange={(v) => updateRow(idx, 'groupId', v)}
                        options={groups}
                        emptyOptionLabel="- none -"
                        className="w-full px-3 py-2 border rounded-md text-zinc-900"
                      />
                      <IconButton size="small" aria-label={`remove-${idx}`} onClick={() => removeRow(idx)} className="text-red-600">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <button type="button" onClick={addNewRow} className="text-sm text-blue-600">+ Add row</button>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded-md hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300">Cancel</button>
                <button type="submit" disabled={creating} className="px-4 py-2 bg-green-600 text-white rounded-md">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4 text-zinc-900">Confirm Delete</h3>
            <p className="text-sm text-zinc-700">Are you sure you want to delete permission &quot;{deleteConfirm.name}&quot;?</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })} className="px-4 py-2 bg-zinc-200 text-zinc-900 rounded-md hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300">Cancel</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">Delete Permission</button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  );
}
