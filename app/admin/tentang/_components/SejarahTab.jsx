"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import Card from "../../../../components/ui/Card";
import Toast from "../../../../components/ui/Toast";
import PermissionGate from "../../../../components/adminUI/PermissionGate";
import { useAuth } from "../../../../lib/context/auth-context";

const buildId = (id) => `sejarah-${id}`;

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
        <div className="relative h-10 w-10 overflow-hidden rounded border border-zinc-200 bg-zinc-100 shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={`Thumbnail ${item.title || "sejarah"}`}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-500">No Img</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">{item.title}</div>
          <div className="text-xs text-zinc-500 truncate">ID: {item.id}</div>
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

export default function SejarahTab() {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ title: "", imageUrl: "", imageFile: null });
  const [editForm, setEditForm] = useState({ title: "", imageUrl: "", imageFile: null, clearImage: false });

  const createImagePreview = useMemo(() => {
    if (typeof File !== "undefined" && form.imageFile instanceof File) {
      return URL.createObjectURL(form.imageFile);
    }
    return form.imageUrl || "";
  }, [form.imageFile, form.imageUrl]);

  const editImagePreview = useMemo(() => {
    if (typeof File !== "undefined" && editForm.imageFile instanceof File) {
      return URL.createObjectURL(editForm.imageFile);
    }
    return editForm.clearImage ? "" : editForm.imageUrl || "";
  }, [editForm.imageFile, editForm.imageUrl, editForm.clearImage]);

  useEffect(() => {
    return () => {
      if (createImagePreview && createImagePreview.startsWith("blob:")) URL.revokeObjectURL(createImagePreview);
    };
  }, [createImagePreview]);

  useEffect(() => {
    return () => {
      if (editImagePreview && editImagePreview.startsWith("blob:")) URL.revokeObjectURL(editImagePreview);
    };
  }, [editImagePreview]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const sortedItems = useMemo(() => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [items]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/tentang/sejarah", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal memuat sejarah");
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
      const res = await apiCall("/api/admin/tentang/sejarah/reorder", {
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
      let res;
      if (form.imageFile instanceof File) {
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("imageUrl", form.imageFile);
        res = await apiCall("/api/admin/tentang/sejarah", { method: "POST", body: fd });
      } else {
        res = await apiCall("/api/admin/tentang/sejarah", {
          method: "POST",
          body: JSON.stringify({ title: form.title }),
        });
      }

      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menambah sejarah");

      setForm({ title: "", imageUrl: "", imageFile: null });
      setToast({ visible: true, message: "Item sejarah ditambahkan", type: "success" });
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menambah item", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ title: item.title || "", imageUrl: item.imageUrl || "", imageFile: null, clearImage: false });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      let res;
      if (editForm.imageFile instanceof File) {
        const fd = new FormData();
        fd.append("title", editForm.title);
        fd.append("imageUrl", editForm.imageFile);
        res = await apiCall(`/api/admin/tentang/sejarah/${editingId}`, { method: "PUT", body: fd });
      } else {
        res = await apiCall(`/api/admin/tentang/sejarah/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ title: editForm.title, ...(editForm.clearImage ? { imageUrl: null } : { imageUrl: editForm.imageUrl }) }),
        });
      }

      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal memperbarui sejarah");

      setToast({ visible: true, message: "Item sejarah diperbarui", type: "success" });
      setEditingId(null);
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal memperbarui item", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      const res = await apiCall(`/api/admin/tentang/sejarah/${item.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!json?.success) throw new Error(json?.error?.message || "Gagal menghapus item");
      setToast({ visible: true, message: "Item sejarah dihapus", type: "success" });
      fetchData();
    } catch (error) {
      setToast({ visible: true, message: error?.message || "Gagal menghapus item", type: "error" });
    }
  };

  const toggleActive = async (item) => {
    try {
      const res = await apiCall(`/api/admin/tentang/sejarah/${item.id}`, {
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
    <PermissionGate requiredPermissions={["team.read"]}>
      <div className="space-y-4">
        <Card
          title="Sejarah Hysteria"
          subtitle="Kelola judul + gambar, dan urutkan dengan drag & drop.">
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
                  type="file"
                  accept="image/*"
                  onChange={(event) => setForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))}
                  className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-pink-50 file:px-3 file:py-2 file:text-pink-700 hover:file:bg-pink-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">Preview Gambar</label>
                <div className="h-28 w-48 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                  {createImagePreview ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={createImagePreview}
                        alt="Preview gambar sejarah baru"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-400">Belum ada gambar</div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <PermissionGate
                  requiredPermissions={["team.create"]}
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
                    type="file"
                    accept="image/*"
                    onChange={(event) => setEditForm((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null, clearImage: false }))}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Preview Gambar</label>
                  <div className="h-28 w-48 overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                    {editImagePreview ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={editImagePreview}
                          alt={`Preview gambar sejarah ${editForm.title || editingId}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-zinc-400">Belum ada gambar</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm((prev) => ({ ...prev, imageUrl: "", imageFile: null, clearImage: true }))}
                    className="px-2 py-1 text-xs rounded border border-zinc-300 hover:bg-zinc-50">
                    Hapus Gambar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-2 py-1 text-xs rounded border border-zinc-300 hover:bg-zinc-50">
                    Batal
                  </button>
                  <div className="ml-auto">
                    <PermissionGate
                      requiredPermissions={["team.update"]}
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
              <div className="text-sm text-zinc-500">Memuat item sejarah...</div>
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
                        onDelete={handleDelete}
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
      </div>
    </PermissionGate>
  );
}
