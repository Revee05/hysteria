/**
 * PageDitampart.jsx
 *
 * Halaman admin untuk mengelola konten platform Hysteria Ditampart.
 * Struktur identik dengan PageArtlab — dua tab (Page Utama + Bagian Hero).
 * Perbedaan: PLATFORM_SLUG, COVER_ITEMS, dan HERO_ITEMS disesuaikan untuk Ditampart.
 */
"use client";

import React, { useState, useEffect } from "react";
import FormMain from "./_component/form.main.jsx";
import FormHero from "./_component/form.hero.jsx";
import PermissionGate from "../../../components/adminUI/PermissionGate.jsx";
import Toast from "../../../components/ui/Toast.jsx";

/** Slug identifier platform di DB dan URL API. */
const PLATFORM_SLUG = "ditampart";

/**
 * Dua slot gambar utama Ditampart — disimpan di tabel PlatformImage dengan type='main'.
 * Menggantikan field `mainImageUrl` tunggal di tabel Platform.
 */
const MAIN_IMAGE_ITEMS = [
  { id: 1, apiKey: "main-1", label: "Gambar Utama kiri", files: [] },
  { id: 2, apiKey: "main-2", label: "Gambar Utama kanan", files: [] },
];

/** Slot cover image Ditampart. `apiKey` harus cocok dengan kolom `key` di tabel PlatformImage. */
const COVER_ITEMS = [
  { id: 1, apiKey: "cover-2", label: "Cover Foto Kegiatan*" },
  { id: 2, apiKey: "cover-3", label: "Cover Mockup dan Poster*" },
  { id: 3, apiKey: "cover-4", label: "Cover Short Film Dokumenter*" },
  { id: 4, apiKey: "cover-5", label: "Cover Event Ditampart*" },
];

/** Slot hero image per sub-halaman Ditampart. title/subtitle adalah nilai default sebelum API dimuat. */
const HERO_ITEMS = [
  { id: 1, apiKey: "hero-mockup-poster",    label: "Hero Page Mock Up dan Poster", title: "", subtitle: "", files: [] },
  { id: 2, apiKey: "hero-event-ditampart",   label: "Hero Page Event Ditampart",    title: "", subtitle: "", files: [] },
];

/** Nilai awal form sebelum data API dimuat. */
const INITIAL_MAIN_FORM = {
  headline: "",
  subHeadline: "",
  instagram: "",
  youtube: "",
  youtubeProfile: "",
};

/** Batas ukuran file upload untuk halaman ini (dalam MB). */
const MAX_SIZE_MB = 2;

