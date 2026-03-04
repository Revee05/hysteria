"use client";

import React, { useState } from 'react';

export default function LinkForm({
  close,
  title = '',
  subtitle='',
  placeholders = {},
  initial = {},
  onSave,
  // phone mode: show only phone input, combine with `prefix` when saving
  isPhone = false,
  prefix = ''
}) {
  // If phone mode and initial contains full URL, derive phone part for visible input
  const deriveInitial = () => {
    const raw = initial.input || '';
    if (!isPhone) return raw;
    const p = prefix || placeholders.input || '';
    // If prefix contains 'phone=' try to remove until after '='
    let phone = raw;
    if (p && raw.startsWith(p)) {
      phone = raw.slice(p.length);
      return phone;
    }
    // If raw contains 'phone=' param, extract value
    const m = raw.match(/phone=([^&]+)/);
    if (m) return m[1];
    // fallback: return raw
    return raw;
  };

  const [input, setInput] = useState(deriveInitial());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const errs = {};
    // simple validation example
    if (isPhone) {
      const rawPhone = (input || '').trim();
      if (!rawPhone) {
        errs.input = 'Nomor HP diperlukan';
      }
      // normalize phone: remove non-digits
      let normalized = rawPhone.replace(/\D+/g, '');
      if (normalized.startsWith('0')) normalized = normalized.slice(1);
      if (normalized.startsWith('+')) normalized = normalized.replace(/^\+/, '');

      // If prefix already contains country code (e.g. 'phone=62'), do not duplicate
      const p = prefix || placeholders.input || '';
      let finalUrl = '';
      if (p) {
        if (/phone=62/.test(p) && normalized.startsWith('62')) {
          // remove leading 62 to avoid doubling
          normalized = normalized.slice(2);
        }
        finalUrl = p + normalized;
      } else {
        finalUrl = normalized;
      }

      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }

      if (onSave) {
        try {
          setSaving(true);
          await onSave({ name: finalUrl });
          close();
        } finally {
          setSaving(false);
        }
      } else {
        close();
      }
      return;
    }

    if (onSave) {
      try {
        setSaving(true);
        await onSave({ name: input.trim() });
        close();
      } finally {
        setSaving(false);
      }
    } else {
      // default behaviour: just close
      close();
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col items-start justify-between mb-2">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
        {/* <button onClick={close} className="text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-200 cursor-pointer ">✕</button> */}
      </div>

      <div className="space-y-4">

        <div className="grid gap-2">
        {/* general input text */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={(placeholders.input || 'text . . . . . ')}
            className="border rounded px-3 py-2"
            inputMode={isPhone ? 'numeric' : 'text'}
          />
          {errors.input && <div className="text-red-600 text-sm">{errors.input}</div>}
        </div>

        <div className="flex justify-between  mt-4">
          <button onClick={close} className="px-4 py-2 text-pink-500 bg-zinc-100 border border-pink-500 rounded-lg cursor-pointer hover:bg-red-600 hover:text-white">Batal</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg disabled:opacity-60 cursor-pointer hover:bg-pink-600 disabled:hover:bg-pink-500"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}
