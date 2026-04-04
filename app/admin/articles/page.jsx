"use client";

import { useEffect, useState } from "react";
import TableAdmin from "@/components/adminUI/Table";
import ArticleForm from "@/components/adminUI/Article/ArticleForm";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [view, setView] = useState("list"); // 🔥 SPA CONTROL
  const [selectedId, setSelectedId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [meta, setMeta] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  //////////////////////////////////////////////////////
  // SEARCH DEBOUNCE
  //////////////////////////////////////////////////////
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  //////////////////////////////////////////////////////
  // FETCH CATEGORY
  //////////////////////////////////////////////////////
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories/artikel");
        const json = await res.json();

        if (json.success) {
          setCategories(json.data.items);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  //////////////////////////////////////////////////////
  // FETCH ARTICLE
  //////////////////////////////////////////////////////
  const fetchArticles = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page,
        limit,
        search,
        category: typeFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/articles?${params}`);

      if (!res.ok) throw new Error("Gagal mengambil data artikel");

      const json = await res.json();

      setArticles(json.data.data);
      setMeta(json.data.meta);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search, typeFilter, statusFilter]);

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////
  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    await fetch(`/api/admin/articles/${id}`, {
      method: "DELETE",
    });

    fetchArticles();
  };

  //////////////////////////////////////////////////////
  // EDIT (FIXED)
  //////////////////////////////////////////////////////
  const handleEdit = async (id) => {
    try {
      setLoadingEdit(true);

      const res = await fetch(`/api/admin/articles/${id}`);
      const data = await res.json();

      setSelectedId(id);
      setEditData(data.data);

      setView("edit"); // 🔥 pindah view
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEdit(false);
    }
  };

  //////////////////////////////////////////////////////
  // TABLE COLUMN
  //////////////////////////////////////////////////////
  const columns = [
    {
      key: "thumbnail",
      label: "Thumbnail",
      align: "center",
      render: (row) => {
        const image =
          row.featuredImage ||
          row.thumbnail ||
          row.image ||
          row.media?.[0]?.url;

        return (
          <div className="flex justify-center">
            {image ? (
              <img
                src={
                  image.startsWith("http")
                    ? image
                    : `http://localhost:3000${image}`
                }
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-400 rounded">
                No Image
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Judul",
      render: (row) => (
        <p className="font-medium text-black line-clamp-2">{row.title}</p>
      ),
    },
    {
      key: "categories",
      label: "Kategori",
      align: "center",
      render: (row) => (
        <div className="flex flex-wrap justify-center gap-1">
          {row.categories?.map((cat) => (
            <span
              key={cat.id}
              className="px-2 py-1 text-xs rounded bg-pink-100 text-pink-700"
            >
              {cat.title}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "views",
      label: "Views",
      align: "center",
      render: (row) => <>👁 {row.views || 0}</>,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => {
        const statusStyle = {
          DRAFT: "bg-yellow-100 text-yellow-700",
          PUBLISHED: "bg-emerald-100 text-emerald-700",
          SCHEDULED: "bg-gray-200 text-gray-700",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusStyle[row.status]
            }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handleEdit(row.id)}
            className="bg-[#413153] hover:bg-[#2d2239] text-white px-3 py-1 rounded text-xs"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(row.id)}
            className="bg-[#E83C91] hover:bg-[#c22e75] text-white px-3 py-1 rounded text-xs"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////
  return (
    <div className="p-6 min-h-screen bg-white space-y-6 rounded-lg shadow-sm">
      {/* ================= LIST ================= */}
      {view === "list" && (
        <>
          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold text-black">Artikel</h1>
            <p className="text-gray-600 mt-1">
              Kelola semua artikel dan konten website.
            </p>
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 w-full md:w-[220px]
      focus:outline-none focus:ring-2 focus:ring-pink-500 shadow-sm"
              />

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 w-full md:min-w-[180px]
      focus:ring-2 focus:ring-pink-500 bg-white shadow-sm"
              >
                <option value="">Jenis Artikel</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.title}>
                    {cat.title}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 text-gray-700 rounded-lg px-4 py-2 w-full md:min-w-[180px]
      focus:ring-2 focus:ring-pink-500 bg-white shadow-sm"
              >
                <option value="">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <button
              onClick={() => setView("create")}
              className="hover:bg-[#2d2239]
    px-4 py-2 bg-pink-600 text-white rounded-lg
    transition-colors shadow-sm
    w-full md:w-auto"
            >
              + Tambah Artikel
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white overflow-hidden">
        {error && <div className="p-4 text-red-600">{error}</div>}

        <TableAdmin columns={columns} data={articles} loading={loading} />

        {/* PAGINATION FIX */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700
            bg-white hover:bg-gray-100 transition
            disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {meta.page} of {meta.totalPages}
          </span>

          <button
            disabled={page === meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700
            bg-white hover:bg-gray-100 transition
            disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        </div>
        </>
      )}

      {/* ================= CREATE ================= */}
      {view === "create" && (
        <ArticleForm
          categories={categories}
          mode="create"
          onSubmit={async (formData) => {
            await fetch("/api/admin/articles", {
              method: "POST",
              body: formData,
            });

            setView("list");
            fetchArticles();
          }}
          onClose={() => setView("list")}
        />
      )}

      {/* ================= EDIT ================= */}
      {view === "edit" && (
        <>
          {loadingEdit ? (
            <div>Loading...</div>
          ) : (
            <ArticleForm
              initialData={editData}
              categories={categories}
              mode="edit"
              onSubmit={async (formData) => {
                await fetch(`/api/admin/articles/${selectedId}`, {
                  method: "PUT",
                  body: formData,
                });

                setView("list");
                fetchArticles();
              }}
              onClose={() => setView("list")}
            />
          )}
        </>
      )}
    </div>
  );
}
