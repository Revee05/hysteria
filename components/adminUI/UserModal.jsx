"use client";

import React from "react";
import EmailField from "../ui/EmailField.jsx";
import PasswordField from "../ui/PasswordField.jsx";
import TextField from '@mui/material/TextField';

export default function UserModal({ open, mode = 'create', formData, setFormData, onClose, onSubmit, loading }) {
  if (!open) return null;

  const title = mode === 'create' ? 'Create New User' : 'Edit User';
  const submitLabel = mode === 'create' ? 'Create' : 'Save';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg">
        <h3 className="text-lg font-medium mb-4 text-zinc-900">{title}</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <EmailField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <PasswordField
              label={`Password ${mode === 'create' ? '*' : '(leave empty to keep current)'}`}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={mode === 'create' ? '' : 'Leave empty to keep current password'}
              required={mode === 'create'}
            />
          </div>

          <div>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              variant="outlined"
              size="small"
              required
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-200 text-zinc-800 rounded-md hover:bg-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (mode === 'create' ? 'Creating...' : 'Saving...') : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
