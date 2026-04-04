export function formatDate(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d)) return "-";

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date) {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d)) return "-";

  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}