export async function getAdminEventsTable() {
  const res = await fetch("/api/admin/events", {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Gagal mengambil data event");

  return res.json();
}

export async function deleteEventTable(id) {
  const res = await fetch(`/api/admin/events/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Gagal menghapus event");

  return true;
}