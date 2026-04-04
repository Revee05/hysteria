/**
 * ==========================================
 * EVENT STATUS HELPER
 * ==========================================
 * Status dihitung berdasarkan waktu server
 * dan sensitif terhadap jam, menit, dan detik.
 */

export function getEventStatus(startAt, endAt) {
  const now = new Date();
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;

  // Event belum dimulai
  if (now < start) return "UPCOMING";

  // Event dengan waktu selesai (endAt)
  if (end) {
    if (now >= start && now <= end) return "ONGOING";
    return "FINISHED";
  }

  // Event tanpa endAt → aktif sampai akhir hari mulai
  const endOfStartDay = new Date(start);
  endOfStartDay.setHours(23, 59, 59, 999);

  if (now <= endOfStartDay) return "ONGOING";
  return "FINISHED";
}

export const EVENT_STATUS_LABEL = {
  UPCOMING: "Akan Berlangsung",
  ONGOING: "Sedang Berlangsung",
  FINISHED: "Telah Berakhir",
};

export function normalizeEventStatus(status) {
  if (!status) return "all";
  return status.toLowerCase();
}
