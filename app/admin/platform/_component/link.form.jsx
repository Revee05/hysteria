"use client";

import React, { useState } from 'react';

export default function LinkForm({
  close,
  title = '',
  placeholders = {},
  initial = {},
  onSave,
}) {
  const [input, setInput] = useState(initial.input || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const errs = {};
    // simple validation example
    

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {/* <button onClick={close} className="text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-200 cursor-pointer ">✕</button> */}
      </div>

      <div className="space-y-4">

        <div className="grid gap-2">
        {/* general input text */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholders.input || 'text . . . . . '}
            className="border rounded px-3 py-2"
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
