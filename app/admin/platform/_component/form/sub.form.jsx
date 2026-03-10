"use client";

import React, { useState } from "react";
import validateSubForm from "./validator.subform";
import UploadBox from "@/components/adminUI/UploadBox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const META_OPTIONS = [
  { value: "video", label: "Anitalk" },
  { value: "artist", label: "Artist Radar" },
  { value: "mockup", label: "Mockup dan Poster" },
  { value: "komik-ramuan", label: "Komik Ramuan" },
  { value: "homecooked", label: "Homecooked" },
];

export default function SubForm({
  open = false,
  mode = "add",
  initialData = null,
  onClose = () => {},
  onSubmit = () => {},
  saving = false,
  showImageUpload = false,
  showTags = false,
  showInstagram = false,
  showYoutube = false,
  showURL = true,
  showPrevDescription = false,
  showDescription = false,
  showHost = false,
  showGuests = false,
  showMeta = false,
  metaOptions = META_OPTIONS,
  categoryItemSlug = null,
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [year, setYear] = useState(initialData?.year ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [instagram, setInstagram] = useState(initialData?.instagram ?? "");
  const [youtube, setYoutube] = useState(initialData?.youtube ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [prevdescription, setPrevDescription] = useState(
    initialData?.prevdescription ?? "",
   );
  const normalizeInitialMeta = (md) => {
    const m = md ?? "";
    if (m === null || m === undefined || m === "") return "";
    if (typeof m === "object") {
      if (m.cardType) return String(m.cardType);
      if (m.type) return String(m.type);
      if (m.value) return String(m.value);
      try {
        return JSON.stringify(m);
      } catch {
        return String(m);
      }
    }
    return String(m);
  };
  const [meta, setMeta] = useState(normalizeInitialMeta(initialData?.meta));
  const [tags, setTags] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags : [],
  );
  const [tagInput, setTagInput] = useState("");
  const [host, setHost] = useState(initialData?.host ?? "");
  const [guests, setGuests] = useState(
    Array.isArray(initialData?.guests) ? initialData.guests : [],
  );
  const EMPTY_ERRORS = {
    title: "",
    year: "",
    url: "",
    instagram: "",
    youtube: "",
    prevdescription: "",
    description: "",
    host: "",
    guests: "",
    tags: "",
    meta: "",
    image: "",
  };
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [files, setFiles] = useState([]);

  // Character limits (sync with frontend validator)
  const MAX_TITLE = 500;
  const MAX_PREVDESC = 140;
  const MAX_DESCRIPTION = 5000;
  const MAX_HOST = 255;
  const titleLen = String(title ?? "").length;
  const prevdescLen = String(prevdescription ?? "").length;
  const descriptionLen = String(description ?? "").length;
  const hostLen = String(host ?? "").length;

  if (!open) return null;

  function handleAddTag() {
    const t = String(tagInput ?? "").trim();
    if (!t) return;
    if (tags.includes(t)) {
      setErrors((s) => ({ ...s, tags: "Tag sudah ada" }));
      return;
    }
    if (tags.length >= 50) {
      setErrors((s) => ({ ...s, tags: "Maksimal 50 tag" }));
      return;
    }
    if (t.length > 100) {
      setErrors((s) => ({ ...s, tags: "Tag terlalu panjang (maks 100)" }));
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
    setErrors((s) => ({ ...s, tags: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...(initialData ?? {}),
      title: title,
      year: year,
      ...(showURL ? { url: url } : {}),
      ...(showInstagram ? { instagram } : {}),
      ...(showYoutube ? { youtube } : {}),
      ...(showPrevDescription ? { prevdescription } : {}),
      ...(showDescription ? { description } : {}),
      ...(showTags ? { tags: tags } : {}),
      ...(showMeta ? { meta: meta } : {}),
      ...(showHost ? { host } : {}),
      ...(showGuests ? { guests } : {}),
      ...(showImageUpload && files.length > 0 ? { files } : {}),
    };

    // Validate all fields — including file type check — in one pass
    const nextErrors = validateSubForm(payload);

    if (showImageUpload && files.length > 0) {
      const allowed = ["image/webp", "image/jpeg", "image/png"];
      const invalidFile = files.find((f) => !allowed.includes(f.type));
      if (invalidFile) {
        nextErrors.image = "Tipe file tidak diperbolehkan. Hanya webp, jpg/jpeg, png.";
      }
    }

    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some((v) => v && v.length > 0);
    if (hasError) return;

    // All validations passed — save
    setErrors(EMPTY_ERRORS);
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-md shadow-lg w-full max-w-lg md:max-w-2xl mx-4 p-6 z-10 max-h-[90vh] overflow-auto"
      >
        <div className="flex  items-center justify-between mb-4">
          <h3 className="text-lg text-black font-semibold">
            {mode === "add" ? "Create | Post " : "Edit Item"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-lg text-gray-600 hover:text-red-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Judul
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
            placeholder="Title"
            required
          />
          <div className="flex justify-between mt-1 items-center">
            {errors.title ? (
              <p className="text-sm text-red-600">{errors.title}</p>
            ) : (
              <div />
            )}
            <p className={`text-sm ${titleLen > MAX_TITLE ? 'text-red-600' : 'text-gray-500'}`}>{titleLen}/{MAX_TITLE}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tahun
          </label>
          <input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
            placeholder="Tahun"
          />
          {errors.year ? (
            <p className="text-sm text-red-600 mt-1">{errors.year}</p>
          ) : null}
        </div>

        {showURL && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link | URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
              placeholder="gunakan URL youtube, instagram or Gdrive"
            />
            {errors.url ? (
              <p className="text-sm text-red-600 mt-1">{errors.url}</p>
            ) : null}
          </div>
        )}

        {showInstagram && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://instagram.com/..."
            />
            {errors.instagram ? (
              <p className="text-sm text-red-600 mt-1">{errors.instagram}</p>
            ) : null}
          </div>
        )}

        {showYoutube && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube
            </label>
            <input
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
              placeholder="https://youtube.com/..."
            />
            {errors.youtube ? (
              <p className="text-sm text-red-600 mt-1">{errors.youtube}</p>
            ) : null}
          </div>
        )}

        {showPrevDescription && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preview Deskripsi
            </label>
            <textarea
              value={prevdescription}
              onChange={(e) => setPrevDescription(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2 resize-y min-h-[100px]"
              placeholder="Preview deskripsi konten..."
            />
            <div className="flex justify-between mt-1 items-center">
              {errors.prevdescription ? (
                <p className="text-sm text-red-600">{errors.prevdescription}</p>
              ) : (
                <div />
              )}
              <p className={`text-sm ${prevdescLen > MAX_PREVDESC ? 'text-red-600' : 'text-gray-500'}`}>{prevdescLen}/{MAX_PREVDESC}</p>
            </div>
          </div>
        )}

        {showDescription && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2 resize-y min-h-[100px]"
              placeholder="Deskripsi konten..."
            />
            <div className="flex justify-between mt-1 items-center">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <div />
              )}
              <p className={`text-sm ${descriptionLen > MAX_DESCRIPTION ? 'text-red-600' : 'text-gray-500'}`}>{descriptionLen}/{MAX_DESCRIPTION}</p>
            </div>
          </div>
        )}

        {showMeta && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta
            </label>
            {metaOptions &&
            Array.isArray(metaOptions) &&
            metaOptions.length > 0 ? (
              <select
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Pilih meta</option>
                {metaOptions.map((opt, idx) => (
                  <option
                    key={idx}
                    value={typeof opt === "string" ? opt : opt.value}
                  >
                    {typeof opt === "string" ? opt : opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={meta}
                onChange={(e) => setMeta(e.target.value)}
                className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
                placeholder="Meta (JSON atau teks bebas)"
              />
            )}
            {errors.meta ? (
              <p className="text-sm text-red-600 mt-1">{errors.meta}</p>
            ) : null}
          </div>
        )}

        {showTags && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex text-white items-center gap-2 px-3 py-1 bg-pink-500 text-sm rounded-lg"
                >
                  <span className="select-none">{t}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setTags((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-white cursor-pointer hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 text-black border border-gray-300 rounded-md px-3 py-2"
                placeholder="ketik tag lalu tekan Enter atau klik +"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3 py-2 text-green-500 border border-green-500 rounded-md hover:bg-green-500 hover:text-white"
              >
                +
              </button>
            </div>
            {errors.tags ? (
              <p className="text-sm text-red-600 mt-1">{errors.tags}</p>
            ) : null}
          </div>
        )}
        {showHost && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host
            </label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full text-black border border-gray-300 rounded-md px-3 py-2"
              placeholder="Nama host"
            />
            <div className="flex justify-between mt-1 items-center">
              {errors.host ? (
                <p className="text-sm text-red-600">{errors.host}</p>
              ) : (
                <div />
              )}
              <p className={`text-sm ${hostLen > MAX_HOST ? 'text-red-600' : 'text-gray-500'}`}>{hostLen}/{MAX_HOST}</p>
            </div>
          </div>
        )}

        {showGuests && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guests
            </label>
            <div className="space-y-2">
              {guests.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={g}
                    onChange={(e) =>
                      setGuests((prev) =>
                        prev.map((p, idx) => (idx === i ? e.target.value : p)),
                      )
                    }
                    className="flex-1 text-black border border-gray-300 rounded-md px-3 py-2"
                    placeholder={`Guest ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setGuests((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="px-2 py-1 bg-red-100 text-red-600 rounded cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  onClick={() => setGuests((prev) => [...prev, ""])}
                  className="px-3 py-2 text-green-500 rounded-md bg-white border border-green-500 hover:bg-green-500 hover:text-white cursor-pointer"
                >
                  Add guest
                </button>
              </div>
            </div>
          </div>
        )}

        {showImageUpload && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gambar
            </label>
            <UploadBox
              files={files}
              setFiles={setFiles}
              existingUrl={
                mode === "edit" && initialData?.images?.[0]?.imageUrl
                  ? initialData.images[0].imageUrl
                  : null
              }
              maxSizeMB={10}
              accept="image/webp,image/jpeg,image/png"
            />
            {errors.image ? (
              <p className="text-sm text-red-600 mt-1">{errors.image}</p>
            ) : null}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setErrors(EMPTY_ERRORS);
              setFiles([]);
              setDescription(initialData?.description ?? "");
              setTags(Array.isArray(initialData?.tags) ? initialData.tags : []);
              setTagInput("");
              setMeta(normalizeInitialMeta(initialData?.meta));
              onClose();
            }}
            disabled={saving}
            className="px-3 py-2 text-zinc-600 rounded-lg border border-red-500 hover:bg-red-500 hover:text-white cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 rounded-lg bg-[#43334C] text-white hover:bg-[#2e2237] cursor-pointer disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
