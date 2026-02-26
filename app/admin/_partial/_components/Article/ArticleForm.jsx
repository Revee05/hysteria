"use client";

import { useState, useEffect } from "react";
import ArticlePreviewModal from "./ArticlePreviewModal";
import dynamic from "next/dynamic";

const TextEditor = dynamic(
  () =>
    import("@/components/tiptap-templates/simple/simple-editor").then(
      (mod) => mod.SimpleEditor,
    ),
  { ssr: false },
);

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export default function ArticleForm({
  initialData,
  categories = [],
  onSubmit,
  loading,
  mode = "create",
}) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: { type: "doc", content: [{ type: "paragraph" }] },
    excerpt: "",
    categoryIds: [],
    authorName: "",
    editorName: "",
    tagNames: [],
    publishedAt: "",
    featuredImageFile: null,
    featuredImagePreview: "",
  });

  const [openCategory, setOpenCategory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (!initialData) return;

    setForm({
      title: initialData.title || "",
      slug: initialData.slug || "",
      content:
        typeof initialData.content === "string"
          ? JSON.parse(initialData.content)
          : initialData.content,

      excerpt: initialData.excerpt || "",
      categoryIds: initialData.categories?.map((c) => c.categoryId) || [],
      authorName: initialData.authorName || "",
      editorName: initialData.editorName || "",
      tagNames: initialData.tags?.map((t) => t.tag.name) || [],
      publishedAt: initialData.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : "",
      featuredImageFile: null,
      featuredImagePreview: initialData.featuredImage || "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTag = () => {
    const value = newTag.trim().toLowerCase();
    if (!value) return;

    if (!form.tagNames.includes(value)) {
      setForm((prev) => ({
        ...prev,
        tagNames: [...prev.tagNames, value],
      }));
    }

    setNewTag("");
  };

  const removeTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tagNames: prev.tagNames.filter((t) => t !== tag),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Maksimal ukuran 3MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      featuredImageFile: file,
      featuredImagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = (status) => {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("slug", form.slug);
    formData.append("content", JSON.stringify(form.content));
    formData.append("excerpt", form.excerpt || "");
    formData.append("categoryIds", JSON.stringify(form.categoryIds));
    formData.append("authorName", form.authorName);
    formData.append("editorName", form.editorName);
    formData.append("status", status);

    if (form.publishedAt) formData.append("publishedAt", form.publishedAt);

    if (form.featuredImageFile)
      formData.append("featuredImage", form.featuredImageFile);
    formData.append("tagNames", JSON.stringify(form.tagNames));

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">
            {mode === "edit" ? "Edit Artikel" : "Tambah Artikel"}
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Kelola semua artikel dan konten website.
          </p>
        </div>

        <div className="flex gap-3">
          {/* Draft */}
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            className="px-4 py-2 rounded-2xl border border-pink-400 text-pink-500
               transition-all duration-300 ease-out
               hover:bg-pink-50 hover:shadow-lg hover:-translate-y-1
               active:translate-y-0 active:shadow-md active:scale-95"
          >
            Simpan Draft
          </button>

          {/* Preview */}
          <button
            type="button"
            className="px-4 py-2 rounded-2xl border border-pink-400 text-pink-500
               transition-all duration-300 ease-out
               hover:bg-pink-50 hover:shadow-lg hover:-translate-y-1
               active:translate-y-0 active:shadow-md active:scale-95"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>

          {/* Publish */}
          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            className="px-5 py-2 rounded-2xl bg-[#4B3D52] text-white
               transition-all duration-300 ease-out
               hover:bg-[#5c4a65] hover:shadow-xl hover:-translate-y-1
               active:translate-y-0 active:shadow-md active:scale-95"
          >
            {loading ? "Menyimpan..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* TITLE */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2 font-medium">
              Judul Artikel*
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* TEXT EDITOR */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <TextEditor
              content={form.content}
              onUpdate={({ editor }) =>
                setForm((prev) => ({
                  ...prev,
                  content: editor.getJSON(),
                }))
              }
            />
          </div>

          {/* TAGS */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">Tags / Keywords</label>

            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
                placeholder="Masukkan tag"
              />

              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-[#4B3D52] text-white rounded-lg"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {form.tagNames.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded-md text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* CATEGORY */}
          <div className="bg-white p-6 rounded-xl border shadow-sm relative">
            <label className="block font-semibold mb-2">Kategori*</label>

            <button
              type="button"
              onClick={() => setOpenCategory(!openCategory)}
              className="w-full border rounded-lg px-4 py-2 text-left bg-white"
            >
              {form.categoryIds.length === 0
                ? "Pilih kategori"
                : `${form.categoryIds.length} kategori dipilih`}
            </button>

            {openCategory && (
              <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto border rounded-lg bg-white shadow-lg p-3 space-y-2">
                {categories.map((cat) => {
                  const checked = form.categoryIds.includes(cat.id);

                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            categoryIds: checked
                              ? prev.categoryIds.filter((id) => id !== cat.id)
                              : [...prev.categoryIds, cat.id],
                          }));
                        }}
                        className="accent-pink-500"
                      />
                      <span>{cat.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* FEATURED IMAGE */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-3">Foto Utama*</label>

            <div
              className="w-full h-48 border rounded-xl flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 overflow-hidden"
              onClick={() => document.getElementById("featuredInput").click()}
            >
              {form.featuredImagePreview ? (
                <img
                  src={form.featuredImagePreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>Upload Image</span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Recommended: 1200 x 630px
            </p>
            <p className="text-xs text-gray-500">Maksimal Size: 3 MB</p>

            <input
              id="featuredInput"
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">Author Name*</label>
            <input
              name="authorName"
              value={form.authorName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">Editor Name</label>
            <input
              name="editorName"
              value={form.editorName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* SLUG */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* EXCERPT */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              rows={3}
            />
          </div>

          {/* PUBLISH DATE */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <label className="block font-semibold mb-2">
              Tanggal Publikasi
            </label>
            <input
              type="date"
              name="publishedAt"
              value={form.publishedAt}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
        </div>
      </div>
      <ArticlePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        data={form}
      />
    </div>
  );
}
