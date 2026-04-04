export default function LiveArchiveLinks({ event, status }) {
  const isOngoing = status === "ONGOING";
  const isFinished = status === "FINISHED";

  const hasLive =
    event.youtubeLiveLink ||
    event.instagramLiveLink ||
    event.tiktokLiveLink;

  const hasArchive =
    event.driveLink ||
    event.youtubeLink ||
    event.instagramLink ||
    event.drivebukuLink ||
    (isFinished && hasLive);

  // =========================
  // LIVE LINKS
  // =========================
  const liveLinks = [
    {
      url: event.youtubeLiveLink,
      label: "YouTube Live",
      className: "bg-red-600 text-white hover:bg-red-700",
    },
    {
      url: event.instagramLiveLink,
      label: "Instagram Live",
      className:
        "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white hover:opacity-90",
    },
    {
      url: event.tiktokLiveLink,
      label: "TikTok Live",
      className: "bg-black text-white hover:bg-gray-800",
    },
  ];

  // =========================
  // ARCHIVE LINKS
  // =========================
  const archiveLinks = [
    {
      url: event.driveLink,
      label: "Dokumentasi",
    },
    {
      url: event.youtubeLink,
      label: "YouTube",
    },
    {
      url: event.instagramLink,
      label: "Instagram",
    },
    {
      url: event.drivebukuLink,
      label: "Buku Kegiatan",
    },
  ];

  // =========================
  // LIVE → ARCHIVE (FINISHED)
  // =========================
  const replayLinks = isFinished
    ? [
        {
          url: event.youtubeLiveLink,
          label: "Rekaman YouTube",
          className: "bg-red-600 text-white hover:bg-red-700",
        },
        {
          url: event.instagramLiveLink,
          label: "Instagram Replay",
          className:
            "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white hover:opacity-90",
        },
        {
          url: event.tiktokLiveLink,
          label: "TikTok Replay",
          className: "bg-black text-white hover:bg-gray-800",
        },
      ]
    : [];

  return (
    <div>
      {/* ================= LIVE ================= */}
      {hasLive && isOngoing && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-[var(--Color-5)]">
            Live Streaming
          </h3>

          <div className="flex flex-wrap gap-2">
            {liveLinks
              .filter((l) => l.url)
              .map((l, i) => (
                <a
                  key={`live-${i}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-[8px] text-[12px] font-medium transition ${l.className}`}
                >
                  {l.label}
                </a>
              ))}
          </div>
        </div>
      )}

      {/* ================= ARCHIVE ================= */}
      {hasArchive && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2 text-[var(--Color-5)] text-[18px]">
            Arsip Kegiatan
          </h3>

          <div className="flex flex-wrap gap-4">
            {/* Normal archive */}
            {archiveLinks
              .filter((l) => l.url)
              .map((l, i) => (
                <a
                  key={`archive-${i}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-md bg-[var(--Color-1)] text-[var(--Color-3)] border border-[var(--Color-1)] text-xs hover:bg-[var(--Color-3)] hover:text-[var(--Color-1)] transition"
                >
                  {l.label}
                </a>
              ))}

            {/* Replay (dari live) */}
            {replayLinks
              .filter((l) => l.url)
              .map((l, i) => (
                <a
                  key={`replay-${i}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-6 py-3 rounded-md text-xs transition ${l.className}`}
                >
                  {l.label}
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}