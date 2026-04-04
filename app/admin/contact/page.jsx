"use client";

import { useEffect, useState } from "react";

const INITIAL_FORM = {
  mapsEmbedUrl: "",
  locationTitle: "",
  locationAddress: "",
  operationalHours: "",
  whatsappNumber: "",
  instagramUrl: "",
  twitterUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  email: "",
};

export default function ContactSettingsPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadContact() {
      try {
        const res = await fetch("/api/admin/contact");
        const json = await res.json().catch(() => null);

        if (!isMounted) return;

        if (res.ok && json?.success && json?.data?.contact) {
          const data = json.data.contact;
          setForm({
            mapsEmbedUrl: data.mapsEmbedUrl || "",
            locationTitle: data.locationTitle || "",
            locationAddress: data.locationAddress || "",
            operationalHours: data.operationalHours || "",
            whatsappNumber: data.whatsappNumber || "",
            instagramUrl: data.instagramUrl || "",
            twitterUrl: data.twitterUrl || "",
            facebookUrl: data.facebookUrl || "",
            youtubeUrl: data.youtubeUrl || "",
            tiktokUrl: data.tiktokUrl || "",
            email: data.email || "",
          });
        }
      } catch (error) {
        console.error("Error loading contact settings:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadContact();
    return () => {
      isMounted = false;
    };
  }, []);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "Gagal menyimpan contact settings");
      }

      setMessage("Contact settings berhasil disimpan.");
    } catch (error) {
      setMessage(error?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6 bg-white border rounded-lg">Memuat contact settings...</div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-white border rounded-lg">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Contact Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">Kelola konten halaman kontak publik.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Judul Lokasi" value={form.locationTitle} onChange={(v) => onChange("locationTitle", v)} required />
          <InputField label="Nomor WhatsApp" value={form.whatsappNumber} onChange={(v) => onChange("whatsappNumber", v)} required />
          <InputField label="Instagram URL" value={form.instagramUrl} onChange={(v) => onChange("instagramUrl", v)} />
          <InputField label="Twitter/X URL" value={form.twitterUrl} onChange={(v) => onChange("twitterUrl", v)} />
          <InputField label="Facebook URL" value={form.facebookUrl} onChange={(v) => onChange("facebookUrl", v)} />
          <InputField label="YouTube URL" value={form.youtubeUrl} onChange={(v) => onChange("youtubeUrl", v)} />
          <InputField label="TikTok URL" value={form.tiktokUrl} onChange={(v) => onChange("tiktokUrl", v)} />
          <InputField label="Email" value={form.email} onChange={(v) => onChange("email", v)} />
        </div>

        <TextareaField label="Alamat Lokasi" value={form.locationAddress} onChange={(v) => onChange("locationAddress", v)} required />
        <TextareaField label="Jam Operasional" value={form.operationalHours} onChange={(v) => onChange("operationalHours", v)} required />
        <TextareaField label="Maps Embed URL / iframe" value={form.mapsEmbedUrl} onChange={(v) => onChange("mapsEmbedUrl", v)} required />

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#E83C91] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Contact Settings"}
          </button>
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}

function InputField({ label, value, onChange, required = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#E83C91]/30"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange, required = false }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={4}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#E83C91]/30"
      />
    </label>
  );
}
