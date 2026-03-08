import {
  CheckCircle2,
  CircleAlert,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Menu,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef } from "react";

export default function EditorSection({
  title,
  items,
  selectedIndex,
  onSelect,
  onReorder,
  form,
  onChange,
  onAdd,
  onSave,
  onDelete,
  showSubTitle = true,
  showImageUrlField = false,
  imageNote,
  imageSize,
  onUploadImage,
  uploadingImage = false,
  uploadFeedback = { status: "idle", message: "" },
}) {
  const fileInputRef = useRef(null);

  const handleSelectFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadImage) return;

    await onUploadImage(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-lg border border-[#9c9c9c] bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.08)] md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#111]">{title}</h2>
        <button
          onClick={onAdd}
          className="cursor-pointer rounded-lg bg-[#4b3556] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#3b2746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89fda]"
        >
          Tambah
        </button>
      </div>

      <div className="mb-5 space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className={`flex items-center gap-4 rounded-md border px-2 py-2 transition ${
              selectedIndex === index
                ? "border-[#ea4c9d] bg-[#fff0f8]"
                : "border-transparent hover:border-[#d5c8dc] hover:bg-[#f8f5fa]"
            }`}
          >
            <button
              onClick={() => onSelect(index)}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center text-white transition ${
                selectedIndex === index ? "bg-[#ea4c9d]" : "bg-[#ada6b4] hover:bg-[#8e8498]"
              }`}
            >
              <Menu size={22} />
            </button>

            <button
              onClick={() => onReorder(index)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center bg-[#ada6b4] text-white transition hover:bg-[#8e8498]"
            >
              {index === 0 ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>

            <button
              onClick={() => onSelect(index)}
              className={`cursor-pointer text-left text-lg transition ${selectedIndex === index ? "font-semibold text-[#ea4c9d]" : "text-[#333] hover:text-[#7b5f8a]"}`}
            >
              {item}
            </button>
          </div>
        ))}
      </div>

      <div className="ml-0 rounded-lg border border-[#b6b6b6] bg-white p-4 md:ml-12 md:max-w-[860px]">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-lg font-medium text-[#333]">Title</label>
            <input
              type="text"
              value={form.title || ""}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-[#8f8f8f] px-4 py-3 outline-none focus:border-[#ea4c9d]"
            />
          </div>

          {showSubTitle && (
            <div>
              <label className="mb-2 block text-lg font-medium text-[#333]">Sub Title</label>
              <textarea
                rows={3}
                value={form.subTitle || ""}
                onChange={(e) => onChange({ ...form, subTitle: e.target.value })}
                className="w-full rounded-xl border border-[#8f8f8f] px-4 py-3 outline-none focus:border-[#ea4c9d]"
              />
            </div>
          )}

          {showImageUrlField && (
            <div>
              <label className="mb-2 block text-lg font-medium text-[#333]">Image URL</label>
              <input
                type="text"
                value={form.imageUrl || ""}
                onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full rounded-xl border border-[#8f8f8f] px-4 py-3 outline-none focus:border-[#ea4c9d]"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-lg font-medium text-[#333]">Tumbnail</label>

            <div className="w-full max-w-[360px] rounded-lg border border-[#9d9d9d] bg-white p-4">
              {form.imageUrl ? (
                <div
                  className="mb-4 h-[120px] w-[120px] rounded-lg border border-[#9d9d9d] bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.imageUrl})` }}
                  role="img"
                  aria-label={form.title || "Thumbnail"}
                />
              ) : (
                <div className="mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-lg border border-[#9d9d9d] bg-[#f7f7f7]">
                  <ImageIcon size={24} className="text-[#666]" />
                </div>
              )}

              <div className="flex flex-wrap items-end gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectFile}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#9d9d9d] bg-white px-4 py-2 text-sm text-[#333] transition hover:border-[#ea4c9d] hover:bg-[#fff0f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b3d2] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload size={16} />
                  {uploadingImage ? "Mengunggah..." : "Upload Foto"}
                </button>

                {uploadFeedback.status === "uploading" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ece7ef] px-3 py-1 text-xs font-semibold text-[#4b3556]">
                    <Upload size={12} />
                    Uploading...
                  </span>
                )}

                {uploadFeedback.status === "success" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8ef] px-3 py-1 text-xs font-semibold text-[#1b7a45]">
                    <CheckCircle2 size={12} />
                    Upload Berhasil
                  </span>
                )}

                {uploadFeedback.status === "error" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ffeaea] px-3 py-1 text-xs font-semibold text-[#b22929]">
                    <CircleAlert size={12} />
                    Upload Gagal
                  </span>
                )}

                <div className="text-xs font-medium text-[#333]">
                  <p>{imageNote}</p>
                  <p>{imageSize}</p>
                  {uploadFeedback.message ? <p className="mt-1 text-[#5e4b67]">{uploadFeedback.message}</p> : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onSave}
              className="cursor-pointer rounded-lg bg-[#ea4c9d] px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#d93a8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b3d2]"
            >
              Simpan
            </button>

            <button
              onClick={onDelete}
              className="cursor-pointer rounded-lg bg-[#ea4c9d] p-3 text-white transition hover:bg-[#d93a8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7b3d2]"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
