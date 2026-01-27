import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import SelectField from '../ui/SelectField';

/**
 * Modal for changing user status with reason
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {Object} props.user - User object to change status for
 * @param {Array} props.availableStatuses - List of available statuses
 * @param {number} props.selectedStatusId - Currently selected status ID
 * @param {Function} props.setSelectedStatusId - Function to update selected status
 * @param {string} props.reason - Reason for status change
 * @param {Function} props.setReason - Function to update reason
 * @param {Function} props.onClose - Function to close modal
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {boolean} props.loading - Whether form is submitting
 */
export default function ChangeStatusModal({
  open,
  user,
  availableStatuses,
  selectedStatusId,
  setSelectedStatusId,
  reason,
  setReason,
  onClose,
  onSubmit,
  loading = false,
}) {
  const currentStatus = user?.status;
  const selectedStatus = availableStatuses.find(s => s.id === selectedStatusId);
  const isStatusChanged = selectedStatusId && selectedStatusId !== currentStatus?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        className: "rounded-lg"
      }}
    >
      <DialogTitle className="text-xl font-semibold text-zinc-900 border-b">
        Change User Status
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent className="mt-4 space-y-4 p-6">
          {user && (
            <div className="bg-zinc-50 p-4 rounded-lg space-y-2">
              <div className="text-sm">
                <span className="font-medium text-zinc-700">Name: </span>{' '}
                <span className="text-zinc-900">{user.name || user.email}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-zinc-700">Current Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentStatus?.key === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : currentStatus?.key === 'SUSPEND'
                    ? 'bg-yellow-100 text-yellow-700'
                    : currentStatus?.key === 'BANNED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {currentStatus?.name || 'Unknown'}
                </span>
              </div>
            </div>
          )}

          <SelectField
            className="mt-2"
            label="New Status"
            value={selectedStatusId ?? ''}
            onChange={(v) => setSelectedStatusId(v ? Number(v) : null)}
            required
            disabled={loading}
            options={availableStatuses.map(status => ({
              id: status.id,
              name: `${status.name} ${status.id === currentStatus?.id ? '(Current)' : ''}`,
              description: status.description,
            }))}
            optionValueKey="id"
            optionLabelKey="name"
          />

          {isStatusChanged && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium mb-2">
                ⚠️ Status Change Confirmation
              </p>
              <p className="text-xs text-blue-700">
                You are about to change this user&apos;s status from{' '}
                <strong>{currentStatus?.name}</strong> to{' '}
                <strong>{selectedStatus?.name}</strong>.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                This will invalidate all existing user sessions.
              </p>
            </div>
          )}

          <TextField
            label="Reason for Status Change"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            multiline
            rows={4}
            fullWidth
            disabled={loading}
            placeholder="Provide a detailed reason for this status change..."
            helperText="This will be recorded in the status history"
            variant="outlined"
            className="mt-4"
            inputProps={{
              maxLength: 500,
            }}
          />
          <div className="text-xs text-zinc-500 text-right mt-2">
            {reason.length}/500 characters
          </div>
        </DialogContent>

        <DialogActions className="border-t px-6 py-6">
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !isStatusChanged || !reason.trim()}
            variant="contained"
            color="primary"
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Changing Status...' : 'Change Status'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