export default function PageDitampart() {
  const [active, setActive] = useState("main");  // tab aktif: "main" | "hero"
  const [loading, setLoading] = useState(true);

  // Form teks + file gambar utama
  const [mainForm, setMainForm] = useState(INITIAL_MAIN_FORM);
  const [mainItems, setMainItems] = useState(COVER_ITEMS.map((item) => ({ ...item, files: [] })));
  const [heroItems, setHeroItems] = useState(HERO_ITEMS);

  // Dua slot gambar utama (PlatformImage type='main')
  const [mainImageItems, setMainImageItems] = useState(MAIN_IMAGE_ITEMS);

  const [heroSaving, setHeroSaving] = useState(false);
  const [mainSaving, setMainSaving] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const showToast = (message, type = "info") => setToast({ visible: true, message, type });
  const closeToast = () => setToast((t) => ({ ...t, visible: false }));

  useEffect(() => {
    fetch(`/api/admin/platform/${PLATFORM_SLUG}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.success || !res.data) return;
        const p = res.data;

        setMainForm({
          headline:       p.headline       || "",
          subHeadline:    p.subHeadline    || "",
          instagram:      p.instagram      || "",
          youtube:        p.youtube        || "",
          youtubeProfile: p.youtubeProfile || "",
        });

        const covers = (p.images || []).filter((img) => img.type === "cover");
        setMainItems(COVER_ITEMS.map((item) => {
          const found = covers.find((c) => c.key === item.apiKey);
          return { ...item, files: [], imageUrl: found?.imageUrl || null };
        }));

        const mainImgs = (p.images || []).filter((img) => img.type === "main");
        setMainImageItems(MAIN_IMAGE_ITEMS.map((item) => {
          const found = mainImgs.find((m) => m.key === item.apiKey);
          return { ...item, files: [], imageUrl: found?.imageUrl || null };
        }));

        const heroes = (p.images || []).filter((img) => img.type === "hero");
        setHeroItems(HERO_ITEMS.map((item) => {
          const found = heroes.find((h) => h.key === item.apiKey);
          return { ...item, files: [], title: found?.title || "", subtitle: found?.subtitle || "", imageUrl: found?.imageUrl || null };
        }));
      })
      .catch((err) => console.error("[PageDitampart] Failed to load platform data", err))
      .finally(() => setLoading(false));
  }, []);

  /** Dipanggil saat user memilih/menghapus file di salah satu slot gambar utama. */
  const handleMainImageItemsFilesChange = (id, files, clearImage = false) => {
    setMainImageItems((prev) => prev.map((item) =>
      item.id === id
        ? { ...item, files, ...(clearImage ? { imageUrl: null, pendingClear: true } : {}) }
        : item
    ));
  };

  /**
   * Dipanggil oleh ListCover saat user memilih/menghapus file cover.
   * clearImage=true → tandai pendingClear agar saat save dikirim imageUrl: null ke API.
   */
  const handleMainFilesChange = (id, files, clearImage = false) => {
    setMainItems((prev) => prev.map((item) =>
      item.id === id
        ? { ...item, files, ...(clearImage ? { imageUrl: null, pendingClear: true } : {}) }
        : item
    ));
  };

  /** Dipanggil oleh ListHero saat user memilih/menghapus file hero. */
  const handleHeroFilesChange = (id, files, clearImage = false) => {
    setHeroItems((prev) => prev.map((item) =>
      item.id === id
        ? { ...item, files, dirty: true, ...(clearImage ? { imageUrl: null, pendingClear: true } : {}) }
        : item
    ));
  };

  /** Update field teks (title/subtitle) sebuah item hero. */
  const handleHeroItemChange = (id, changes) => {
    setHeroItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes, dirty: true } : item)));
  };

  /**
   * Menyimpan seluruh tab "Page Utama".
   * Alur:
   * 1. PATCH platform data teks (headline, dll) — JSON
   * 2. Loop mainImageItems: upload file baru (multipart) ATAU kirim null jika pendingClear
   * 3. Loop cover items: upload file baru (multipart) ATAU kirim null jika pendingClear
   * 4. Reset state file & pendingClear setelah berhasil
   */
  async function handleSaveMain() {
    setMainSaving(true);
    try {
      // Simpan data teks platform (tanpa mainImageUrl — dikelola via PlatformImage)
      const body = {
        headline:       mainForm.headline       || "",
        subHeadline:    mainForm.subHeadline    || "",
        instagram:      mainForm.instagram      || "",
        youtube:        mainForm.youtube        || "",
        youtubeProfile: mainForm.youtubeProfile || "",
      };
      const res = await fetch(`/api/admin/platform/${PLATFORM_SLUG}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error?.message || "Gagal menyimpan platform");
      }

      // Proses setiap slot gambar utama
      for (const item of mainImageItems) {
        if (item.files?.length > 0) {
          const fd = new FormData();
          fd.append("imageUrl", item.files[0]);
          const r = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            body: fd,
          });
          if (!r.ok) {
            const payload = await r.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menyimpan gambar: ${item.label}`);
          }
        } else if (item.pendingClear) {
          const r = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: null }),
          });
          if (!r.ok) {
            const payload = await r.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menghapus gambar: ${item.label}`);
          }
        }
      }

      // Proses setiap slot cover yang berubah
      for (const item of mainItems) {
        if (item.files?.length > 0) {
          // Upload file baru; server otomatis menghapus file lama
          const coverFd = new FormData();
          coverFd.append("imageUrl", item.files[0]);
          const cRes = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            body: coverFd,
          });
          if (!cRes.ok) {
            const payload = await cRes.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menyimpan cover: ${item.label}`);
          }
        } else if (item.pendingClear) {
          // Hapus gambar cover tanpa mengunggah yang baru
          const cRes = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: null }),
          });
          if (!cRes.ok) {
            const payload = await cRes.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menghapus gambar cover: ${item.label}`);
          }
        }
      }

      setMainImageItems((prev) => prev.map((item) => ({ ...item, files: [], pendingClear: false })));
      setMainItems((prev) => prev.map((item) => ({ ...item, files: [], pendingClear: false })));
      showToast("Data halaman utama berhasil disimpan", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setMainSaving(false);
    }
  }

  /**
   * Menyimpan seluruh tab "Bagian Hero".
   * Untuk tiap item:
   *  - Ada file baru → multipart PATCH (title + subtitle + imageUrl file)
   *  - Hanya teks atau pendingClear → JSON PATCH
   *  - Tidak berubah sama sekali → di-skip (tidak kirim request)
   */
  async function handleSaveHero(items) {
    setHeroSaving(true);
    try {
      for (const item of items) {
        if (item.files?.length > 0) {
          // Upload gambar baru sekaligus update title/subtitle
          const heroFd = new FormData();
          heroFd.append("title",    item.title    || "");
          heroFd.append("subtitle", item.subtitle || "");
          heroFd.append("imageUrl", item.files[0]);
          const res = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            body: heroFd,
          });
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menyimpan hero: ${item.label}`);
          }
        } else if (item.pendingClear || item.dirty) {
          const body = { title: item.title || "", subtitle: item.subtitle || "" };
          if (item.pendingClear) body.imageUrl = null;
          const res = await fetch(`/api/admin/platform/${PLATFORM_SLUG}/images/${item.apiKey}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const payload = await res.json().catch(() => ({}));
            throw new Error(payload.error?.message || `Gagal menyimpan hero: ${item.label}`);
          }
        }
      }

      setHeroItems((prev) => prev.map((item) => ({ ...item, files: [], pendingClear: false, dirty: false })));
      showToast("Hero berhasil disimpan", "success");
    } catch (err) {
      console.error(err);
      showToast(err.message || "Terjadi kesalahan saat menyimpan", "error");
    } finally {
      setHeroSaving(false);
    }
  }

  return (
    <PermissionGate requiredPermissions={["platform.read"]}>
    <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={closeToast} />
    <section className="py-5 px-6 bg-white rounded-xl border border-gray-300">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-[78%]">
          <h1 className="text-[20px] font-bold text-gray-900 mb-1">
            Hero Page Platform Ditampart
          </h1>
          <p className="text-sm text-gray-700">
            Kelola bagian Hero dan tampilan utama pada bagian Program Hysteria Ditampart
          </p>
        </div>
      </div>

      {/* tab buttons */}
      <div className="mt-6 flex items-center gap-8">
        <button
          onClick={() => setActive("main")}
          className={`relative px-4 py-2 ${
            active === "main"
              ? "text-pink-500 border-b-2 border-pink-300 pb-1"
              : "text-gray-700"
          }`}
        >
          Page Utama
        </button>

        <button
          onClick={() => setActive("hero")}
          className={`relative px-4 py-2 ${
            active === "hero"
              ? "text-pink-500 border-b-2 border-pink-300 pb-1"
              : "text-gray-700"
          }`}
        >
          Bagian Hero
        </button>
      </div>

      <div className="mt-7">
        {active === "main" ? (
          <div className="p-7 rounded-lg bg-white border border-dashed border-gray-300 text-gray-700">
            <FormMain
              form={mainForm}
              onFormChange={setMainForm}
              mainImageItems={mainImageItems}
              onMainImageItemsFilesChange={handleMainImageItemsFilesChange}
              onFilesChange={handleMainFilesChange}
              coverItems={mainItems}
              onSubmit={handleSaveMain}
              submitting={mainSaving}
              maxSizeMB={MAX_SIZE_MB}
              mainImageLabel="ukuran 480x600 px, - format file .webp"
            />
          </div>
        ) : (
          <div className="p-7 rounded-lg bg-white border border-dashed border-gray-300 text-gray-700">
            <FormHero
              items={heroItems}
              onFilesChange={handleHeroFilesChange}
              onItemChange={handleHeroItemChange}
              onSubmit={handleSaveHero}
              submitting={heroSaving}
              maxSizeMB={MAX_SIZE_MB}
            />
          </div>
        )}
      </div>
    </section>
    </PermissionGate>
  );
}
