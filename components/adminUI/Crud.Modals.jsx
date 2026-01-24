"use client";

import React, { useEffect, useMemo, useState, startTransition } from "react";
import Image from "next/image";
import { DialogShell } from "../ui/DynamicDialogModals";
import UploadButton from "./UploadButton";
import DeleteIcon from "@mui/icons-material/Delete";

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
  const [initialSnapshot, setInitialSnapshot] = useState({});

  useEffect(() => {
    // Sync form when modal opens or initialData changes. Do NOT depend on `form`
    // otherwise user's typing will be overwritten.
    if (!isOpen) return;
    const next = initialData || {};
    // mark this update as non-urgent to avoid cascading renders warning
    startTransition(() => {
      setForm({ ...next });
      setInitialSnapshot({ ...next });
    });
  }, [initialData, isOpen]);

  const isView = mode === "view";
  const isDelete = mode === "delete";

  const requiredMissing = useMemo(() => {
    return fields.some((fld) => {
      const val = form[fld.name];
      // If source is disabled because media exists, treat as not missing
      if (fld.name === 'source' && form && form.media) return false;
      // If media is disabled because source exists, treat as not missing
      if (fld.name === 'media' && form && form.source && String(form.source).trim() !== '') return false;

      if (fld.required) {
        if (fld.type === "file") return !val;
        return val === undefined || val === "";
      }
      return false;
    });
  }, [fields, form]);

  const isSameValue = (a, b) => {
    // both strictly equal
    if (a === b) return true;
    // file comparison
    if (a instanceof File && b instanceof File) return a.name === b.name && a.size === b.size && a.type === b.type;
    if (a instanceof File || b instanceof File) return false;
    // both objects -> compare JSON
    if (typeof a === 'object' && typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b);
    // fallback to string comparison
    return String(a) === String(b);
  };

  const isDirty = useMemo(() => {
    const keys = new Set([...Object.keys(initialSnapshot || {}), ...Object.keys(form || {})]);
    for (const k of keys) {
      if (!isSameValue(form[k], initialSnapshot[k])) return true;
    }
    return false;
  }, [form, initialSnapshot]);

  const handleChange = (name, value) => {
    setForm((s) => ({ ...s, [name]: value }));
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const abs = Math.abs(bytes);
    if (abs < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let i = -1;
    let num = abs;
    do {
      num = num / 1024;
      i++;
    } while (num >= 1024 && i < units.length - 1);
    return (bytes < 0 ? "-" : "") + num.toFixed( i === 0 ? 0 : 1 ) + " " + units[i];
  };

  function FilePreview({ value, name }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
      if (!value) return;
      // For File objects, create object URL for image preview
      if (value instanceof File && value.type && value.type.startsWith('image/')) {
        const u = URL.createObjectURL(value);
        setPreviewUrl(u);
        return () => URL.revokeObjectURL(u);
      }

      // If value is a string and looks like a path or URL, use it for preview
      if (typeof value === 'string' && (value.startsWith('/') || value.startsWith('https') || value.startsWith('uploads/'))) {
        setPreviewUrl(value);
        return;
      }

      setPreviewUrl(null);
    }, [value]);

    const remove = () => handleChange(name, null);

    if (!value) return null;

    const filename = typeof value === 'string' ? value : value.name;
    const size = typeof value === 'string' ? null : (typeof value.size === 'number' ? value.size : null);

    return (
      <div className="mt-2 flex items-center gap-3 border border-zinc-300 bg-white rounded-md p-3 shadow-sm">
          {previewUrl ? (
          <div className="w-16 h-16 rounded-md overflow-hidden bg-zinc-50 flex-shrink-0 border border-zinc-200 relative">
            <Image src={previewUrl} alt={filename} fill className="object-cover" sizes="64px" unoptimized />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-md bg-zinc-50 flex items-center justify-center text-zinc-500 text-sm border border-zinc-200">FILE</div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-zinc-900 truncate">{filename}</div>
            {size ? <div className="text-xs text-zinc-400">· {formatBytes(size)}</div> : null}
          </div>
          <div className="mt-1 text-xs text-zinc-500">{typeof value === 'string' ? 'Path tersimpan' : (value.type || '')}</div>
        </div>

        <button type="button" onClick={remove} className="ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50">
          <DeleteIcon fontSize="small" />
          <span>Hapus</span>
        </button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (isDelete) {
      const ok = await onDelete();
      if (ok !== false) onClose();
      return;
    }

    if (requiredMissing) return;

    const ok = await onSubmit(form);
    if (ok !== false) onClose();
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
                    disabled={!!(form && form.source && String(form.source).trim() !== "")}
                  />

                  {form[fld.name] ? (
                    <FilePreview value={form[fld.name]} name={fld.name} />
                  ) : null}
                </div>
              ) : (
                <input
                  type={fld.type || "text"}
                  value={fld.type === 'file' ? undefined : (form[fld.name] || "")}
                  onChange={(e) => handleChange(fld.name, e.target.value)}
                  placeholder={fld.placeholder || ""}
                  disabled={fld.name === 'source' ? !!(form && form.media) : undefined}
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}

              {fld.help ? <p className="mt-1 text-xs text-zinc-500">{fld.help}</p> : null}
              {/* Guidance for edit mode: tell user to remove URL to enable upload, or remove upload to enable URL */}
              {mode === 'edit' && fld.name === 'media' && form && form.source && String(form.source).trim() !== '' ? (
                <p className="mt-1 text-xs text-yellow-700">Jika ingin mengganti dengan file upload, hapus nilai pada field <strong>Source</strong> terlebih dahulu supaya bisa upload file.</p>
              ) : null}
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
        disabled={
          loading || (isDelete ? false : (requiredMissing || (mode === "edit" && !isDirty)))
        }
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Please wait..." : isDelete ? (confirmLabel || "Delete") : (submitLabel || (mode === "edit" ? "Update" : "Create"))}
      </button>
    </div>
  );

  return <DialogShell opts={{ title: modalTitle, content, footer, size }} onClose={onClose} onConfirm={() => { /* no-op */ }} />;
}
