"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Card from "../../../../components/ui/Card";
import Toast from "../../../../components/ui/Toast";
import PermissionGate from "../../../../components/adminUI/PermissionGate";
import { useAuth } from "../../../../lib/context/auth-context";

const PAGE_SLUG = "tim";

export default function HeroSettingsTab() {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    imageFile: null,
  });
  const [clearImage, setClearImage] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const imagePreview = useMemo(() => {
    if (typeof File !== "undefined" && form.imageFile instanceof File) {
      return URL.createObjectURL(form.imageFile);
    }
    return form.imageUrl || "";
  }, [form.imageFile, form.imageUrl]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchHero = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/api/admin/page-hero/${PAGE_SLUG}`, { method: "GET" });
      const json = await res.json().catch(() => null);

      if (!json?.success) {
        if (res.status === 404) {
          setForm((prev) => ({ ...prev, imageUrl: "", title: "", subtitle: "", imageFile: null }));
          return;
        }
        throw new Error(json?.error?.message || "Gagal memuat hero tim");
      }

      const data = json.data || {};
      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl || "",
        title: data.title || "",
        subtitle: data.subtitle || "",
        imageFile: null,
      }));
      setClearImage(false);
    } catch (error) {
      console.error("Error fetching team page hero:", error);
      setToast({ visible: true, message: "Gagal memuat pengaturan hero", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchHero();
  }, [fetchHero]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let options;
      if (typeof File !== "undefined" && form.imageFile instanceof File) {
        const formData = new FormData();
        if (form.title !== undefined) formData.append("title", form.title || "");
        if (form.subtitle !== undefined) formData.append("subtitle", form.subtitle || "");
        formData.append("imageUrl", form.imageFile);
        options = { method: "PUT", body: formData };
      } else {
        const normalizedImageUrl = form.imageUrl?.trim();
        options = {
          method: "PUT",
          body: JSON.stringify({
            title: form.title,
            subtitle: form.subtitle,
            ...(clearImage ? { clearImage: true } : {}),
            ...(normalizedImageUrl ? { imageUrl: normalizedImageUrl } : {}),
          }),
        };
      }

      const res = await apiCall(`/api/admin/page-hero/${PAGE_SLUG}`, options);
      const json = await res.json().catch(() => null);

      if (!json?.success) {
        throw new Error(json?.error?.message || "Gagal menyimpan hero tim");
      }

      const data = json.data || {};
      setForm((prev) => ({
        ...prev,
        imageUrl: data.imageUrl ?? "",
        title: data.title || "",
        subtitle: data.subtitle || "",
        imageFile: null,
      }));
      setClearImage(false);

      setToast({ visible: true, message: "Hero tim berhasil disimpan", type: "success" });
    } catch (error) {
      console.error("Error saving team page hero:", error);
      setToast({ visible: true, message: error?.message || "Gagal menyimpan hero tim", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate requiredPermissions={["page-hero.read"]}>
      <div className="space-y-4">
        <Card
          title="Hero Page Team"
          subtitle="Atur hero untuk halaman tim (slug: tim).">
          {loading ? (
            <div className="text-sm text-zinc-500">Memuat pengaturan hero...</div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Title (opsional)</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Contoh: Tim Hysteria"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Subtitle (opsional)</label>
                    <textarea
                      value={form.subtitle}
                      onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Contoh: Hysteria, Collaboratorium and Creative Impact Hub"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Image URL (opsional jika upload file)</label>
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(event) => {
                        setClearImage(false);
                        setForm((prev) => ({ ...prev, imageUrl: event.target.value }));
                      }}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="/uploads/... atau https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Upload Gambar</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setClearImage(false);
                        setForm((prev) => ({ ...prev, imageFile: file }));
                      }}
                      className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-pink-50 file:px-3 file:py-2 file:text-pink-700 hover:file:bg-pink-100"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Maksimal 5MB. Jika diisi, file upload akan menggantikan URL gambar.</p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setClearImage(true);
                          setForm((prev) => ({ ...prev, imageUrl: "", imageFile: null }));
                        }}
                        className="px-3 py-1.5 rounded-md border border-zinc-300 text-xs text-zinc-700 hover:bg-zinc-50">
                        Hapus Gambar Hero
                      </button>
                    </div>
                    {clearImage ? <p className="mt-1 text-xs text-amber-600">Gambar akan dihapus saat disimpan.</p> : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Preview</label>
                  <div className="h-56 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={imagePreview}
                          alt="Preview hero tim"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-zinc-400">Belum ada gambar hero</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <PermissionGate
                  requiredPermissions={["page-hero.update"]}
                  disableOnDenied>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-700 disabled:opacity-60">
                    {saving ? "Menyimpan..." : "Simpan Hero"}
                  </button>
                </PermissionGate>
              </div>
            </form>
          )}
        </Card>

        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ visible: false, message: "", type: "error" })}
        />
      </div>
    </PermissionGate>
  );
}
