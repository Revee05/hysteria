"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ArticlesPage({ onNavigate }) {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/articles");

        if (!res.ok) {
          throw new Error("Gagal mengambil data artikel");
        }

        const json = await res.json();
        setArticles(json.data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    await fetch(`/api/admin/articles/${id}`, {
      method: "DELETE",
    });

    setArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const columns = [
    // Thumbnail
    {
      field: "thumbnail",
      headerName: "",
      width: 90,
      render: (row) => (
        <div className="w-14 h-14 rounded-md overflow-hidden bg-zinc-100">
          {row.thumbnail ? (
            <img
              src={row.thumbnail}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-zinc-400">
              No Image
            </div>
          )}
        </div>
      ),
    },

    // Judul
    {
      field: "title",
      headerName: "Judul",
      width: 320,
      render: (row) => (
        <p className="font-semibold text-zinc-800">{row.title}</p>
      ),
    },

    // Status
    {
      field: "status",
      headerName: "Status",
      width: 150,
      align: "center",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "PUBLISHED"
              ? "bg-emerald-100 text-emerald-700"
              : row.status === "DRAFT"
                ? "bg-amber-100 text-amber-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },

    // Kategori
    {
      field: "categories",
      headerName: "Kategori",
      width: 250,
      render: (row) => {
        if (!row.categories || row.categories.length === 0) {
          return "-";
        }

        return (
          <div className="flex flex-wrap gap-1">
            {row.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-md"
              >
                {cat.title}
              </span>
            ))}
          </div>
        );
      },
    },

    // Aksi pakai icon
    {
      field: "actions",
      headerName: "Aksi",
      width: 120,
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.push(`/admin/articles/${row.id}/edit`)}
            className="text-blue-600 hover:text-blue-800 transition"
          >
            <EditIcon fontSize="small" />
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800 transition"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">Artikel</h1>
          <p className="text-sm text-zinc-600 mt-1">
            Kelola semua artikel dan konten website.
          </p>
        </div>

        <button
          onClick={() => onNavigate("article.create")}
          className="px-5 py-2.5 rounded-lg bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition"
        >
          Tambah Artikel
        </button>
      </div>

      <Card>
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}

        <DataTable
          columns={columns}
          rows={articles}
          loading={loading}
          getRowId={(row) => row.id}
        />
      </Card>
    </div>
  );
}
