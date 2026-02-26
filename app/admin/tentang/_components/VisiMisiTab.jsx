"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "../../../../components/ui/Card";
import Toast from "../../../../components/ui/Toast";
import PermissionGate from "../../../../components/adminUI/PermissionGate";
import { useAuth } from "../../../../lib/context/auth-context";

export default function VisiMisiTab() {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/tentang/visi-misi", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal memuat visi misi");

      const data = json.data || {};
      setVisi(data.visi || "");
      setMisi(data.misi || "");
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal memuat data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiCall("/api/admin/tentang/visi-misi", {
        method: "PUT",
        body: JSON.stringify({
          visi,
          misi,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menyimpan visi misi");

      setToast({ visible: true, message: "Visi & misi berhasil disimpan", type: "success" });
      setVisi(visi);
      setMisi(misi);
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menyimpan data", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGate requiredPermissions={["team.read"]}>
      <div className="space-y-4">
        <Card
          title="Visi & Misi"
          subtitle="Kelola konten visi dan misi untuk halaman tentang.">
          {loading ? (
            <div className="text-sm text-zinc-500">Memuat data visi & misi...</div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Visi</label>
                <textarea
                  value={visi}
                  onChange={(event) => setVisi(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm min-h-28 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Masukkan visi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Misi</label>
                <textarea
                  value={misi}
                  onChange={(event) => setMisi(event.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm min-h-36 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Masukkan misi"
                />
                <p className="mt-1 text-xs text-zinc-500">Gunakan baris baru untuk memisahkan setiap poin visi dan misi.</p>
              </div>

              <div className="flex justify-end">
                <PermissionGate
                  requiredPermissions={["team.update"]}
                  disableOnDenied>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-700 disabled:opacity-60">
                    {saving ? "Menyimpan..." : "Simpan Visi & Misi"}
                  </button>
                </PermissionGate>
              </div>
            </div>
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
