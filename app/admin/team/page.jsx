"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "../../../lib/context/auth-context";
import Card from "../../../components/ui/Card";
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

const buildCategoryId = (id) => `category-${id}`;
const buildMemberId = (id) => `member-${id}`;
const buildDropZoneId = (id) => `category-drop-${id}`;
const parsePrefixedId = (value, prefix) => Number(String(value).replace(`${prefix}-`, ""));

const ToggleSwitch = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-xs text-zinc-600">
    <span className="whitespace-nowrap">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-zinc-300"}`}
      aria-pressed={checked}
      aria-label={label}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  </label>
);

const SortableCategoryCard = ({ category, collapsed, onToggle, onAddMember, onEdit, onDelete, onToggleActive, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: buildCategoryId(category.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}>
      <Card
        icon={
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="rounded-md border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50"
              title="Drag untuk mengurutkan kategori">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M7 5h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onToggle(category.id)}
              className="rounded-md border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50"
              title={collapsed ? "Buka kategori" : "Tutup kategori"}
              aria-label={collapsed ? "Buka kategori" : "Tutup kategori"}>
              <svg
                className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        }
        title={category.name}
        subtitle={category.description || category.slug}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ToggleSwitch
              checked={!!category.isActive}
              onChange={(next) => onToggleActive(category, next)}
              label={category.isActive ? "Active" : "Inactive"}
            />
            <button
              type="button"
              onClick={() => onAddMember(category)}
              className="text-xs px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              Tambah Anggota
            </button>
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
              Edit Kategori
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="text-xs px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">
              Hapus
            </button>
          </div>
        }>
        {children}
      </Card>
    </div>
  );
};

const SortableMemberRow = ({ member, onEdit, onDelete, onToggleActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: buildMemberId(member.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="rounded-md border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50"
            title="Drag untuk mengurutkan anggota">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M7 5h2v2H7V5zm4 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2z" />
            </svg>
          </button>
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-900">{member.name}</div>
          <div className="text-xs text-zinc-500">{member.role}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleSwitch
          checked={!!member.isActive}
          onChange={(next) => onToggleActive(member, next)}
          label={member.isActive ? "Active" : "Inactive"}
        />
        <button
          type="button"
          onClick={() => onEdit(member)}
          className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(member)}
          className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">
          Hapus
        </button>
      </div>
    </div>
  );
};

const CategoryDropZone = ({ categoryId, isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({ id: buildDropZoneId(categoryId) });
  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className={`mt-3 rounded-md border border-dashed px-3 py-2 text-xs ${isOver ? "border-pink-500 bg-pink-50 text-pink-600" : "border-zinc-200 text-zinc-400"}`}>
      Lepas anggota di sini
    </div>
  );
};

