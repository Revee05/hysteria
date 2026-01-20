"use client";

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../../lib/context/auth-context'
import DataTable from '../../../../../components/ui/DataTable.jsx'
import Toast from '../../../../../components/ui/Toast.jsx'
import SelectField from '../../../../../components/ui/SelectField.jsx'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'

export default function RolePermissionsTab() {
  const { apiCall } = useAuth()
  const [roleId, setRoleId] = useState('')
  const [roles, setRoles] = useState([])
  const [groups, setGroups] = useState([])
  const [groupFilter, setGroupFilter] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [assigned, setAssigned] = useState(new Set())
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })

  // Load roles on mount
  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await apiCall('/api/admin/roles?perPage=25')
        if (!res.ok) throw new Error('Failed to fetch roles')
        const json = await res.json()
        setRoles((json.data.roles || []).filter(r => r && r.key !== 'SUPERADMIN'))
      } catch (err) {
        console.error(err)
        setToast({ message: 'Failed to load roles', type: 'error', visible: true })
      }
    }
    loadRoles()
  }, [apiCall])

  // Load permission groups on mount
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await apiCall('/api/admin/permission-groups')
        if (!res.ok) throw new Error('Failed to fetch groups')
        const json = await res.json()
        const items = json.data.groups || json.data.permissionGroups || json.data || []
        setGroups(items)
      } catch (err) {
        console.error(err)
        setToast({ message: 'Failed to load groups', type: 'error', visible: true })
      }
    }
    loadGroups()
  }, [apiCall])

  // Load permissions when roleId changes
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [rRes, pRes] = await Promise.all([
          apiCall(`/api/admin/roles/${roleId}/permissions`),
          apiCall(`/api/admin/permissions?perPage=200${groupFilter ? `&groupId=${groupFilter}` : ''}`),
        ])
        const rJson = await rRes.json()
        const pJson = await pRes.json()
        setPermissions(rJson.data.permissions || [])
        // server already filters if groupFilter provided; otherwise use what was returned
        setAllPermissions(pJson.data.permissions || [])
        setAssigned(new Set((rJson.data.permissions || []).map(p => p.id)))
      } catch (err) {
        console.error(err)
        setToast({ message: 'Failed to load', type: 'error', visible: true })
      } finally {
        setLoading(false)
      }
    }
    if (roleId) load()
  }, [apiCall, roleId, groupFilter])

  const toggle = (id) => {
    const s = new Set(assigned)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    setAssigned(s)
  }

  const visibleIds = allPermissions.map(p => p.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => assigned.has(id))
  const someSelected = visibleIds.some(id => assigned.has(id))

  const toggleAll = () => {
    const s = new Set(assigned)
    if (allSelected) {
      visibleIds.forEach(id => s.delete(id))
    } else {
      visibleIds.forEach(id => s.add(id))
    }
    setAssigned(s)
  }

  const save = async () => {
    if (!roleId) {
      setToast({ message: 'Please select a role', type: 'error', visible: true })
      return
    }
    try {
      setLoading(true)
      const permissionIds = Array.from(assigned)
      const res = await apiCall(`/api/admin/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permissionIds }) })
      if (!res.ok) throw new Error('Save failed')
      setToast({ message: 'Saved', type: 'info', visible: true })
    } catch (err) {
      console.error(err)
      setToast({ message: err.message || 'Save failed', type: 'error', visible: true })
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { field: 'id', headerName: 'ID' },
    { field: 'key', headerName: 'Key' },
    { field: 'name', headerName: 'Name', render: (r) => r.name || '-' },
    { field: 'assigned', headerName: 'Assigned', headerAlign: 'center', align: 'center', headerClassName: 'px-6 py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider', className: 'px-6 py-4 whitespace-nowrap text-sm text-zinc-900 text-center', render: (r) => (
        <div className="flex items-center justify-center h-full w-full">
          <input type="checkbox" checked={assigned.has(r.id)} onChange={() => toggle(r.id)} disabled={!roleId} />
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 max-w-md flex items-center gap-3">
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel id="role-select-label">Select Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={roleId}
                label="Select Role"
                onChange={(e) => setRoleId(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- Select a role --</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="w-56">
            <SelectField
              value={groupFilter}
              onChange={(v) => setGroupFilter(v)}
              options={groups}
              emptyOptionLabel="All groups"
              // label="Group"
              minWidth={160}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FormControlLabel
            control={(
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
                disabled={!roleId || visibleIds.length === 0}
                size="small"
              />
            )}
            label={<span className="text-sm text-zinc-700 font-medium">Select all</span>}
          />
          <Button variant="contained" color="primary" onClick={save} disabled={loading || !roleId}>
            Save
          </Button>
        </div>
      </div>

      {roleId ? (
        <>
          <div className="mb-4 text-sm text-zinc-600">
            Managing permissions for: <strong>{roles.find(r => r.id === roleId)?.name || roleId}</strong>
          </div>
          <DataTable columns={columns} rows={allPermissions} loading={loading} />
        </>
      ) : (
        <div className="text-center py-12 text-zinc-500">
          Please select a role to manage its permissions
        </div>
      )}

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  )
}
