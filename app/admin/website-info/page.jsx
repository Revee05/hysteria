"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import PermissionGate from "../../../components/adminUI/PermissionGate";
import { useAuth } from "../../../lib/context/auth-context";

const INITIAL_FORM = {
  judul: "",
  deskripsi: "",
  deskripsiFooter: "",
  logoWebsite: "",
  faviconWebsite: "",
  clearLogoWebsite: false,
  clearFaviconWebsite: false,
};

export default function WebsiteInfoSettingsPage() {
  const { apiCall } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoWebsiteFile, setLogoWebsiteFile] = useState(null);
  const [faviconWebsiteFile, setFaviconWebsiteFile] = useState(null);

  const loadWebsiteInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/website-info", { method: "GET" });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "Gagal memuat website info");
      }

      const data = json?.data?.websiteInfo || {};
      setForm({
        judul: data.judul || "",
        deskripsi: data.deskripsi || "",
        deskripsiFooter: data.deskripsiFooter || "",
        logoWebsite: data.logoWebsite || "",
        faviconWebsite: data.faviconWebsite || "",
        clearLogoWebsite: false,
        clearFaviconWebsite: false,
      });
    } catch (error) {
      console.error("Error loading website info settings:", error);
      setMessage(error?.message || "Gagal memuat website info.");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    loadWebsiteInfo();
  }, [loadWebsiteInfo]);

  const logoPreview = useMemo(() => {
    if (logoWebsiteFile) return URL.createObjectURL(logoWebsiteFile);
    return form.logoWebsite || "";
  }, [form.logoWebsite, logoWebsiteFile]);

  const faviconPreview = useMemo(() => {
    if (faviconWebsiteFile) return URL.createObjectURL(faviconWebsiteFile);
    return form.faviconWebsite || "";
  }, [faviconWebsiteFile, form.faviconWebsite]);

  useEffect(() => {
    return () => {
      if (logoPreview && logoWebsiteFile) URL.revokeObjectURL(logoPreview);
      if (faviconPreview && faviconWebsiteFile) URL.revokeObjectURL(faviconPreview);
    };
  }, [faviconPreview, faviconWebsiteFile, logoPreview, logoWebsiteFile]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("judul", form.judul || "");
      formData.append("deskripsi", form.deskripsi || "");
      formData.append("deskripsiFooter", form.deskripsiFooter || "");
      formData.append("clearLogoWebsite", String(form.clearLogoWebsite));
      formData.append("clearFaviconWebsite", String(form.clearFaviconWebsite));

      if (logoWebsiteFile) formData.append("logoWebsiteFile", logoWebsiteFile);
      if (faviconWebsiteFile) formData.append("faviconWebsiteFile", faviconWebsiteFile);

      const res = await apiCall("/api/admin/website-info", {
        method: "PUT",
        body: formData,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.error?.message || "Gagal menyimpan website info");
      }

      const saved = json?.data?.websiteInfo || {};
      setForm({
        judul: saved.judul || "",
        deskripsi: saved.deskripsi || "",
        deskripsiFooter: saved.deskripsiFooter || "",
        logoWebsite: saved.logoWebsite || "",
        faviconWebsite: saved.faviconWebsite || "",
        clearLogoWebsite: false,
        clearFaviconWebsite: false,
      });

      setLogoWebsiteFile(null);
      setFaviconWebsiteFile(null);
      setMessage("Website info berhasil disimpan.");
    } catch (error) {
      setMessage(error?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PermissionGate requiredPermissions={["tentang.read"]}>
        <div className="p-4 sm:p-6 bg-white border rounded-lg">
          <div className="flex items-center gap-3 text-zinc-600">
            <div className="h-5 w-5 rounded-full border-2 border-zinc-300 border-t-pink-500 animate-spin" />
            <span className="text-sm font-medium">Memuat website info...</span>
          </div>
        </div>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate requiredPermissions={["tentang.read"]}>
      <div className="p-4 sm:p-6 bg-white border rounded-lg">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900">Website Info</h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">Kelola informasi utama website dan footer.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-4 rounded-md border border-zinc-200 p-4">
              <h2 className="text-sm font-semibold text-zinc-900">Informasi Utama</h2>
              <InputField
                label="Judul"
                value={form.judul}
                onChange={(v) => onChange("judul", v)}
              />
              <TextareaField
                label="Deskripsi"
                value={form.deskripsi}
                onChange={(v) => onChange("deskripsi", v)}
                rows={4}
              />
              <TextareaField
                label="Deskripsi Footer"
                value={form.deskripsiFooter}
                onChange={(v) => onChange("deskripsiFooter", v)}
                rows={4}
              />
            </div>

            <div className="space-y-4 rounded-md border border-zinc-200 p-4">
              <h2 className="text-sm font-semibold text-zinc-900">Logo dan Favicon</h2>
              <FileField
                label="Upload Logo Website"
                previewSrc={logoPreview}
                clearScheduled={form.clearLogoWebsite}
                emptyText="Belum ada logo"
                onFileChange={(file) => {
                  setLogoWebsiteFile(file);
                  if (file) onChange("clearLogoWebsite", false);
                }}
                onDelete={() => {
                  setLogoWebsiteFile(null);
                  onChange("logoWebsite", "");
                  onChange("clearLogoWebsite", true);
                }}
              />

              <FileField
                label="Upload Favicon Website"
                previewSrc={faviconPreview}
                clearScheduled={form.clearFaviconWebsite}
                emptyText="Belum ada favicon"
                onFileChange={(file) => {
                  setFaviconWebsiteFile(file);
                  if (file) onChange("clearFaviconWebsite", false);
                }}
                onDelete={() => {
                  setFaviconWebsiteFile(null);
                  onChange("faviconWebsite", "");
                  onChange("clearFaviconWebsite", true);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <PermissionGate
              requiredPermissions={["tentang.update"]}
              disableOnDenied>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-[#E83C91] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                {saving ? "Menyimpan..." : "Simpan Website Info"}
              </button>
            </PermissionGate>
            {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}

function InputField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-zinc-700 mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </label>
  );
}

function TextareaField({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-zinc-700 mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
    </label>
  );
}

function FileField({ label, previewSrc, onFileChange, onDelete, clearScheduled, emptyText }) {
  return (
    <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50/40 p-3">
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-pink-50 file:px-3 file:py-2 file:text-pink-700 hover:file:bg-pink-100"
      />
      <p className="mt-1 text-xs text-zinc-500">Maksimal 5MB. Ukuran 1:1. Format yang disarankan .png (logo) atau .ico (favicon)</p>
      {previewSrc ? (
        <Image
          src={previewSrc}
          alt="Preview"
          width={160}
          height={72}
          className="h-[72px] w-auto max-w-full rounded border border-zinc-200 bg-white object-contain"
          unoptimized
        />
      ) : (
        <div className="text-xs text-zinc-500">{emptyText}</div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-700 hover:bg-zinc-50">
          Hapus Gambar
        </button>
        {clearScheduled ? <span className="text-xs text-amber-600">Akan dihapus saat disimpan.</span> : null}
      </div>
    </div>
  );
}