export default function TeamManagementPage() {
  const { apiCall } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
  const [collapsedIds, setCollapsedIds] = useState([]);
  const [activeDrag, setActiveDrag] = useState({ id: null, type: null });

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

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

  const toggleCategory = (categoryId) => {
    setCollapsedIds((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  };

  const handleCategorySubmit = async (form) => {
    const payload = {
      ...form,
      type: "category",
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

  const handleCategoryToggleActive = async (category, nextActive) => {
    const previous = categories;
    setCategories((prev) => prev.map((item) => (item.id === category.id ? { ...item, isActive: nextActive } : item)));
    try {
      const res = await apiCall(`/api/admin/team/${category.id}?type=category`, {
        method: "PUT",
        body: JSON.stringify({ type: "category", isActive: nextActive }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error?.message || "Gagal memperbarui status kategori");
      }
    } catch (error) {
      console.error("Error updating category status:", error);
      setCategories(previous);
      setToast({ visible: true, message: "Gagal memperbarui status kategori", type: "error" });
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

  const handleMemberToggleActive = async (member, nextActive) => {
    const previous = categories;
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        members: (category.members || []).map((item) => (item.id === member.id ? { ...item, isActive: nextActive } : item)),
      })),
    );
    try {
      const res = await apiCall(`/api/admin/team/${member.id}?type=member`, {
        method: "PUT",
        body: JSON.stringify({ type: "member", isActive: nextActive }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.success) {
        throw new Error(json?.error?.message || "Gagal memperbarui status anggota");
      }
    } catch (error) {
      console.error("Error updating member status:", error);
      setCategories(previous);
      setToast({ visible: true, message: "Gagal memperbarui status anggota", type: "error" });
    }
  };

  const prepareMemberPayload = (form, { forUpdate = false } = {}) => {
    const payload = {
      type: "member",
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      name: form.name,
      role: form.role,
      imageUrl: form.imageUrl,
      email: form.email,
      instagram: form.instagram,
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
    { name: "description", label: "Deskripsi", type: "textarea" },
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
    { name: "isActive", label: "Aktif", type: "checkbox" },
  ];

  const persistCategoryOrder = async (nextCategories) => {
    setIsReordering(true);
    try {
      const payload = nextCategories.map((category, index) => ({
        id: category.id,
        order: index,
      }));
      await apiCall("/api/admin/team/reorder", {
        method: "POST",
        body: JSON.stringify({ categories: payload }),
      });
    } catch (error) {
      console.error("Error saving category order:", error);
      setToast({ visible: true, message: "Gagal menyimpan urutan kategori", type: "error" });
      await fetchTeams();
    } finally {
      setIsReordering(false);
    }
  };

  const persistMemberOrder = async (nextCategories) => {
    setIsReordering(true);
    try {
      const payload = nextCategories.flatMap((category) =>
        (category.members || []).map((member, index) => ({
          id: member.id,
          order: index,
          categoryId: category.id,
        })),
      );

      await apiCall("/api/admin/team/reorder", {
        method: "POST",
        body: JSON.stringify({ members: payload }),
      });
    } catch (error) {
      console.error("Error saving member order:", error);
      setToast({ visible: true, message: "Gagal menyimpan urutan anggota", type: "error" });
      await fetchTeams();
    } finally {
      setIsReordering(false);
    }
  };

  const findMemberLocation = (list, memberId) => {
    for (let categoryIndex = 0; categoryIndex < list.length; categoryIndex += 1) {
      const members = list[categoryIndex].members || [];
      const memberIndex = members.findIndex((member) => member.id === memberId);
      if (memberIndex !== -1) {
        return { categoryIndex, memberIndex };
      }
    }
    return null;
  };

  const handleDragStart = ({ active }) => {
    const id = String(active.id || "");
    if (id.startsWith("category-")) {
      setActiveDrag({ id, type: "category" });
    } else if (id.startsWith("member-")) {
      setActiveDrag({ id, type: "member" });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over) {
      setActiveDrag({ id: null, type: null });
      return;
    }

    const activeId = String(active.id || "");
    const overId = String(over.id || "");

    if (activeId.startsWith("category-") && overId.startsWith("category-")) {
      const activeCategoryId = parsePrefixedId(activeId, "category");
      const overCategoryId = parsePrefixedId(overId, "category");
      const activeIndex = categories.findIndex((category) => category.id === activeCategoryId);
      const overIndex = categories.findIndex((category) => category.id === overCategoryId);
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const nextCategories = arrayMove(categories, activeIndex, overIndex);
        setCategories(nextCategories);
        await persistCategoryOrder(nextCategories);
      }
      setActiveDrag({ id: null, type: null });
      return;
    }

    if (activeId.startsWith("member-")) {
      const memberId = parsePrefixedId(activeId, "member");
      const source = findMemberLocation(categories, memberId);
      if (!source) {
        setActiveDrag({ id: null, type: null });
        return;
      }

      let targetCategoryIndex = source.categoryIndex;
      let targetMemberIndex = source.memberIndex;

      if (overId.startsWith("member-")) {
        const overMemberId = parsePrefixedId(overId, "member");
        const target = findMemberLocation(categories, overMemberId);
        if (!target) {
          setActiveDrag({ id: null, type: null });
          return;
        }
        targetCategoryIndex = target.categoryIndex;
        targetMemberIndex = target.memberIndex;
      } else if (overId.startsWith("category-drop-")) {
        const dropCategoryId = parsePrefixedId(overId, "category-drop");
        const targetIndex = categories.findIndex((category) => category.id === dropCategoryId);
        if (targetIndex === -1) {
          setActiveDrag({ id: null, type: null });
          return;
        }
        targetCategoryIndex = targetIndex;
        targetMemberIndex = (categories[targetIndex].members || []).length;
      } else {
        setActiveDrag({ id: null, type: null });
        return;
      }

      if (source.categoryIndex === targetCategoryIndex && source.memberIndex === targetMemberIndex) {
        setActiveDrag({ id: null, type: null });
        return;
      }

      const nextCategories = categories.map((category) => ({
        ...category,
        members: [...(category.members || [])],
      }));

      const [movedMember] = nextCategories[source.categoryIndex].members.splice(source.memberIndex, 1);

      if (source.categoryIndex === targetCategoryIndex && targetMemberIndex > source.memberIndex) {
        targetMemberIndex -= 1;
      }

      const targetCategory = nextCategories[targetCategoryIndex];
      movedMember.categoryId = targetCategory.id;
      targetCategory.members.splice(targetMemberIndex, 0, movedMember);

      setCategories(nextCategories);
      await persistMemberOrder(nextCategories);
      setActiveDrag({ id: null, type: null });
      return;
    }

    setActiveDrag({ id: null, type: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Team Management</h1>
          <p className="text-sm text-zinc-600">Kelola kategori tim dan anggota secara terpadu.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openCategoryModal("create")}
            className="px-4 py-2 rounded-md bg-pink-600 text-white text-sm hover:bg-pink-700">
            Tambah Kategori
          </button>
          {isReordering && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-pink-600 border-t-transparent" />
              Menyimpan urutan...
            </div>
          )}
        </div>
      </div>

      {categories.length === 0 && !loading ? (
        <Card>
          <div className="text-sm text-zinc-600">Belum ada data tim.</div>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDrag({ id: null, type: null })}>
          <SortableContext
            items={categories.map((category) => buildCategoryId(category.id))}
            strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {categories.map((category) => {
                const isCollapsed = collapsedIds.includes(category.id);
                const members = category.members || [];
                return (
                  <SortableCategoryCard
                    key={category.id}
                    category={category}
                    collapsed={isCollapsed}
                    onToggle={toggleCategory}
                    onAddMember={() => openMemberModal("create", null, category)}
                    onEdit={() => openCategoryModal("edit", category)}
                    onDelete={() => openCategoryModal("delete", category)}
                    onToggleActive={handleCategoryToggleActive}>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-600 mb-4">
                      <span>Slug: {category.slug}</span>
                      <span>Status: {category.isActive ? "Active" : "Inactive"}</span>
                      <span>Anggota: {members.length}</span>
                    </div>

                    <CategoryDropZone
                      categoryId={category.id}
                      isDragging={activeDrag.type === "member"}
                    />

                    {!isCollapsed && (
                      <div className="space-y-2">
                        {loading ? (
                          <div className="space-y-2">
                            {[1, 2, 3].map((item) => (
                              <div
                                key={item}
                                className="h-12 w-full animate-pulse rounded-lg bg-zinc-100"
                              />
                            ))}
                          </div>
                        ) : members.length === 0 ? (
                          <div className="text-sm text-zinc-500">Belum ada anggota.</div>
                        ) : (
                          <SortableContext
                            items={members.map((member) => buildMemberId(member.id))}
                            strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                              {members.map((member) => (
                                <SortableMemberRow
                                  key={member.id}
                                  member={member}
                                  onEdit={(row) =>
                                    openMemberModal(
                                      "edit",
                                      row,
                                      categories.find((c) => c.id === row.categoryId),
                                    )
                                  }
                                  onDelete={(row) =>
                                    openMemberModal(
                                      "delete",
                                      row,
                                      categories.find((c) => c.id === row.categoryId),
                                    )
                                  }
                                  onToggleActive={handleMemberToggleActive}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        )}
                      </div>
                    )}
                  </SortableCategoryCard>
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeDrag.type === "category" && <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow">{categories.find((category) => buildCategoryId(category.id) === activeDrag.id)?.name || "Kategori"}</div>}
            {activeDrag.type === "member" && (
              <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow">
                {(() => {
                  const memberId = parsePrefixedId(activeDrag.id, "member");
                  const member = categories.flatMap((category) => category.members || []).find((item) => item.id === memberId);
                  return member ? `${member.name} - ${member.role}` : "Anggota";
                })()}
              </div>
            )}
          </DragOverlay>
        </DndContext>
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
            description: "",
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
            role: "",
            imageUrl: "",
            email: "",
            instagram: "",
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
