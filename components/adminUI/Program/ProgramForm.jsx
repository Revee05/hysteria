"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// MEMINJAM KOMPONEN DARI FOLDER EVENT TEMANMU
import ImageUpload from "../Event/ImageUpload";
import EventDescriptionEditor from "../Event/EventDescriptionEditor";
import TagInput from "../Event/TagInput";

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {title && (
        <h3 className="font-medium text-black mb-3">{title}</h3>
      )}
      {children}
    </div>
  );
}

export default function ProgramForm({ initialData = null, isEdit = false, programId = null }) {
  const router = useRouter();

  const [organizerItems, setOrganizerItems] = useState([]);
  const [programTree, setProgramTree] = useState([]);
  const [platformTree, setPlatformTree] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const organizerRef = useRef(null);
  const categoryRef = useRef(null);
  
  const HYSTERIA_ORGANIZER = {
    id: "__HYSTERIA__",
    title: "Hysteria",
    isVirtual: true,
  };

  const getOrganizerTitle = (id) => {
    if (id === "__HYSTERIA__") return "Hysteria";
    return organizerItems.find(o => o.id === id)?.title || id;
  };

  const getCategoryTitle = (id) =>
    filteredCategoryItems.find(
      (c) => Number(c.id) === Number(id)
    )?.title || id;

  const [form, setForm] = useState({
    title: "",
    categoryItemIds: [],
    organizerIds: [],
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    address: "",
    registerLink: "",
    mapsEmbed: "",
    poster: "",
    status: "PUBLISHED",      
    driveLink: "",            
    youtubeLink: "", 
    instagramLink: "",
    drivebukuLink: "",
    tags: [],
    isFlexibleTime : false,
  });

  // PREFILL EDIT
  useEffect(() => {
    if (!initialData) return;

    const start = initialData.startAt ? new Date(initialData.startAt) : null;
    const end = initialData.endAt ? new Date(initialData.endAt) : null;
    const isFlexible = Boolean(initialData.isFlexibleTime);

    setForm((prev) => ({
      ...prev,
      title: initialData.title || "",
      categoryItemIds: initialData.programCategories?.map(ec => Number(ec.categoryItemId)) || [],
      organizerIds: initialData.organizers?.map(o => Number(o.categoryItemId)) || [],
      description: initialData.description || "",
      startDate: start ? start.toISOString().slice(0, 10) : "",
      startTime: isFlexible ? "" : (start ? start.toTimeString().slice(0, 5) : ""),
      endDate: end ? end.toISOString().slice(0, 10) : "",
      endTime: isFlexible ? "" : (end ? end.toTimeString().slice(0, 5) : ""),
      location: initialData.location || "",
      registerLink: initialData.registerLink || "",
      poster: initialData.poster || "",
      status: initialData.isPublished ? "PUBLISHED" : "DRAFT",
      driveLink: initialData.driveLink || "",
      youtubeLink: initialData.youtubeLink || "",
      instagramLink: initialData.instagramLink || "",
      drivebukuLink: initialData.drivebukuLink || "",
      tags: initialData.tags?.map(t => t.tag?.name).filter(Boolean) || [],
      mapsEmbed: initialData.mapsEmbedSrc
        ? `<iframe src="${initialData.mapsEmbedSrc}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
        : "",
      isFlexibleTime: isFlexible,
    }));
  }, [initialData]);

  useEffect(() => {
    if (form.isFlexibleTime) {
      setForm(prev => ({
        ...prev,
        startTime: "",
        endTime: "",
      }));
    }
  }, [form.isFlexibleTime]);

  // CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handler = (e) => {
      if (organizerRef.current && !organizerRef.current.contains(e.target))
        setOrganizerOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target))
        setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchData = async () => {
      const [platformRes, programRes] = await Promise.all([
        fetch("/api/categories/platform"),
        fetch("/api/categories/program-hysteria"),
      ]);

      const platformItems = (await platformRes.json())?.data?.items || [];
      const programItems = (await programRes.json())?.data?.items || [];

      const sortAZ = (a, b) =>
        a.title.localeCompare(b.title, "id-ID", { sensitivity: "base" });

      setPlatformTree(platformItems);
      setProgramTree(programItems);

      const organizers = platformItems
        .map(p => ({ id: p.id, title: p.title }))
        .sort(sortAZ);
      
      setOrganizerItems([
        ...organizers,
        HYSTERIA_ORGANIZER,
      ]);
    };

    fetchData();
  }, []);

  // SUB CATEGORY LOGIC
  const getPlatformSubCategories = () => {
    const subs = [];
    for (const organizer of platformTree) {
      if (!form.organizerIds.includes(Number(organizer.id))) continue;
      for (const child of organizer.children || []) {
        subs.push({
          id: child.id,
          title: child.title,
          source: organizer.title,
        });
      }
    }
    return subs;
  };

  const getHysteriaSubCategories = () => {
    if (!form.organizerIds.includes("__HYSTERIA__")) return [];
    const result = [];
    for (const group of programTree) {
      for (const child of group.children || []) {
        result.push({
          id: child.id,
          title: child.title,
          source: "Hysteria",
        });
      }
    }
    return result;
  };
  
  const filteredCategoryItems = useMemo(() => {
    return [
      ...getPlatformSubCategories(),
      ...getHysteriaSubCategories(),
    ];
  }, [form.organizerIds, platformTree, programTree]);
  
  // CLEAN CATEGORY WHEN ORGANIZER CHANGES
  useEffect(() => {
    if (!form.organizerIds.length) return;
    if (!filteredCategoryItems.length) return;

    setForm((prev) => ({
      ...prev,
      categoryItemIds: prev.categoryItemIds.filter((id) =>
        filteredCategoryItems.some(
          (c) => Number(c.id) === Number(id)
        )
      ),
    }));
  }, [form.organizerIds]);

  const normalizeId = (id) => {
    if (id === "__HYSTERIA__") return "__HYSTERIA__";
    return Number(id);
  };

  const toggleOrganizer = (id) => {
    const normalized = normalizeId(id);
    setForm((prev) => ({
      ...prev,
      organizerIds: prev.organizerIds.includes(normalized)
        ? prev.organizerIds.filter((x) => x !== normalized)
        : [...prev.organizerIds, normalized],
    }));
  };

  const toggleCategory = (id) => {
    const numId = Number(id);
    setForm(prev => ({
      ...prev,
      categoryItemIds: prev.categoryItemIds.includes(numId)
        ? prev.categoryItemIds.filter(x => x !== numId)
        : [...prev.categoryItemIds, numId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const extractMapSrc = (iframeHtml) => {
    if (!iframeHtml) return null;
    const match = iframeHtml.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };
  const mapSrc = extractMapSrc(form.mapsEmbed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 👉 VALIDASI KETAT
    const missingFields = [];
    if (!form.title) missingFields.push("Judul Postingan");
    if (!form.description || form.description === "<p></p>") missingFields.push("Deskripsi");
    if (form.organizerIds.length === 0) missingFields.push("Penyelenggara");
    if (!Array.isArray(form.categoryItemIds) || form.categoryItemIds.length === 0)
      missingFields.push("Sub Kategori");
    if (!form.poster) missingFields.push("Foto Utama");

    if (missingFields.length > 0) {
      alert("Field berikut wajib diisi:\n- " + missingFields.join("\n- "));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title           : form.title,
        type            : "UMUM", 
        categoryItemIds : form.categoryItemIds,
        organizerItemIds: form.organizerIds.filter((id) => id !== "__HYSTERIA__"),
        description     : form.description,
        startAt: form.startDate
          ? form.isFlexibleTime
            ? new Date(`${form.startDate}T00:00`).toISOString()
            : new Date(`${form.startDate}T${form.startTime || "00:00"}`).toISOString()
          : null,
        endAt: form.endDate
          ? form.isFlexibleTime
            ? new Date(`${form.endDate}T00:00`).toISOString()
            : new Date(`${form.endDate}T${form.endTime || "00:00"}`).toISOString()
          : null,
        location        : form.location,
        registerLink    : form.registerLink,
        mapsEmbedSrc    : extractMapSrc(form.mapsEmbed),
        poster          : form.poster,
        isPublished     : form.status === "PUBLISHED", 
        driveLink       : form.driveLink,                
        youtubeLink     : form.youtubeLink,
        instagramLink   : form.instagramLink,
        drivebukuLink   : form.drivebukuLink,
        isFlexibleTime  : form.isFlexibleTime,
        tagNames: Array.isArray(form.tags) ? form.tags.filter(Boolean) : [],
      };

      const res = await fetch(
        isEdit ? `/api/admin/programs/${programId}` : "/api/admin/programs",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null); 
        alert(errData?.message || errData?.error || "Gagal menyimpan data ke server! Cek terminal VS Code.");
        setLoading(false);
        return;
      }

      // 👉 SOLUSI FIX: Menggunakan router.push untuk navigasi halus tanpa merusak session login
      router.push("/admin/programs");
      
      // 👉 Memaksa tabel refresh data terbarunya tanpa kedip
      router.refresh();

    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      alert("Terjadi kesalahan jaringan atau sistem.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 bg-white text-black placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500";

  return (
    <form onSubmit={handleSubmit} className="font-poppins space-y-6">
      {/* HEADER */}
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#413153] hover:bg-[#2d2239] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? "Menyimpan..." : "Simpan Postingan"}
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Judul Postingan *">
            <input name="title" value={form.title} onChange={handleChange} className={inputClass} required />
            <p className="text-xs text-gray-500 mt-2">Masukkan judul yang jelas dan deskriptif</p>
          </Card>

          <Card title="Deskripsi *">
            <EventDescriptionEditor
              value={form.description}
              onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
            />
          </Card>

          <Card title="Link Pendaftaran/Tiket/Formulir">
            <input type="url" name="registerLink" value={form.registerLink} onChange={handleChange} className={inputClass} />
          </Card>

          <Card title="Lokasi">
            <p className="text-xs text-gray-500 mt-2">Tulis alamat pelaksanaan acara secara lengkap</p>
            <input name="location" value={form.location} onChange={handleChange} className={inputClass} />
            
            <p className="text-xs text-gray-500 mt-2">Tambahkan detail lokasi mengguanakan Google Maps</p>
            <textarea name="mapsEmbed" value={form.mapsEmbed} onChange={handleChange} rows={3} className={`${inputClass} mt-3`} />
            
            {mapSrc && (
              <div className="mt-3 rounded-lg overflow-hidden border">
                <iframe src={mapSrc} width="100%" height="220" loading="lazy" />
              </div>
            )}
          </Card>

          <Card title="Arsip Kegiatan">
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mt-2">Link Drive Dokumentasi</p>
              <input type="url" name="driveLink" value={form.driveLink} onChange={handleChange} className={inputClass} />

              <p className="text-xs text-gray-500 mt-2">Link Dokumentasi YouTube</p>
              <input type="url" name="youtubeLink" value={form.youtubeLink} onChange={handleChange} className={inputClass} />

              <p className="text-xs text-gray-500 mt-2">Link Dokumentasi Instagram</p>
              <input type="url" name="instagramLink" value={form.instagramLink} onChange={handleChange} className={inputClass} />

              <p className="text-xs text-gray-500 mt-2">Link Drive Buku</p>
              <input type="url" name="drivebukuLink" value={form.drivebukuLink} onChange={handleChange} className={inputClass} />
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          
          <Card title="Penyelenggara *">
            <div ref={organizerRef} className="relative space-y-2">
              {form.organizerIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.organizerIds.map((id) => (
                    <span key={id} className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {getOrganizerTitle(id)}
                      <button type="button" onClick={() => toggleOrganizer(id)} className="hover:text-pink-900">×</button>
                    </span>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setOrganizerOpen(!organizerOpen)} className={`${inputClass} flex justify-between items-center`}>
                <span>{form.organizerIds.length > 0 ? `${form.organizerIds.length} penyelenggara dipilih` : "Pilih penyelenggara"}</span>
                <span className="text-gray-500">▾</span>
              </button>
              {organizerOpen && (
                <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-lg border bg-white shadow">
                  {organizerItems.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={form.organizerIds.includes(item.id)} onChange={() => toggleOrganizer(item.id)} className="accent-pink-600" />
                      <span className="text-sm text-black">{item.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </Card>
        
          <Card title="Sub Kategori *">
            <div ref={categoryRef} className="relative space-y-2">
              {form.categoryItemIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.categoryItemIds.map((id) => (
                    <span key={id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {getCategoryTitle(id)}
                      <button type="button" onClick={() => toggleCategory(id)} className="hover:text-gray-900">×</button>
                    </span>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setCategoryOpen(!categoryOpen)} className={`${inputClass} flex justify-between items-center`}>
                <span>{form.categoryItemIds.length > 0 ? `${form.categoryItemIds.length} kategori dipilih` : "Pilih kategori"}</span>
                <span className="text-gray-500">▾</span>
              </button>
              {categoryOpen && (
                <div className="absolute z-20 mt-2 w-full max-h-64 overflow-auto rounded-lg border bg-white shadow">
                  {filteredCategoryItems.map((item) => (
                    <label key={item.id} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={form.categoryItemIds.includes(item.id)} onChange={() => toggleCategory(item.id)} className="mt-1 accent-pink-600" />
                      <div>
                        <p className="text-sm text-black">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.source}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </Card>
          
          <Card title="Foto Utama *">
            <ImageUpload value={form.poster} onChange={(url) => setForm({ ...form, poster: url })} />
          </Card>

          <Card title="Durasi Acara">
            <div className="space-y-3">
              <Card title="Tanggal Mulai">
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass} />
              </Card>
              
              <Card title="Tanggal Selesai">
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className={inputClass} />
              </Card>
              
              <Card title="Waktu Acara">
                {!form.isFlexibleTime && (
                  <div className="flex gap-2">
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className={inputClass} />
                    <span className="text-xs text-gray-500 self-center">Hingga</span>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className={inputClass} />
                  </div>
                )}
      
                <label className="flex items-start gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFlexibleTime} onChange={(e) => setForm((prev) => ({ ...prev, isFlexibleTime: e.target.checked }))} className="mt-1 accent-pink-600" />
                  <div>
                    <p className="text-sm text-black font-medium">Menyesuaikan</p>
                  </div>
                </label>
              </Card>
            </div>
          </Card>

          <TagInput value={form.tags} onChange={(tags) => setForm((prev) => ({ ...prev, tags }))} />

          <Card title="Status Postingan">
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish</option>
            </select>
          </Card>
        </div>
      </div>
    </form>
  );
}