"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../lib/context/auth-context";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import CrudModals from "../../../components/adminUI/Crud.Modals";
import Toast from "../../../components/ui/Toast";

const toSlug = (value) => {
  const base = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "item";
};

export default function TeamManagementPage() {
  const { apiCall } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState("create");
  const [memberModalMode, setMemberModalMode] = useState("create");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeMember, setActiveMember] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/team", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        const payload = json.data || {};
        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setToast({ visible: true, message: "Gagal memuat data tim", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    [categories],
  );

  const openCategoryModal = (mode, category = null) => {
    setActiveCategory(category);
    setCategoryModalMode(mode);
    setCategoryModalOpen(true);
  };

  const openMemberModal = (mode, member = null, category = null) => {
    setActiveMember(member);
    setActiveCategory(category || null);
    setMemberModalMode(mode);
    setMemberModalOpen(true);
  };

  const handleCategorySubmit = async (form) => {
    const payload = {
      ...form,
      type: "category",
      order: form.order !== undefined ? Number(form.order) : 0,
      isActive: !!form.isActive,
    };
    if (!payload.slug && payload.name) payload.slug = toSlug(payload.name);

    try {
      const res = await apiCall("/api/admin/team", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal membuat kategori", type: "error" });
      return false;
    } catch (error) {
      console.error("Error creating category:", error);
      setToast({ visible: true, message: "Gagal membuat kategori", type: "error" });
      return false;
    }
  };

  const handleCategoryUpdate = async (form) => {
    if (!activeCategory) return false;
    const payload = {
      ...form,
      type: "category",
      order: form.order !== undefined ? Number(form.order) : undefined,
      isActive: form.isActive !== undefined ? !!form.isActive : undefined,
    };
    if (!payload.slug && payload.name) payload.slug = toSlug(payload.name);

    try {
      const res = await apiCall(`/api/admin/team/${activeCategory.id}?type=category`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal memperbarui kategori", type: "error" });
      return false;
    } catch (error) {
      console.error("Error updating category:", error);
      setToast({ visible: true, message: "Gagal memperbarui kategori", type: "error" });
      return false;
    }
  };

  const handleCategoryDelete = async () => {
    if (!activeCategory) return false;
    try {
      const res = await apiCall(`/api/admin/team/${activeCategory.id}?type=category`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal menghapus kategori", type: "error" });
      return false;
    } catch (error) {
      console.error("Error deleting category:", error);
      setToast({ visible: true, message: "Gagal menghapus kategori", type: "error" });
      return false;
    }
  };

  const handleMemberSubmit = async (form) => {
    const payload = prepareMemberPayload(form);

    try {
      const res = await sendMemberRequest("/api/admin/team", "POST", payload);
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal membuat anggota", type: "error" });
      return false;
    } catch (error) {
      console.error("Error creating member:", error);
      setToast({ visible: true, message: "Gagal membuat anggota", type: "error" });
      return false;
    }
  };

  const handleMemberUpdate = async (form) => {
    if (!activeMember) return false;
    const payload = prepareMemberPayload(form, { forUpdate: true });

    try {
      const res = await sendMemberRequest(`/api/admin/team/${activeMember.id}?type=member`, "PUT", payload);
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal memperbarui anggota", type: "error" });
      return false;
    } catch (error) {
      console.error("Error updating member:", error);
      setToast({ visible: true, message: "Gagal memperbarui anggota", type: "error" });
      return false;
    }
  };

  const handleMemberDelete = async () => {
    if (!activeMember) return false;
    try {
      const res = await apiCall(`/api/admin/team/${activeMember.id}?type=member`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        await fetchTeams();
        return true;
      }
      setToast({ visible: true, message: json?.error?.message || "Gagal menghapus anggota", type: "error" });
      return false;
    } catch (error) {
      console.error("Error deleting member:", error);
      setToast({ visible: true, message: "Gagal menghapus anggota", type: "error" });
      return false;
    }
  };

  const prepareMemberPayload = (form, { forUpdate = false } = {}) => {
    const payload = {
      type: "member",
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      name: form.name,
      slug: form.slug,
      role: form.role,
      imageUrl: form.imageUrl,
      email: form.email,
      instagram: form.instagram,
      order: form.order !== undefined ? Number(form.order) : forUpdate ? undefined : 0,
      isActive: forUpdate ? (form.isActive !== undefined ? !!form.isActive : undefined) : !!form.isActive,
    };
    if (!payload.slug && payload.name) {
      payload.slug = toSlug(payload.name);
    }
    return payload;
  };

  const sendMemberRequest = async (url, method, payload) => {
    const hasFile = typeof File !== "undefined" && payload.imageUrl instanceof File;
    const requestPayload = { ...payload };
    const options = { method };

    if (hasFile) {
      const formData = new FormData();
      const imageFile = requestPayload.imageUrl;
      delete requestPayload.imageUrl;
      Object.entries(requestPayload).forEach(([key, value]) => {
        if (value === undefined) return;
        formData.append(key, value);
      });
      formData.append("imageUrl", imageFile);
      options.body = formData;
    } else {
      options.body = JSON.stringify(requestPayload);
    }

    return apiCall(url, options);
  };

  const categoryFields = [
    { name: "name", label: "Nama Kategori", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", placeholder: "auto-generated from name" },
    { name: "description", label: "Deskripsi", type: "textarea" },
    { name: "order", label: "Urutan", type: "number" },
    { name: "isActive", label: "Aktif", type: "checkbox" },
  ];

  const memberFields = [
    {
      name: "categoryId",
      label: "Kategori",
      type: "select",
      options: categoryOptions,
      required: true,
    },
    { name: "name", label: "Nama", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", placeholder: "auto-generated from name" },
    { name: "role", label: "Peran", type: "text", required: true },
    {
      name: "imageUrl",
      label: "Foto",
      type: "file",
      accept: "image/*",
      help: "Unggah foto anggota untuk menghasilkan URL secara otomatis.",
    },
    { name: "email", label: "Email", type: "text" },
    { name: "instagram", label: "Instagram", type: "text", placeholder: "username atau URL" },
    { name: "order", label: "Urutan", type: "number" },
    { name: "isActive", label: "Aktif", type: "checkbox" },
  ];

  const columns = [
    { field: "name", headerName: "Nama", width: 200 },
    { field: "role", headerName: "Peran", width: 180 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "instagram", headerName: "Instagram", width: 160 },
    { field: "order", headerName: "Urutan", width: 80, align: "center" },
    {
      field: "isActive",
      headerName: "Status",
      width: 100,
      align: "center",
      render: (row) => <span className={`text-xs font-medium ${row.isActive ? "text-emerald-600" : "text-zinc-500"}`}>{row.isActive ? "Active" : "Inactive"}</span>,
    },
    {
      field: "actions",
      headerName: "Aksi",
      width: 140,
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMemberModal(
                "edit",
                row,
                categories.find((c) => c.id === row.categoryId),
              );
            }}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMemberModal(
                "delete",
                row,
                categories.find((c) => c.id === row.categoryId),
              );
            }}
            className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Team Management</h1>
          <p className="text-sm text-zinc-600">Kelola kategori tim dan anggota secara terpadu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openCategoryModal("create")}
            className="px-4 py-2 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-700">
            Tambah Kategori
          </button>
        </div>
      </div>

      {categories.length === 0 && !loading ? (
        <Card>
          <div className="text-sm text-zinc-600">Belum ada data tim.</div>
        </Card>
      ) : (
        categories.map((category) => (
          <Card
            key={category.id}
            title={category.name}
            subtitle={category.description || category.slug}
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openMemberModal("create", null, category)}
                  className="text-xs px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  Tambah Anggota
                </button>
                <button
                  onClick={() => openCategoryModal("edit", category)}
                  className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Edit Kategori
                </button>
                <button
                  onClick={() => openCategoryModal("delete", category)}
                  className="text-xs px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">
                  Hapus
                </button>
              </div>
            }>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-600 mb-4">
              <span>Slug: {category.slug}</span>
              <span>Urutan: {category.order}</span>
              <span>Status: {category.isActive ? "Active" : "Inactive"}</span>
            </div>
            <DataTable
              columns={columns}
              rows={category.members || []}
              loading={loading}
              getRowId={(row) => row.id}
            />
          </Card>
        ))
      )}

      <CrudModals
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        mode={categoryModalMode}
        title={categoryModalMode === "delete" ? `Hapus Kategori ${activeCategory?.name || ""}` : categoryModalMode === "edit" ? `Edit Kategori ${activeCategory?.name || ""}` : "Tambah Kategori"}
        fields={categoryFields}
        initialData={
          activeCategory || {
            name: "",
            slug: "",
            description: "",
            order: 0,
            isActive: true,
          }
        }
        onSubmit={categoryModalMode === "edit" ? handleCategoryUpdate : handleCategorySubmit}
        onDelete={handleCategoryDelete}
      />

      <CrudModals
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        mode={memberModalMode}
        title={memberModalMode === "delete" ? `Hapus Anggota ${activeMember?.name || ""}` : memberModalMode === "edit" ? `Edit Anggota ${activeMember?.name || ""}` : "Tambah Anggota"}
        fields={memberFields}
        initialData={
          activeMember || {
            categoryId: activeCategory ? String(activeCategory.id) : "",
            name: "",
            slug: "",
            role: "",
            imageUrl: "",
            email: "",
            instagram: "",
            order: 0,
            isActive: true,
          }
        }
        onSubmit={memberModalMode === "edit" ? handleMemberUpdate : handleMemberSubmit}
        onDelete={handleMemberDelete}
      />

      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ visible: false, message: "", type: "error" })}
      />
    </div>
  );
}
