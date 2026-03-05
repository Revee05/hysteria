"use client";
import PodcastForm from "../../../../components/adminUI/Program/PodcastForm";

export default function EditPodcastPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black leading-tight">Edit Link Podcast</h1>
          <p className="text-sm text-gray-500 mt-1">Create new content for publication</p>
        </div>
        {/* Tombol Simpan di header — trigger submit form via custom event */}
        <button
          type="button"
          onClick={() => document.getElementById("podcast-submit-btn").click()}
          className="bg-[#413153] hover:bg-[#2d2239] text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
        >
          Simpan
        </button>
      </div>

      {/* Form */}
      <PodcastForm submitBtnId="podcast-submit-btn" />
    </div>
  );
}