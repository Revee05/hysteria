"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "../../../../components/ui/Card";
import Toast from "../../../../components/ui/Toast";
import PermissionGate from "../../../../components/adminUI/PermissionGate";
import { useAuth } from "../../../../lib/context/auth-context";

const buildId = (id) => `panduan-${id}`;

function SortableRow({ item, onEdit, onDelete, onToggleActive }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: buildId(item.id) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-zinc-200 p-3 bg-white">
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="rounded border border-zinc-200 p-1 text-zinc-500 cursor-grab"
          title="Drag untuk urutkan">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path d="M7 5h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">{item.title}</div>
          <div className="text-xs text-zinc-500 truncate">{item.link || "Tanpa link"}</div>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <span>{item.isActive ? "Active" : "Inactive"}</span>
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${item.isActive ? "bg-emerald-500" : "bg-zinc-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isActive ? "translate-x-4" : "translate-x-1"}`} />
          </button>
        </label>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">
          Hapus
        </button>
      </div>
    </div>
  );
}

export default function PanduanVisualTab() {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({ title: "", link: "" });
  const [editForm, setEditForm] = useState({ title: "", link: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const sortedItems = useMemo(() => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [items]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/tentang/panduan-visual", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal memuat panduan visual");
      setItems(Array.isArray(json.data?.items) ? json.data.items : []);
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal memuat data", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const persistOrder = async (nextItems) => {
    try {
      const payload = nextItems.map((item, index) => ({ id: item.id, order: index }));
      const res = await apiCall("/api/admin/tentang/panduan-visual/reorder", {
        method: "POST",
        body: JSON.stringify({ items: payload }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menyimpan urutan");
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menyimpan urutan", type: "error" });
      fetchData();
    }
  };

  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = sortedItems.findIndex((item) => buildId(item.id) === active.id);
    const newIndex = sortedItems.findIndex((item) => buildId(item.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(sortedItems, oldIndex, newIndex).map((item, index) => ({ ...item, order: index }));
    setItems(moved);
    await persistOrder(moved);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await apiCall("/api/admin/tentang/panduan-visual", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menambah panduan visual");
      setForm({ title: "", link: "" });
      setToast({ visible: true, message: "Item panduan visual ditambahkan", type: "success" });
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menambah item", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ title: item.title || "", link: item.link || "" });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await apiCall(`/api/admin/tentang/panduan-visual/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal memperbarui panduan visual");
      setToast({ visible: true, message: "Item panduan visual diperbarui", type: "success" });
      setEditingId(null);
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal memperbarui item", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (item) => {
    setDeleteTarget(item);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiCall(`/api/admin/tentang/panduan-visual/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menghapus item");
      setToast({ visible: true, message: "Item panduan visual dihapus", type: "success" });
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menghapus item", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (item) => {
    try {
      const res = await apiCall(`/api/admin/tentang/panduan-visual/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal ubah status");
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...row, isActive: !row.isActive } : row)));
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal ubah status", type: "error" });
    }
  };

  return (
    <PermissionGate requiredPermissions={["tentang.read"]}>
      <div className="space-y-4">
        <Card
          title="Panduan Visual"
          subtitle="Kelola title + link dan urutkan dengan drag & drop.">
          <div className="space-y-5">
            <div className="rounded-lg border border-zinc-200 p-3 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-900">Tambah Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={form.link}
                  onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                  className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="Link (https://...)"
                />
              </div>
              <div className="flex justify-end">
                <PermissionGate
                  requiredPermissions={["tentang.create"]}
                  disableOnDenied>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving || !form.title.trim()}
                    className="px-3 py-1.5 rounded bg-pink-600 text-white text-sm hover:bg-pink-700 disabled:opacity-60">
                    Tambah
                  </button>
                </PermissionGate>
              </div>
            </div>

            {editingId ? (
              <div className="rounded-lg border border-zinc-200 p-3 space-y-3">
                <h3 className="text-sm font-semibold text-zinc-900">Edit Item #{editingId}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editForm.link}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, link: event.target.value }))}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                    placeholder="Link (https://...)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-xs rounded border border-zinc-300 hover:bg-zinc-50">
                    Batal
                  </button>
                  <div className="ml-auto">
                    <PermissionGate
                      requiredPermissions={["tentang.update"]}
                      disableOnDenied>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={saving || !editForm.title.trim()}
                        className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60">
                        Simpan Perubahan
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="text-sm text-zinc-500">Memuat item panduan visual...</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}>
                <SortableContext
                  items={sortedItems.map((item) => buildId(item.id))}
                  strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sortedItems.map((item) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        onEdit={startEdit}
                        onDelete={askDelete}
                        onToggleActive={toggleActive}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </Card>

        <Toast
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ visible: false, message: "", type: "error" })}
        />

        {deleteTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => (deleting ? null : setDeleteTarget(null))}
            />
            <div className="relative w-full max-w-md rounded-xl bg-white border border-zinc-200 shadow-xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-zinc-900">Konfirmasi Hapus</h3>
              <p className="text-sm text-zinc-600">
                Item <span className="font-medium text-zinc-900">{deleteTarget.title || `#${deleteTarget.id}`}</span> akan dihapus permanen. Lanjutkan?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded border border-zinc-300 text-sm hover:bg-zinc-50 disabled:opacity-60">
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60">
                  {deleting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PermissionGate>
  );
}
