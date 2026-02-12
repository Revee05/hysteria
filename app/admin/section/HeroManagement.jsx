"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/context/auth-context";
import { MAX_MEDIA_SIZE, MAX_MEDIA_SIZE_MB } from "../../../modules/admin/hero/validators/hero.validator";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import CrudModals from "../../../components/adminUI/Crud.Modals";
import Toast from "../../../components/ui/Toast";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { Help } from "@mui/icons-material";

export default function HeroManagement() {
  const { apiCall, csrfToken } = useAuth();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    source: "",
    title: "",
    description: "",
    isActive: false,
  });
  const [toast, setToast] = useState({ visible: false, message: "", type: "error" });

  // Helpers to update local heroes state without re-fetching all items
  const upsertHeroInState = (hero) => {
    if (!hero) return;
    setHeroes((prev) => {
      const idx = prev.findIndex((h) => String(h.id) === String(hero.id));
      if (idx === -1) return [hero, ...prev];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...hero };
      return copy;
    });
  };

  const removeHeroFromState = (id) => {
    if (id === undefined || id === null) return;
    setHeroes((prev) => prev.filter((h) => String(h.id) !== String(id)));
  };

  const fetchHeroes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/admin/hero", { method: "GET" });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        // API may return either an array or an object { heroes, nextCursor, hasMore }
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
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  const handleCreate = () => {
    setEditingHero(null);
    setFormData({
      source: "",
      title: "",
      description: "",
      isActive: false,
    });
    setModalMode("create");
    setShowModal(true);
  };

  const handleEdit = (hero) => {
    setEditingHero(hero);
    setFormData({
      source: hero.source,
      title: hero.title,
      description: hero.description,
      isActive: hero.isActive,
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiCall(`/api/admin/hero/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => null);
      if (json?.success) {
        // update local state instead of refetching all
        removeHeroFromState(id);
      }
    } catch (error) {
      console.error("Error deleting hero:", error);
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
        // Prefer server-returned updated hero, otherwise toggle locally
        const returned = json.data || json.hero || null;
        if (returned && (returned.id || returned.heroId || returned.recordId)) {
          const updated = returned.hero || returned;
          if (!updated.id && (returned.heroId || returned.recordId)) updated.id = returned.heroId || returned.recordId;
          upsertHeroInState(updated);
        } else {
          setHeroes((prev) => prev.map((h) => (h.id === hero.id ? { ...h, isActive: !h.isActive } : h)));
        }
      } else {
        setToast({ visible: true, message: json?.error?.message || 'Gagal ubah status', type: 'error' });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      setToast({ visible: true, message: 'Gagal ubah status', type: 'error' });
    }
  };

  const confirmDelete = (hero) => {
    setEditingHero(hero);
    setModalMode("delete");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    // Client-side validation: ensure required fields are filled before hitting API
    const errors = validateForm(formData, modalMode);
    if (errors.length) {
      setToast({ visible: true, message: errors.join(" \u2014 "), type: "error" });
      return;
    }
    try {
      const url = editingHero
        ? `/api/admin/hero/${editingHero.id}`
        : "/api/admin/hero";
      const method = editingHero ? "PUT" : "POST";

      let res;
      // Normalize media (File | FileList | array) and use multipart when file present
      const mediaFile = formData.media && (formData.media instanceof File ? formData.media : (formData.media[0] || null));
      if (mediaFile) {
        // enforce configured max size
        if (mediaFile.size && mediaFile.size > MAX_MEDIA_SIZE) {
          setToast({ visible: true, message: `File size must be ${MAX_MEDIA_SIZE_MB} MB or less`, type: "error" });
          return;
        }
        const fd = new FormData();
        fd.append("media", mediaFile);
        // append other fields
        Object.entries(formData).forEach(([k, v]) => {
          if (k === "media") return;
          if (v === undefined || v === null) return;
          fd.append(k, typeof v === "boolean" ? String(v) : v);
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
        res = await apiCall(url, {
          method,
          body: JSON.stringify(formData),
        });
      }
      const json = await res.json().catch(() => null);
      if (json?.success) {
        setShowModal(false);
        // Prefer server-returned hero; otherwise fallback to refetch
        const returned = json.data || json.hero || null;
        if (returned) {
          const heroObj = returned.hero || returned;
          if (!heroObj.id && (returned.recordId || returned.heroId)) heroObj.id = returned.recordId || returned.heroId;
          upsertHeroInState(heroObj);
        } else {
          fetchHeroes();
        }
      }
    } catch (error) {
      console.error("Error saving hero:", error);
    }
  };

  function validateForm(data, mode = "create") {
    if (mode === "delete") return [];
    const errs = [];
    if (!data) return ["Data is missing"];
    if (!data.title || String(data.title).trim() === "") errs.push("Judul wajib");
    else if (String(data.title).trim().length < 3) errs.push("Judul ≥3 karakter");

    if (!data.description || String(data.description).trim() === "") errs.push("Deskripsi wajib");
    else if (String(data.description).trim().length < 10) errs.push("Deskripsi ≥10 karakter");

    // Require either a source URL or an uploaded media file
    if ((!data.source || String(data.source).trim() === "") && !data.media) errs.push("Masukkan URL atau unggah file");

    // If a media file is provided, skip URL validation (upload overrides URL)
    if (data.media) return errs;

    // If source provided, validate URL format (http/https) OR allow stored/local paths
    if (data.source && String(data.source).trim() !== "") {
      const src = String(data.source).trim();
      try {
        const u = new URL(src);
        if (![ "https:"].includes(u.protocol)) {
          errs.push("Gunakan https:// atau path lokal");
        }
      } catch (e) {
        // If URL parsing fails, permit relative/local stored paths like '/uploads/...' or paths without scheme
        const looksLikeLocal = src.startsWith("/") || src.startsWith("uploads/") || !src.includes(":");
        if (!looksLikeLocal) {
          errs.push("URL tidak valid. Gunakan https:// atau path lokal");
        }
      }
    }
    return errs;
  }

  const columns = [
    { field: "id", headerName: "ID", freeze: true, render: hero => <div className="text-sm text-zinc-700">{hero.id}</div> },

    { field: "title", headerName: "Title", freeze: true, render: hero => <div className="font-medium text-zinc-900">{hero.title}</div> },

    { field: "description", headerName: "Description", render: hero => (
        <div className="text-sm text-zinc-600 max-w-md truncate">{hero.description}</div>
      )
    },

    { field: "source", headerName: "Source", render: hero => (
        <div className="text-xs text-zinc-500 max-w-xs truncate">{hero.source}</div>
      )
    },

    { field: "isActive", headerName: "Status", render: hero => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          hero.isActive ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"
        }`}>
          {hero.isActive ? "Active" : "Inactive"}
        </span>
      )
    },

    { field: "actions", headerName: "Actions", render: hero => (
        <div className="flex gap-2">
          <Tooltip title={hero.isActive ? "Set inactive" : "Set active"}>
            <IconButton size="small" color={hero.isActive ? "success" : "default"} onClick={e => { e.stopPropagation(); handleToggleStatus(hero); }}>
              {hero.isActive ? <ToggleOnIcon fontSize="small" /> : <ToggleOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={e => { e.stopPropagation(); handleEdit(hero); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); confirmDelete(hero); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-zinc-900 truncate">
              Hero Management
            </h2>
            <p className="mt-1 text-sm text-zinc-500 truncate">
              Manage heroes for your homepage
            </p>
            <p className="mt-2 text-xs text-rose-400">
              note: hanya 1 hero yang boleh active!
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
      </Card>

      <CrudModals
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={editingHero ? (modalMode === "delete" ? "Delete Hero" : "Edit Hero Section") : "Create Hero Section"}
        size="lg"
        fields={
          [
            {
              name: "source",
              label: "Source URL",
              type: "text",
              placeholder: "https://example.com/(video.mp4/image.jpg)",
              required: false,
              validation: "Masukkan video URL publik (https). (hapus URL jika ingin mengupload file)",
            },
            {
              name: "media",
              label: "Upload Media",
              type: "file",
              accept: "image/*,video/*",
              multiple: false,
              placeholder: "",
              validation: `Maks ${MAX_MEDIA_SIZE_MB} MB. Jika ada URL, tidak perlu upload.`,
            },
          { name: "title", label: "Title", type: "text", placeholder: "Enter hero title", required: true, validation: 'Minimal 3 karakter.' },
          { name: "description", label: "Short Description", type: "textarea", placeholder: "Enter hero description", required: true, validation: 'Minimal 10 karakter.' },
          { name: "isActive", label: "Active", type: "checkbox", placeholder: "Set as active hero section" },
        ]}
        initialData={formData}
        onSubmit={async (data) => {
          // Validate before attempting API call
          const errors = validateForm(data, modalMode);
          if (errors.length) {
            setToast({ visible: true, message: errors.join(" \u2014 "), type: "error" });
            return false;
          }

          try {
            const url = editingHero ? `/api/admin/hero/${editingHero.id}` : "/api/admin/hero";
            const method = editingHero ? "PUT" : "POST";

            let res;
            // normalize media (File | FileList | array)
            const mediaFile = data.media && (data.media instanceof File ? data.media : (data.media[0] || null));
            if (mediaFile) {
              // enforce configured max size
              if (mediaFile.size && mediaFile.size > MAX_MEDIA_SIZE) {
                setToast({ visible: true, message: `Maks ${MAX_MEDIA_SIZE_MB} MB`, type: "error" });
                return false;
              }

              const fd = new FormData();
              fd.append("media", mediaFile);
              Object.entries(data).forEach(([k, v]) => {
                if (k === "media") return;
                if (v === undefined || v === null) return;
                fd.append(k, typeof v === "boolean" ? String(v) : v);
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
              // Update local state with returned hero when possible
              const returned = json.data || json.hero || null;
              if (returned) {
                const heroObj = returned.hero || returned;
                if (!heroObj.id && (returned.recordId || returned.heroId)) heroObj.id = returned.recordId || returned.heroId;
                upsertHeroInState(heroObj);
                return true;
              }
              // fallback
              fetchHeroes();
              return true;
            }

            // If server responded with validation error, show it and do not close modal
            const serverMsg = json?.error?.message || json?.message || (json?.error && typeof json.error === 'string' ? json.error : null);
            if (json && !json.success) {
              setToast({ visible: true, message: serverMsg || "Server menolak input", type: "error" });
              return false;
            }
            return true;
          } catch (error) {
            console.error("Error saving hero:", error);
            setToast({ visible: true, message: "Gagal menyimpan. Periksa input.", type: "error" });
            return false;
          }
        }}
        onDelete={async () => {
          if (!editingHero) return;
          await handleDelete(editingHero.id);
        }}
      />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  );
}
