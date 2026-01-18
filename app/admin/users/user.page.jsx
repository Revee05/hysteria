"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/context/auth-context";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchField from '../../../components/ui/SearchField.jsx';
import PageFilter from '../../../components/ui/PageFilter.jsx';
import DataTable from '../../../components/ui/DataTable.jsx';

export default function Users() {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Filter state
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async (cursor = null, searchTerm = "") => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('perPage', perPage.toString());
      if (cursor) params.append('cursor', cursor.toString());
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiCall(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      
      if (cursor) {
        // Append to existing users (load more)
        setUsers(prev => [...prev, ...result.data.users]);
      } else {
        // Replace users (new search or initial load)
        setUsers(result.data.users);
      }
      
      setNextCursor(result.data.pagination.nextCursor);
      setHasMore(result.data.pagination.hasMore);
      setTotal(result.data.pagination.total);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, perPage]);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchUsers(null, searchInput);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      fetchUsers(nextCursor, search);
    }
  };

  // Handle per page change
  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setUsers([]);
    setNextCursor(null);
    // Trigger refetch in next render
    setTimeout(() => fetchUsers(null, search), 0);
  };

  // Handle delete user
  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      return;
    }

    try {
      const response = await apiCall(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from list
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotal(prev => prev - 1);
      
      alert('User deleted successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Users Management</h1>
        <p className="text-sm text-zinc-600 mt-1">Manage all users in the system</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="flex gap-2">
            <SearchField
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by email or name..."
              className="flex-1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  fetchUsers(null, "");
                }}
                className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-md hover:bg-zinc-300"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Per Page Filter */}
        <div className="flex items-center gap-2">
          <PageFilter perPage={perPage} onChange={handlePerPageChange} />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 text-sm text-zinc-600">
        Showing {users.length} of {total} users
        {search && <span className="ml-1">(filtered by &quot;{search}&quot;)</span>}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={[
          { field: 'id', headerName: 'ID' },
          { field: 'email', headerName: 'Email' },
          { field: 'name', headerName: 'Name', render: (r) => r.name || '-' },
          {
            field: 'status',
            headerName: 'Status',
            render: (r) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                r.status?.key === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : r.status?.key === 'SUSPENDED'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {r.status?.name || r.status?.key || 'Unknown'}
              </span>
            ),
          },
          { field: 'roles', headerName: 'Roles', render: (r) => (r.roles?.map(ur => ur.role.name || ur.role.key).join(', ') || '-') },
          { field: 'lastLoginAt', headerName: 'Last Login', render: (r) => (
            r.lastLoginAt
              ? new Date(r.lastLoginAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Never'
          )},
          {
            field: 'actions',
            headerName: 'Actions',
            render: (r) => (
              <div className="flex items-center gap-2">
                <IconButton aria-label={`edit-${r.id}`} size="small" onClick={() => alert(`Edit user ${r.id} - Not implemented yet`)} className="text-blue-600">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton aria-label={`delete-${r.id}`} size="small" onClick={() => handleDelete(r.id, r.email)} className="text-red-600">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </div>
            ),
          },
        ]}
        rows={users}
        loading={loading}
      />

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
