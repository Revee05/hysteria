"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../lib/context/auth-context";
import {
  MAX_MEDIA_SIZE,
  MAX_MEDIA_SIZE_MB,
} from "../../../../modules/admin/hero/validators/hero.validator";
import Card from "../../../../components/ui/Card";
import DataTable from "../../../../components/ui/DataTable";
import CrudModals from "../../../../components/adminUI/Crud.Modals";
import Toast from "../../../../components/ui/Toast";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

export default function HeroManagement() {
  const { apiCall, csrfToken } = useAuth();

  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: false,
    media: null,
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "error",
  });

  const upsertHeroInState = useCallback((hero) => {
    if (!hero) return;
    setHeroes((prev) => {
      const idx = prev.findIndex((item) => String(item.id) === String(hero.id));
      if (idx === -1) return [hero, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...hero };
      return copy;
    });
  }, []);

  const removeHeroFromState = useCallback((id) => {
    if (id === undefined || id === null) return;
    setHeroes((prev) => prev.filter((item) => String(item.id) !== String(id)));
  }, []);

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/hero", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        const payload = json.data;
        if (Array.isArray(payload)) {
          setHeroes(payload);
        } else if (payload && Array.isArray(payload.heroes)) {
          setHeroes(payload.heroes);
        } else {
          setHeroes([]);
        }
      }
    } catch (error) {
      console.error("Error fetching heroes:", error);
      setToast({ visible: true, message: "Gagal memuat hero", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  const handleCreate = () => {
    setEditingHero(null);
    setFormData({ title: "", description: "", isActive: false, media: null });
    setModalMode("create");
    setShowModal(true);
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      description: hero.description,
      isActive: hero.isActive,
      media: null,
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiCall(`/api/admin/hero/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        removeHeroFromState(id);
        setToast({
          visible: true,
          message: "Hero berhasil dihapus",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting hero:", error);
      setToast({
        visible: true,
        message: "Gagal menghapus hero",
        type: "error",
      });
    }
  };

  const handleToggleStatus = async (hero) => {
    try {
      const res = await apiCall(`/api/admin/hero/${hero.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !hero.isActive }),
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        const returned = json.data || json.hero || null;
        if (returned && (returned.id || returned.heroId || returned.recordId)) {
          const updated = returned.hero || returned;
          if (!updated.id && (returned.heroId || returned.recordId))
            updated.id = returned.heroId || returned.recordId;
          upsertHeroInState(updated);
        } else {
          setHeroes((prev) =>
            prev.map((item) =>
              item.id === hero.id
                ? { ...item, isActive: !item.isActive }
                : item,
            ),
          );
        }
      } else {
        setToast({
          visible: true,
          message: json?.error?.message || "Gagal ubah status",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      setToast({ visible: true, message: "Gagal ubah status", type: "error" });
    }
  };

  const confirmDelete = (hero) => {
    setEditingHero(hero);
    setModalMode("delete");
    setShowModal(true);
  };

  function validateForm(data, mode = "create") {
    if (mode === "delete") return [];
    const errs = [];
    if (!data) return ["Data is missing"];

    if (!data.title || String(data.title).trim() === "")
      errs.push("Judul wajib");
    else if (String(data.title).trim().length < 3)
      errs.push("Judul minimal 3 karakter");

    if (!data.description || String(data.description).trim() === "")
      errs.push("Deskripsi wajib");
    else if (String(data.description).trim().length < 10)
      errs.push("Deskripsi minimal 10 karakter");

    // Media file is mandatory for creation, but optional for updates
    if (mode === "create" && !data.media) {
      errs.push("Wajib mengunggah file media (gambar/video)");
    }

    return errs;
  }

  const columns = [
    {
      field: "id",
      headerName: "ID",
      freeze: true,
      render: (hero) => <div className="text-sm text-zinc-700">{hero.id}</div>,
    },
    {
      field: "title",
      headerName: "Title",
      freeze: true,
      render: (hero) => (
        <div className="font-medium text-zinc-900">{hero.title}</div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      render: (hero) => (
        <div className="max-w-md truncate text-sm text-zinc-600">
          {hero.description}
        </div>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      render: (hero) => (
        <div className="max-w-xs truncate text-xs text-zinc-500">
          {hero.source}
        </div>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      render: (hero) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${hero.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"}`}
        >
          {hero.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: "160px",
      render: (hero) => (
        <div className="flex gap-2">
          <Tooltip title={hero.isActive ? "Set inactive" : "Set active"}>
            <IconButton
              size="small"
              color={hero.isActive ? "success" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(hero);
              }}
            >
              {hero.isActive ? (
                <ToggleOnIcon fontSize="small" />
              ) : (
                <ToggleOffIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Metadata">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(hero);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(hero);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold text-zinc-900">
            Hero Management
          </h2>
          <p className="mt-1 truncate text-sm text-zinc-500">
            Manage heroes for your homepage
          </p>
          <p className="mt-2 text-xs text-rose-400">
            Note: hanya 1 hero yang boleh active.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            size="small"
            fullWidth
            onClick={handleCreate}
          >
            Add Hero
          </Button>
        </div>
      </div>

      <DataTable
        rows={heroes}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
      />

      <CrudModals
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={
          editingHero
            ? modalMode === "delete"
              ? "Delete Hero"
              : "Edit Hero Section"
            : "Create Hero Section"
        }
        size="lg"
        fields={[
          {
            name: "media",
            label: "Upload Media (Gambar/Video)",
            type: "file",
            accept: "image/*,video/*",
            multiple: false,
            placeholder: "",
            validation: `Maks ${MAX_MEDIA_SIZE_MB} MB, 5 MB untuk video atau 2 MB untuk gambar`,
          },
          {
            name: "title",
            label: "Title",
            type: "text",
            placeholder: "Enter hero title",
            required: true,
            validation: "Minimal 3 karakter.",
          },
          {
            name: "description",
            label: "Short Description",
            type: "textarea",
            placeholder: "Enter hero description",
            required: true,
            validation: "Minimal 10 karakter.",
          },
          {
            name: "isActive",
            label: "Active",
            type: "checkbox",
            placeholder: "Set as active hero section",
          },
        ]}
        initialData={formData}
        onSubmit={async (data) => {
          const errors = validateForm(data, modalMode);
          if (errors.length) {
            setToast({
              visible: true,
              message: errors.join(" - "),
              type: "error",
            });
            return false;
          }

          try {
            const url = editingHero
              ? `/api/admin/hero/${editingHero.id}`
              : "/api/admin/hero";
            const method = editingHero ? "PUT" : "POST";

            let res;
            const mediaFile =
              data.media &&
              (data.media instanceof File ? data.media : data.media[0] || null);
            if (mediaFile) {
              if (mediaFile.size && mediaFile.size > MAX_MEDIA_SIZE) {
                setToast({
                  visible: true,
                  message: `Maks ${MAX_MEDIA_SIZE_MB} MB`,
                  type: "error",
                });
                return false;
              }

              const fd = new FormData();
              fd.append("media", mediaFile);
              Object.entries(data).forEach(([key, value]) => {
                if (key === "media") return;
                if (value === undefined || value === null) return;
                fd.append(
                  key,
                  typeof value === "boolean" ? String(value) : value,
                );
              });

              res = await fetch(url, {
                method,
                body: fd,
                credentials: "include",
                headers: {
                  "x-csrf-token": csrfToken || "",
                },
              });
            } else {
              res = await apiCall(url, { method, body: JSON.stringify(data) });
            }

            const json = await res.json().catch(() => null);
            if (json?.success) {
              const returned = json.data || json.hero || null;
              if (returned) {
                const heroObj = returned.hero || returned;
                if (!heroObj.id && (returned.recordId || returned.heroId))
                  heroObj.id = returned.recordId || returned.heroId;
                upsertHeroInState(heroObj);
                return true;
              }
              fetchHeroes();
              return true;
            }

            const serverMsg =
              json?.error?.message ||
              json?.message ||
              (json?.error && typeof json.error === "string"
                ? json.error
                : null);
            if (json && !json.success) {
              setToast({
                visible: true,
                message: serverMsg || "Server menolak input",
                type: "error",
              });
              return false;
            }
            return true;
          } catch (error) {
            console.error("Error saving hero:", error);
            setToast({
              visible: true,
              message: "Gagal menyimpan. Periksa input.",
              type: "error",
            });
            return false;
          }
        }}
        onDelete={async () => {
          if (!editingHero) return;
          await handleDelete(editingHero.id);
        }}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((current) => ({ ...current, visible: false }))}
      />
    </Card>
  );
}
