"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../lib/context/auth-context";
import PermissionGate from '../../../../components/adminUI/PermissionGate.jsx';
import SearchField from '../../../../components/adminUI/SearchField.jsx';
import DataTable from '../../../../components/ui/DataTable.jsx';
import { useDialog } from '../../../../components/ui/DynamicDialogModals.jsx';
import Toast from '../../../../components/ui/Toast.jsx';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import StatusModal from '../../../../components/adminUI/StatusModal.jsx';

export default function StatusManagement() {
  const { apiCall } = useAuth();
  const open = useDialog();
  const [statuses, setStatuses] = useState([]);
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
  });
  const [editingStatus, setEditingStatus] = useState(null);

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/user-statuses');
      if (!res.ok) throw new Error('Failed to fetch statuses');
      const json = await res.json();

      const items = json.data.statuses || [];
      setStatuses(items);
      setFilteredStatuses(items);
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Failed to load statuses', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { 
    fetchStatuses(); 
  }, [fetchStatuses]);

  // Filter statuses based on search
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredStatuses(statuses);
    } else {
      const searchLower = searchInput.toLowerCase();
      const filtered = statuses.filter(status => 
        status.key?.toLowerCase().includes(searchLower) ||
        status.name?.toLowerCase().includes(searchLower) ||
        status.description?.toLowerCase().includes(searchLower)
      );
      setFilteredStatuses(filtered);
    }
  }, [searchInput, statuses]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.key || !formData.name) {
      setToast({ message: 'Key and name are required', type: 'error', visible: true });
      return;
    }
    try {
      setLoading(true);
      const res = await apiCall('/api/admin/user-statuses', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to create status');
      }
      const json = await res.json();
      setStatuses(prev => [...prev, json.data]);
      setFormData({ key: '', name: '', description: '' });
      setShowCreateModal(false);
      setToast({ message: 'Status created successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Create failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingStatus) return;
    try {
      setLoading(true);
      const updateData = {
        id: editingStatus.id,
        key: formData.key,
        name: formData.name,
        description: formData.description,
      };
      
      const res = await apiCall('/api/admin/user-statuses', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to update status');
      }
      const json = await res.json();
      setStatuses(prev => prev.map(s => s.id === json.data.id ? json.data : s));
      setShowEditModal(false);
      setEditingStatus(null);
      setToast({ message: 'Status updated successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Update failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (status) => {
    if (!confirm(`Are you sure to delete status "${status.name}"?\n\nThis action cannot be undone.`)) return;
    try {
      setLoading(true);
      const res = await apiCall(`/api/admin/user-statuses?id=${status.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to delete status');
      }
      setStatuses(prev => prev.filter(s => s.id !== status.id));
      setToast({ message: 'Status deleted successfully', type: 'success', visible: true });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Delete failed', type: 'error', visible: true });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (status) => {
    setEditingStatus(status);
    setFormData({
      key: status.key,
      name: status.name || '',
      description: status.description || '',
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    setFormData({ key: '', name: '', description: '' });
    setShowCreateModal(true);
  };

  const columns = [
    { field: 'id', headerName: 'ID', freeze: true },
    { 
      field: 'key', 
      headerName: 'Key', 
      render: (r) => (
        <span className="font-mono font-semibold text-zinc-900">{r.key}</span>
      ),
      freeze: true 
    },
    { field: 'name', headerName: 'Name', freeze: true },
    { 
      field: 'description', 
      headerName: 'Description',
      render: (r) => (
        <span className="text-sm text-zinc-600">
          {r.description || '-'}
        </span>
      ),
    },
    {
      field: 'userCount',
      headerName: 'Users',
      render: (r) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {r._count?.users || 0}
        </span>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      render: (r) => (
        <span className="text-sm text-zinc-700">
          {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      render: (r) => (
        <div className="flex gap-1 justify-center">
          <PermissionGate requiredPermissions={"status.update"} disableOnDenied>
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); openEditModal(r); }} 
              className="text-blue-600"
              title="Edit status"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </PermissionGate>

          <PermissionGate requiredPermissions={"status.delete"} disableOnDenied>
            <IconButton 
              size="small" 
              onClick={(e) => { e.stopPropagation(); handleDelete(r); }} 
              className="text-red-600"
              title="Delete status"
              disabled={r._count?.users > 0}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </PermissionGate>
        </div>
      ),
    },
  ];

  const handleRowClick = async (row) => {
    await open({
      title: row.name || row.key,
      content: ({ onClose }) => (
        <div className="space-y-4 text-sm text-zinc-800">
          <div className="space-y-2">
            <div>
              <strong>Key:</strong> 
              <span className="ml-2 font-mono bg-zinc-100 px-2 py-1 rounded">{row.key}</span>
            </div>
            <div><strong>Name:</strong> {row.name || '-'}</div>
            <div><strong>Description:</strong> {row.description || '-'}</div>
            <div>
              <strong>Users with this status:</strong> 
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {row._count?.users || 0}
              </span>
            </div>
            <div>
              <strong>Created at:</strong> 
              {row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}
            </div>
          </div>
        </div>
      ),
      footer: ({ onClose }) => (
        <div className="flex justify-end gap-2">
          <PermissionGate requiredPermissions={"status.update"}>
            <button 
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" 
              onClick={() => {
                onClose();
                openEditModal(row);
              }}
            >
              Edit
            </button>
          </PermissionGate>
          <button className="px-3 py-1 text-sm" onClick={onClose}>Close</button>
        </div>
      ),
      size: 'md',
    });
  };

  return (
    <PermissionGate requiredPermissions={["status.get"]}>
      <div className="mx-4 sm:mx-6 lg:mx-12 p-6 bg-white rounded-lg shadow-sm max-w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-zinc-900">User Status Management</h1>
          <p className="text-sm text-zinc-600 mt-1">Manage available user statuses for the system</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <SearchField 
                value={searchInput} 
                onChange={(e) => setSearchInput(e.target.value)} 
                placeholder="Search by key, name, or description..." 
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
            </div>
          </form>

          <PermissionGate requiredPermissions={"status.create"} disableOnDenied>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              Create Status
            </Button>
          </PermissionGate>
        </div>

        <div className="mb-4 text-sm text-zinc-600">
          Showing {filteredStatuses.length} of {statuses.length} statuses
        </div>
        
        <div className="max-w-full overflow-auto">
          <DataTable 
            columns={columns} 
            rows={filteredStatuses} 
            loading={loading} 
            onRowClick={handleRowClick} 
          />
        </div>

        <StatusModal
          open={showCreateModal}
          mode="create"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          loading={loading}
        />

        <StatusModal
          open={showEditModal}
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onClose={() => { setShowEditModal(false); setEditingStatus(null); }}
          onSubmit={handleUpdate}
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
