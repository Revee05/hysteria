"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../lib/context/auth-context";
import PermissionGate from '../../../../components/adminUI/PermissionGate.jsx';
import SearchField from '../../../../components/adminUI/SearchField.jsx';
import DataTable from '../../../../components/ui/DataTable.jsx';
import { useDialog } from '../../../../components/ui/DynamicDialogModals.jsx';
import Toast from '../../../../components/ui/Toast.jsx';
import PageFilter from '../../../../components/ui/PageFilter.jsx';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SearchIcon from '@mui/icons-material/Search';
import UserModal from '../../../../components/adminUI/UserModal.jsx';
import ManageRolesModal from '../../../../components/adminUI/ManageRolesModal.jsx';
import ChangeStatusModal from '../../../../components/adminUI/ChangeStatusModal.jsx';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export default function UserManagement() {
  const auth = useAuth();
  const { apiCall, user: currentUser } = auth;
  const open = useDialog();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [perPage, setPerPage] = useState(25);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    statusId: undefined,
  });
  const [editingUser, setEditingUser] = useState(null);
  const [roleUser, setRoleUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState(new Set());
  
  // Status change state
  const [statusUser, setStatusUser] = useState(null);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [statusReason, setStatusReason] = useState('');

  const normalizeKey = (k) => (k || '').toString().replace(/[_\s-]/g, '').toUpperCase();
  const isSuperAdminUser = (user) => {
    const roles = user?.roles || [];
    return roles.some(ur => normalizeKey(ur.role?.key || ur.key) === 'SUPERADMIN');
  };

  const isCurrentSuperAdmin = () => {
    const roles = currentUser?.roles || [];
    // roles might be array of strings or objects
    return roles.some(r => {
      if (!r) return false;
      if (typeof r === 'string') return normalizeKey(r) === 'SUPERADMIN';
      // object shape might be { role: { key } } or { key }
      const key = r.role?.key || r.key || r;
      return normalizeKey(key) === 'SUPERADMIN';
    });
  };

  const fetchUsers = useCallback(async (cursor = null, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('perPage', perPage.toString());
      if (cursor) params.append('cursor', cursor.toString());
      if (searchTerm) params.append('search', searchTerm);

      const res = await apiCall(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const json = await res.json();

      const items = json.data.users || [];
      if (cursor) {
        setUsers(prev => [...prev, ...items]);
      } else {
        setUsers(items);
      }

      setNextCursor(json.data.pagination.nextCursor);
      setHasMore(json.data.pagination.hasMore);
      setTotal(json.data.pagination.total || 0);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load users', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  }, [apiCall, perPage]);

  useEffect(() => { 
    fetchUsers(); 
  }, [fetchUsers]);

  const handlePerPageChange = (value) => {
    setPerPage(value);
    setUsers([]);
    setNextCursor(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setUsers([]);
    setNextCursor(null);
    fetchUsers(null, searchInput);
  };

  const handleLoadMore = () => {
    if (nextCursor && !loading) fetchUsers(nextCursor, search);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setToast({ message: 'Email, password, and name are required', type: 'error', visible: true });
      return;
    }
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create user');
      }
      const json = await res.json();
      setUsers(prev => [json.data, ...prev]);
      setFormData({ email: '', password: '', name: '', statusId: undefined });
      setShowCreateModal(false);
      setToast({ message: 'User created successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Create failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setLoading(true);
      const updateData = {
        id: editingUser.id,
        email: formData.email,
        name: formData.name,
        statusId: formData.statusId,
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const res = await apiCall('/api/admin/users', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to update user');
      }
      const json = await res.json();
      setUsers(prev => prev.map(u => u.id === json.data.id ? json.data : u));
      setShowEditModal(false);
      setEditingUser(null);
      setToast({ message: 'User updated successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Update failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    // Prevent deleting SUPERADMIN users
    if (isSuperAdminUser(user)) {
      setToast({ message: 'Cannot delete Super Admin users', type: 'error', visible: true });
      return;
    }

    if (!confirm(`Are you sure to delete user "${user.name}"?`)) return;
    try {
      setLoading(true);
      const res = await apiCall(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setToast({ message: 'User deleted successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Delete failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    // Prevent non-SUPERADMINs from editing SUPERADMIN users
    if (isSuperAdminUser(user) && !isCurrentSuperAdmin()) {
      setToast({ message: 'Only Super Admin can edit Super Admin users', type: 'error', visible: true });
      return;
    }
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name || '',
      statusId: user.status?.id ?? undefined,
    });
    setShowEditModal(true);
  };

  const openRoleModal = async (user) => {
    // Prevent changing roles for SUPERADMIN users
    if (isSuperAdminUser(user)) {
      setToast({ message: 'Cannot change roles for Super Admin users', type: 'error', visible: true });
      return;
    }

    setRoleUser(user);
    setLoading(true);
    try {
      // Fetch user roles and available roles in parallel
      const [rolesRes, availableRes] = await Promise.all([
        apiCall(`/api/admin/users/${user.id}/roles`),
        apiCall('/api/admin/roles')
      ]);
      
      if (!rolesRes.ok || !availableRes.ok) throw new Error('Failed to fetch roles');
      
      const rolesJson = await rolesRes.json();
      const availableJson = await availableRes.json();
      
      setUserRoles(rolesJson.data.roles || []);

      // Filter out any SUPERADMIN variant from available roles so it cannot
      // be assigned/changed via the UI. Keep selectedRoles intact (if user
      // already has SUPERADMIN it will remain selected but not togglable).
      const allAvailable = availableJson.data.roles || [];
      const filteredAvailable = allAvailable.filter(r => normalizeKey(r.key || r.role?.key) !== 'SUPERADMIN');
      setAvailableRoles(filteredAvailable);
      
      const assignedRoleIds = new Set((rolesJson.data.roles || []).map(r => r.roleId));
      setSelectedRoles(assignedRoleIds);
      
      setShowRoleModal(true);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load roles', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!roleUser) return;
    try {
      setLoading(true);
      const roleIds = Array.from(selectedRoles);
      const res = await apiCall(`/api/admin/users/${roleUser.id}/roles`, {
        method: 'PUT',
        body: JSON.stringify({ roleIds }),
      });
      if (!res.ok) throw new Error('Failed to update roles');
      
      setShowRoleModal(false);
      setToast({ message: 'Roles updated successfully', type: 'success', visible: true });
      
      // Refresh user list to show updated roles
      fetchUsers(null, search);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to save roles', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId) => {
    const newSet = new Set(selectedRoles);
    if (newSet.has(roleId)) {
      newSet.delete(roleId);
    } else {
      newSet.add(roleId);
    }
    setSelectedRoles(newSet);
  };

  const openStatusModal = async (user) => {
    // Prevent changing status for SUPERADMIN users
    if (isSuperAdminUser(user)) {
      setToast({ message: 'Cannot change status for Super Admin users', type: 'error', visible: true });
      return;
    }

    setStatusUser(user);
    setSelectedStatusId(user.status?.id || null);
    setStatusReason('');
    
    // Fetch available statuses
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/user-statuses');
      if (!res.ok) throw new Error('Failed to fetch statuses');
      const json = await res.json();
      setAvailableStatuses(json.data.statuses || []);
      setShowStatusModal(true);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load statuses', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (e) => {
    e.preventDefault();
    if (!statusUser || !selectedStatusId || !statusReason.trim()) return;
    
    try {
      setLoading(true);
      const res = await apiCall(`/api/admin/users/${statusUser.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          statusId: selectedStatusId, 
          reason: statusReason.trim() 
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to update status');
      }
      
      setShowStatusModal(false);
      setToast({ message: 'User status updated successfully', type: 'success', visible: true });
      
      // Refresh user list
      fetchUsers(null, search);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to change status', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', freeze: true },
    { field: 'name', headerName: 'Name', render: (r) => r.name || '-',freeze: true },
    { field: 'email', headerName: 'Email', freeze: true },
    {
      field: 'status',
      headerName: 'Status',
      render: (r) => {
        const key = r.status?.key;
        const classes = key === 'ACTIVE'
          ? 'bg-green-100 text-green-700'
          : key === 'SUSPEND'
            ? 'bg-yellow-100 text-yellow-700'
            : key === 'BANNED'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700';

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
            {r.status?.name || '-'}
          </span>
        );
      }
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last Login',
      render: (r) => (
        <span className="text-sm text-zinc-700">
          {r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      field: 'roles',
      headerName: 'Roles',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.roles?.length > 0 ? (
            r.roles.map((ur, idx) => (
              <span key={idx} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {ur.role?.key}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No roles</span>
          )}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (r) => (
        <div className="grid grid-cols-2 gap-1 justify-items-center">
          <PermissionGate requiredPermissions={"user.status.update"} disableOnDenied>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); openStatusModal(r); }}
              className={isSuperAdminUser(r) ? 'text-gray-400' : 'text-orange-600'}
              title={isSuperAdminUser(r) ? 'Cannot change status for Super Admin' : 'Change status'}
              disabled={isSuperAdminUser(r)}
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </PermissionGate>

          <PermissionGate requiredPermissions={"users.roles.assign"} disableOnDenied>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); openRoleModal(r); }}
              className={isSuperAdminUser(r) ? 'text-gray-400' : 'text-purple-600'}
              title={isSuperAdminUser(r) ? 'Cannot change roles for Super Admin' : 'Manage roles'}
              disabled={isSuperAdminUser(r)}
            >
              <ManageAccountsIcon fontSize="small" />
            </IconButton>
          </PermissionGate>

          <PermissionGate requiredPermissions={"users.update"} disableOnDenied>
            {(() => {
              const cannotEditSuper = isSuperAdminUser(r) && !isCurrentSuperAdmin();
              return (
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); if (!cannotEditSuper) openEditModal(r); else setToast({ message: 'Only Super Admin can edit Super Admin users', type: 'error', visible: true }); }} 
                  className={cannotEditSuper ? 'text-gray-400' : 'text-blue-600'}
                  title={cannotEditSuper ? 'Only Super Admin can edit Super Admin users' : 'Edit user'}
                  disabled={cannotEditSuper}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              );
            })()}
          </PermissionGate>

          <PermissionGate requiredPermissions={"users.delete"} disableOnDenied>
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); if (!isSuperAdminUser(r)) handleDelete(r); }} 
              className={isSuperAdminUser(r) ? 'text-gray-400' : 'text-red-600'}
              title={isSuperAdminUser(r) ? 'Cannot delete Super Admin' : 'Delete user'}
              disabled={isSuperAdminUser(r)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </PermissionGate>
        </div>
      ),
    },
  ];

  const handleRowClick = async (row) => {
    // Fetch status history
    let statusHistory = [];
    try {
      const res = await apiCall(`/api/admin/users/${row.id}/status/history`);
      if (res.ok) {
        const json = await res.json();
        statusHistory = json.data.history || [];
      }
    } catch (err) {
      console.error('Failed to load status history:', err);
    }

    await open({
      title: row.name || row.email || 'User detail',
      content: ({ onClose }) => (
        <div className="space-y-4 text-sm text-zinc-800">
          <div className="space-y-2">
            <div><strong>Name:</strong> {row.name || '-'}</div>
            <div><strong>Email:</strong> {row.email || '-'}</div>
            <div><strong>Status:</strong> {row.status?.name || '-'}</div>
            <div><strong>Last login:</strong> {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : '-'}</div>
            <div><strong>Roles:</strong> {row.roles?.length ? row.roles.map(r => r.role?.key).join(', ') : 'No roles'}</div>
          </div>

          {statusHistory.length > 0 && (
            <div className="border-t pt-4">
              <div className="font-semibold mb-2">Status History:</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {statusHistory.map((history, idx) => (
                  <div key={idx} className="bg-zinc-50 p-3 rounded text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{history.status?.name}</span>
                      <span className="text-zinc-500">
                        {new Date(history.startAt).toLocaleDateString()}
                      </span>
                    </div>
                    {history.reason && (
                      <div className="text-zinc-600 italic mt-1">&quot;{history.reason}&quot;</div>
                    )}
                    {history.endAt && (
                      <div className="text-zinc-500 mt-1">
                        Ended: {new Date(history.endAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      footer: ({ onClose }) => (
        <div className="flex justify-end">
          <button className="px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>
      ),
      size: 'md',
    });
  };

  return (
    <PermissionGate requiredPermissions={["users.read"]}>
    <div className="mx-4 sm:mx-6 lg:mx-12 p-6 bg-white rounded-lg shadow-sm max-w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
        <p className="text-sm text-zinc-600 mt-1">Manage system users and their roles</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <SearchField 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              placeholder="Search by email or name..." 
              showAdornment={false}
              endAdornment={(
                <IconButton
                  type="submit"
                  size="small"
                  color="primary"
                  className="bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  aria-label="search"
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              )}
            />
            <div className="flex items-center">
              <PageFilter perPage={perPage} onChange={handlePerPageChange} />
            </div>
          </div>
        </form>

        <PermissionGate requiredPermissions={"users.create"} disableOnDenied>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </Button>
        </PermissionGate>
      </div>

      <div className="mb-4 text-sm text-zinc-600">
        Showing {users.length} of {total} users
      </div>
      <div className="max-w-full overflow-auto">
        <DataTable columns={columns} rows={users} loading={loading} onRowClick={handleRowClick} />
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button 
            onClick={handleLoadMore} 
            disabled={loading} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <UserModal
        open={showCreateModal}
        mode="create"
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        loading={loading}
      />

      <UserModal
        open={showEditModal}
        mode="edit"
        formData={formData}
        setFormData={setFormData}
        onClose={() => { setShowEditModal(false); setEditingUser(null); }}
        onSubmit={handleUpdate}
        loading={loading}
      />

      <ManageRolesModal
        open={showRoleModal}
        roleUser={roleUser}
        availableRoles={availableRoles}
        selectedRoles={selectedRoles}
        toggleRole={toggleRole}
        onClose={() => setShowRoleModal(false)}
        onSave={handleSaveRoles}
        loading={loading}
      />

      <ChangeStatusModal
        open={showStatusModal}
        user={statusUser}
        availableStatuses={availableStatuses}
        selectedStatusId={selectedStatusId}
        setSelectedStatusId={setSelectedStatusId}
        reason={statusReason}
        setReason={setStatusReason}
        onClose={() => setShowStatusModal(false)}
        onSubmit={handleChangeStatus}
        loading={loading}
      />

      <Toast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={() => setToast({ ...toast, visible: false })} 
      />
    </div>
    </PermissionGate>
  );
}
