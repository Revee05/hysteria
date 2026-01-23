"use client";

import React, { useEffect, useMemo, useState, startTransition } from "react";
import { DialogShell } from "../ui/DynamicDialogModals";
import UploadButton from "./UploadButton";

/**
 * Shared CRUD Modal
 * Props:
 * - isOpen: boolean
 * - onClose: fn
 * - mode: 'create'|'edit'|'view'|'delete'
 * - title: string (optional)
 * - size: 'sm'|'md'|'lg'
 * - fields: [{ name, label, type, placeholder, options, required }] (type: text, textarea, checkbox, select)
 * - initialData: object
 * - onSubmit(data): fn
 * - onDelete(): fn
 * - submitLabel, confirmLabel
 */
export default function CrudModals({
  isOpen = false,
  onClose = () => {},
  mode = "create",
  title,
  size = "md",
  fields = [],
  initialData = {},
  onSubmit = async () => {},
  onDelete = async () => {},
  submitLabel,
  confirmLabel,
  loading = false,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    // Sync form when modal opens or initialData changes. Do NOT depend on `form`
    // otherwise user's typing will be overwritten.
    if (!isOpen) return;
    const next = initialData || {};
    // mark this update as non-urgent to avoid cascading renders warning
    startTransition(() => {
      setForm({ ...next });
    });
  }, [initialData, isOpen]);

  const isView = mode === "view";
  const isDelete = mode === "delete";

  const requiredMissing = useMemo(() => {
    return fields.some((fld) => {
      const val = form[fld.name];
      if (fld.required) {
        if (fld.type === "file") return !val;
        return val === undefined || val === "";
      }
      return false;
    });
  }, [fields, form]);

  const handleChange = (name, value) => {
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isDelete) {
      await onDelete();
      onClose();
      return;
    }

    if (requiredMissing) return;

    await onSubmit(form);
    onClose();
  };

  const modalTitle = title || (mode === "create" ? "Create" : mode === "edit" ? "Edit" : mode === "delete" ? "Confirm delete" : "Details");

  if (!isOpen) return null;

  const content = () => (
    <div className="space-y-4">
      {isDelete ? (
        <div className="text-sm text-zinc-700">Are you sure you want to delete this item? This action cannot be undone.</div>
      ) : (
        <div className="space-y-4">
          {fields.map((fld) => (
            <div key={fld.name}>
              <label className="block text-sm font-semibold text-zinc-900 mb-1">
                {fld.label || fld.name}
                {fld.required ? <span className="text-red-600">*</span> : null}
              </label>

              {fld.type === "textarea" ? (
                <textarea
                  value={form[fld.name] || ""}
                  onChange={(e) => handleChange(fld.name, e.target.value)}
                  placeholder={fld.placeholder || ""}
                  rows={fld.rows || 4}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : fld.type === "select" ? (
                <select
                  value={form[fld.name] ?? ""}
                  onChange={(e) => handleChange(fld.name, e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- select --</option>
                  {(fld.options || []).map((opt) => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                      {opt.label ?? opt}
                    </option>
                  ))}
                </select>
              ) : fld.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form[fld.name]}
                    onChange={(e) => handleChange(fld.name, e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-zinc-700">{fld.placeholder || fld.label}</span>
                </div>
              ) : fld.type === "file" ? (
                <div>
                  <UploadButton
                    accept={fld.accept || "image/*,video/*"}
                    multiple={fld.multiple || false}
                    label={fld.label || "Upload"}
                    variant="outlined"
                    size="small"
                    onFiles={(files) => {
                      const file = files && files[0];
                      if (!file) return;
                      handleChange(fld.name, file);
                    }}
                  />

                  {form[fld.name] ? (
                    <p className="mt-1 text-xs text-zinc-500 truncate">
                      {typeof form[fld.name] === "string" ? form[fld.name] : form[fld.name].name}
                    </p>
                  ) : null}
                </div>
              ) : (
                <input
                  type={fld.type || "text"}
                  value={fld.type === 'file' ? undefined : (form[fld.name] || "")}
                  onChange={(e) => handleChange(fld.name, e.target.value)}
                  placeholder={fld.placeholder || ""}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {fld.help ? <p className="mt-1 text-xs text-zinc-500">{fld.help}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const footer = ({ onClose: shellClose }) => (
    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 w-full">
      <button onClick={onClose} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
        Cancel
      </button>

      <button
        onClick={async () => {
          await handleSubmit();
        }}
        disabled={loading || (isDelete ? false : requiredMissing)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Please wait..." : isDelete ? (confirmLabel || "Delete") : (submitLabel || (mode === "edit" ? "Update" : "Create"))}
      </button>
    </div>
  );

  return <DialogShell opts={{ title: modalTitle, content, footer, size }} onClose={onClose} onConfirm={() => { /* no-op */ }} />;
}
