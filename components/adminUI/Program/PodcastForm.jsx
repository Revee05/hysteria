"use client";
import { useState, useEffect } from "react";

// Terima props submitBtnId dari page.jsx
export default function PodcastForm({ submitBtnId = "podcast-submit-btn" }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // 👉 NAMA STATE DISAMAKAN DENGAN DATABASE PRISMA
  const [form, setForm] = useState({
    astonLink: "",
    soreDiStonenLink: "",
  });

  // 👉 MENGAMBIL DATA LAMA SAAT HALAMAN DIBUKA
  useEffect(() => {
    async function loadPodcastData() {
      try {
        const res = await fetch("/api/admin/programs/podcast");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setForm({
              astonLink: data.astonLink || "",
              soreDiStonenLink: data.soreDiStonenLink || "",
            });
          }
        }
      } catch (error) {
        console.error("Gagal memuat link podcast lama", error);
      } finally {
        setFetching(false);
      }
    }
    loadPodcastData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!form.astonLink || !form.soreDiStonenLink) {
      alert("Harap isi kedua link playlist!");
      return;
    }

    setLoading(true);

    try {
      // 👉 MENYIMPAN DATA KE API YANG BARU KITA BUAT
      const res = await fetch("/api/admin/programs/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan ke server");
      
      alert("Link Playlist Podcast berhasil disimpan!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Styling input disesuaikan dengan border dan padding dari desain UI
  const inputClass =
    "w-full border border-gray-400 bg-white text-black placeholder-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E83C91] transition-all";

  // Tampilan saat sedang memuat data lama
  if (fetching) {
    return <div className="p-6 text-gray-500 font-medium">Memuat pengaturan podcast...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full font-poppins space-y-6">
      
      {/* TOMBOL SUBMIT RAHASIA 🥷 */}
      <button type="submit" id={submitBtnId} className="hidden" disabled={loading}>
        Submit Rahasia
      </button>

      {/* Card 1: Aston */}
      <div className="border border-gray-400 rounded-xl p-6 bg-white shadow-sm">
        <label className="block text-lg font-bold text-black mb-3">
          Link Playlist (Aston) Anak Stonen*
        </label>
        <input
          type="url"
          name="astonLink" // 👉 Nama property name harus sesuai state
          value={form.astonLink}
          onChange={handleChange}
          placeholder="https://www.youtube.com/playlist . . ."
          className={inputClass}
          required
        />
        {/* CATATAN PINK PERMANEN */}
        <p className="text-[#E83C91] text-xs mt-2 font-medium">
          Masukkan Link Playlist Youtube yang jelas dan deskriptif.
        </p>
      </div>

      {/* Card 2: Sore Di Stonen */}
      <div className="border border-gray-400 rounded-xl p-6 bg-white shadow-sm">
        <label className="block text-lg font-bold text-black mb-3">
          Link Playlist Sore Di Stonen*
        </label>
        <input
          type="url"
          name="soreDiStonenLink" // 👉 Nama property name harus sesuai state
          value={form.soreDiStonenLink}
          onChange={handleChange}
          placeholder="https://www.youtube.com/playlist . . ."
          className={inputClass}
          required
        />
        {/* CATATAN PINK PERMANEN */}
        <p className="text-[#E83C91] text-xs mt-2 font-medium">
          Masukkan Link Playlist Youtube yang jelas dan deskriptif.
        </p>
      </div>
      
    </form>
  );
}               