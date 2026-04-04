"use client";

import { useState, useEffect } from "react";

import { ArrowLeft } from "lucide-react";

import ArticlePreviewModal from "@/components/adminUI/ArticlePreviewModal";
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
  onClose,
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

    // NEW
    featuredImageSource: "",
    references: [],
  });

  const [openCategory, setOpenCategory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const [newTag, setNewTag] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

  function validateForm(status) {
    if (!form.title.trim()) return "Judul artikel wajib diisi";

    if (!form.authorName.trim()) return "Author name wajib diisi";

    if (form.categoryIds.length === 0) return "Kategori harus dipilih";

    if (!form.featuredImageFile && !form.featuredImagePreview)
      return "Foto utama wajib diupload";

    if (!form.featuredImageSource.trim())
      return "Sumber foto/ilustrasi utama wajib diisi";

    if (
      !form.content ||
      !form.content.content ||
      form.content.content.length === 0
    )
      return "Konten artikel belum diisi";

    return null;
  }

  const handleSubmit = (status) => {
    const error = validateForm(status);

    if (error) {
      setErrorMessage(error);

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return;
    }

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

    formData.append("featuredImageSource", form.featuredImageSource);

    const cleanReferences = form.references.filter(
      (r) => r.title?.trim() && r.url?.trim(),
    );

    formData.append("references", JSON.stringify(cleanReferences));
    formData.append("tagNames", JSON.stringify(form.tagNames));

    onSubmit(formData); // 🔥 PENTING
  };

  const previewData = {
    title: form.title,
    content: form.content,
    excerpt: form.excerpt,
    authorName: form.authorName,
    editorName: form.editorName,
    featuredImage: form.featuredImagePreview,
    featuredImageSource: form.featuredImageSource,
    references: form.references,
    publishedAt: form.publishedAt,

    // transform categories
    categories: categories
      .filter((cat) => form.categoryIds.includes(cat.id))
      .map((cat) => ({
        id: cat.id,
        title: cat.title,
      })),

    // transform tags
    tags: form.tagNames.map((tag, index) => ({
      id: index,
      name: tag,
    })),
  };

  useEffect(() => {
    if (!initialData) {
      setEditorReady(true);
      return;
    }

    const selectedCategories = initialData.categories?.map((c) => c.id) || [];

    setForm((prev) => ({
      ...prev,
      title: initialData.title || "",
      slug: initialData.slug || "",
      content:
        typeof initialData.content === "string"
          ? JSON.parse(initialData.content)
          : initialData.content,
      excerpt: initialData.excerpt || "",
      categoryIds: selectedCategories,
      authorName: initialData.authorName || "",
      editorName: initialData.editorName || "",
      tagNames:
        initialData.tags?.map((t) => t?.tag?.name || t?.name).filter(Boolean) ||
        [],
      publishedAt: initialData.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split("T")[0]
        : "",
      featuredImageFile: null,
      featuredImagePreview: initialData.featuredImage || "",
      featuredImageSource: initialData.featuredImageSource || "",
      references: Array.isArray(initialData.references)
        ? initialData.references
        : [],
    }));

    setEditorReady(true);
  }, [initialData]);

  return (
    <>
      {errorMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {errorMessage}
        </div>
      )}
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900">
              {mode === "edit" ? "Edit Artikel" : "Tambah Artikel"}
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Kelola semua artikel dan konten website.
            </p>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* LEFT: BACK BUTTON */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onClose?.()}
                className="flex items-center gap-2 border border-black text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>
            </div>

            {/* RIGHT: ACTION BUTTONS */}
            <div className="flex justify-end gap-3 flex-wrap">

              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 rounded-lg bg-pink-400 border border-white text-white hover:bg-pink-800 transition"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("DRAFT")}
                className="px-4 py-2 rounded-lg border border-pink-300 text-pink-500 hover:bg-pink-100 transition"
              >
                Simpan Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("PUBLISHED")}
                className="px-5 py-2 rounded-lg bg-[#4B3D52] text-white hover:bg-[#5c4a65] transition"
              >
                {loading ? "Menyimpan..." : "Publish"}
              </button>
            </div>
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
              {editorReady && (
                <TextEditor
                  key={initialData?.id}
                  content={
                    form.content || {
                      type: "doc",
                      content: [{ type: "paragraph" }],
                    }
                  }
                  onUpdate={({ editor }) =>
                    setForm((prev) => ({
                      ...prev,
                      content: editor.getJSON(),
                    }))
                  }
                />
              )}
            </div>

            {/* TAGS */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <label className="block font-semibold mb-2">
                Tags / Keywords
              </label>

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

            {/* REFERENCES */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <label className="block font-semibold mb-3">
                Referensi Artikel
              </label>

              {form.references.map((ref, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Judul Referensi"
                    value={ref.title}
                    onChange={(e) => {
                      const refs = [...form.references];
                      refs[index].title = e.target.value;
                      setForm({ ...form, references: refs });
                    }}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />

                  <input
                    placeholder="URL Referensi"
                    value={ref.url}
                    onChange={(e) => {
                      const refs = [...form.references];
                      refs[index].url = e.target.value;
                      setForm({ ...form, references: refs });
                    }}
                    onBlur={(e) => {
                      let value = e.target.value.trim();

                      if (value && !value.startsWith("http")) {
                        value = "https://" + value;
                      }

                      const refs = [...form.references];
                      refs[index].url = value;

                      setForm({ ...form, references: refs });
                    }}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const refs = form.references.filter(
                        (_, i) => i !== index,
                      );
                      setForm({ ...form, references: refs });
                    }}
                    className="px-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    references: [...form.references, { title: "", url: "" }],
                  })
                }
                className="text-sm text-pink-500 mt-2"
              >
                + Tambah Referensi
              </button>
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
                                : [...new Set([...prev.categoryIds, cat.id])],
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

            {/* AUTHOR NAME */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <label className="block font-semibold mb-2">Author Name*</label>
              <input
                name="authorName"
                value={form.authorName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
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

            {/* FEATURED IMAGE SOURCE */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <label className="block font-semibold mb-2">
                Sumber Foto/Ilustrasi Utama*
              </label>

              <input
                name="featuredImageSource"
                value={form.featuredImageSource}
                onChange={handleChange}
                placeholder="Contoh: Photographer Name / Dokumentasi Pribadi"
                className="w-full border rounded-lg px-4 py-2"
              />

              <p className="text-xs text-gray-500 mt-2">
                Cantumkan sumber foto atau ilustrasi utama untuk menjaga
                kredibilitas artikel.
              </p>
            </div>

            {/* EDITOR NAME */}
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

              <p className="text-xs text-gray-500 mt-2">
                Kosongkan untuk publikasi langsung.
              </p>
            </div>
          </div>
        </div>
        <ArticlePreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          data={previewData}
        />
      </div>
    </>
  );
}
