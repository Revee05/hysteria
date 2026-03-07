export default function CollaborationTabs({ activeTab, onChangeTab }) {
  return (
    <div className="mb-6 flex flex-wrap gap-10">
      <button
        onClick={() => onChangeTab("tampilan")}
        className={`relative cursor-pointer pb-3 text-lg font-semibold transition ${activeTab === "tampilan" ? "text-[#ea4c9d]" : "text-[#333] hover:text-[#ea4c9d]"}`}
      >
        Tampilan Utama Kolaborasi
        {activeTab === "tampilan" && (
          <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#ea4c9d]" />
        )}
      </button>

      <button
        onClick={() => onChangeTab("kontak")}
        className={`relative cursor-pointer pb-3 text-lg font-semibold transition ${activeTab === "kontak" ? "text-[#ea4c9d]" : "text-[#333] hover:text-[#ea4c9d]"}`}
      >
        Kontak Kolaborasi
        {activeTab === "kontak" && (
          <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-[#ea4c9d]" />
        )}
      </button>
    </div>
  );
}
