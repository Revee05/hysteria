"use client";
import { useState } from "react";

// Terima props submitBtnId dari page.jsx
export default function PodcastForm({ submitBtnId = "podcast-submit-btn" }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    astonPlaylist: "",
    soreDiStonenPlaylist: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!form.astonPlaylist || !form.soreDiStonenPlaylist) {
      alert("Harap isi kedua link playlist!");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      alert("Link Playlist berhasil disimpan!");
      setLoading(false);
    }, 500);
  };

  // Styling input disesuaikan dengan border dan padding dari desain UI
  const inputClass =
    "w-full border border-gray-400 bg-white text-black placeholder-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E83C91] transition-all";

  return (
    <form onSubmit={handleSubmit} className="w-full font-poppins space-y-6">
      
      {/* TOMBOL SUBMIT RAHASIA 🥷
        Ini yang akan di-klik secara tidak terlihat oleh tombol "Simpan" di page.jsx kamu 
      */}
      <button type="submit" id={submitBtnId} className="hidden">
        Submit Rahasia
      </button>

      {/* Card 1: Aston */}
      <div className="border border-gray-400 rounded-xl p-6 bg-white shadow-sm">
        <label className="block text-lg font-bold text-black mb-3">
          Link Playlist (Aston) Anak Stonen*
        </label>
        <input
          type="url"
          name="astonPlaylist"
          value={form.astonPlaylist}
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
          name="soreDiStonenPlaylist"
          value={form.soreDiStonenPlaylist}
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