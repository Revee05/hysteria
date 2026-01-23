"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../lib/context/auth-context";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import CrudModals from "../../../components/adminUI/Crud.Modals";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
    source: "",
    title: "",
    description: "",
    isActive: false,
  });

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
        fetchHeroes();
      }
    } catch (error) {
      console.error("Error deleting hero:", error);
    }
  };

  const confirmDelete = (hero) => {
    setEditingHero(hero);
    setModalMode("delete");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const url = editingHero
        ? `/api/admin/hero/${editingHero.id}`
        : "/api/admin/hero";
      const method = editingHero ? "PUT" : "POST";

      let res;
      // If a file was attached use multipart/form-data
      if (formData.media && formData.media instanceof File) {
        const fd = new FormData();
        fd.append("file", formData.media);
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
        fetchHeroes();
      }
    } catch (error) {
      console.error("Error saving hero:", error);
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      freeze: true,
      render: (hero) => (
        <div className="text-sm text-zinc-700">{hero.id}</div>
      ),
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
        <div className="text-sm text-zinc-600 max-w-md truncate">
          {hero.description}
        </div>
      ),
    },
    {
      field: "source",
      headerName: "Source",
      render: (hero) => (
        <div className="text-xs text-zinc-500 max-w-xs truncate">
          {hero.source}
        </div>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      render: (hero) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            hero.isActive
              ? "bg-green-50 text-green-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {hero.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      render: (hero) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
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
        fields={[
          { name: "source", label: "Source URL", type: "text", placeholder: "https://example.com/video.mp4", required: false, help: "Enter video or image URL (or upload below)" },
          { name: "media", label: "Upload Media", type: "file", placeholder: "", help: "Upload image or video instead of URL" },
          { name: "title", label: "Title", type: "text", placeholder: "Enter hero title", required: true },
          { name: "description", label: "Description", type: "textarea", placeholder: "Enter hero description", required: true },
          { name: "isActive", label: "Active", type: "checkbox", placeholder: "Set as active hero section" },
        ]}
        initialData={formData}
        onSubmit={async (data) => {
          try {
            const url = editingHero ? `/api/admin/hero/${editingHero.id}` : "/api/admin/hero";
            const method = editingHero ? "PUT" : "POST";

            let res;
            if (data.media && data.media instanceof File) {
              const fd = new FormData();
              fd.append("file", data.media);
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
            if (json?.success) fetchHeroes();
          } catch (error) {
            console.error("Error saving hero:", error);
          }
        }}
        onDelete={async () => {
          if (!editingHero) return;
          await handleDelete(editingHero.id);
        }}
      />
    </div>
  );
}
