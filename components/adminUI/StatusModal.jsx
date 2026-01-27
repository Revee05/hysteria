import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * StatusModal - Modal for creating or editing user statuses
 * @param {boolean} open - Whether the modal is open
 * @param {string} mode - 'create' or 'edit'
 * @param {object} formData - Form data object with key, name, description
 * @param {function} setFormData - Function to update form data
 * @param {function} onClose - Function to close the modal
 * @param {function} onSubmit - Function to handle form submission
 * @param {boolean} loading - Whether the form is submitting
 */
export default function StatusModal({
  open,
  mode = 'create',
  formData,
  setFormData,
  onClose,
  onSubmit,
  loading,
}) {
  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const isCreate = mode === 'create';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isCreate ? 'Create New Status' : 'Edit Status'}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Status Key"
              placeholder="e.g., ACTIVE, SUSPENDED, BANNED"
              value={formData.key || ''}
              onChange={handleChange('key')}
              required
              disabled={loading}
              helperText="Unique identifier (uppercase, no spaces)"
              inputProps={{ 
                style: { textTransform: 'uppercase' },
                maxLength: 50 
              }}
            />

            <TextField
              fullWidth
              label="Status Name"
              placeholder="e.g., Active, Suspended, Banned"
              value={formData.name || ''}
              onChange={handleChange('name')}
              required
              disabled={loading}
              helperText="Display name for the status"
              inputProps={{ maxLength: 255 }}
            />

            <TextField
              fullWidth
              label="Description"
              placeholder="Optional description of the status"
              value={formData.description || ''}
              onChange={handleChange('description')}
              multiline
              rows={3}
              disabled={loading}
              helperText="Optional detailed description"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose} 
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {isCreate ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
