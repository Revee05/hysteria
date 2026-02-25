"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EventTable() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/admin/events", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Gagal mengambil data event");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus event ini?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus event");
      }

      // HAPUS DARI STATE (tanpa reload)
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (error)
    return (
      <p className="text-center py-6 text-red-600">{error}</p>
    );

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full border border-black">
        <thead className="bg-black text-white">
          <tr>
            <th className="px-4 py-3 text-left text-sm">Poster</th>
            <th className="px-4 py-3 text-left text-sm">Judul</th>
            <th className="px-4 py-3 text-left text-sm">Tanggal</th>
            <th className="px-4 py-3 text-left text-sm">Lokasi</th>
            <th className="px-4 py-3 text-left text-sm">Status</th>
            <th className="px-4 py-3 text-center text-sm">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {events.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-black">
                Belum ada event
              </td>
            </tr>
          )}

          {events.map((event) => {
            const startDate = new Date(event.startAt);

            return (
              <tr
                key={event.id}
                className="border-t border-black hover:bg-gray-100"
              >
                <td className="px-4 py-3">
                  {event.poster ? (
                    <img
                      src={event.poster}
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center border border-black text-xs text-black">
                      No Image
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-black font-medium">
                  {event.title}
                </td>

                <td className="px-4 py-3 text-black">
                  <div>
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    }).format(startDate)}
                  </div>

                  <div className="text-sm">
                    {new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Jakarta",
                    })
                      .format(startDate)
                      .replace(":", ".")}{" "}
                    WIB
                  </div>
                </td>

                <td className="px-4 py-3 text-black">
                  {event.location}
                </td>

                <td className="px-4 py-3">
                  {event.isPublished ? (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 border border-green-300">
                      Published
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 border border-gray-300">
                      Draft
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  {/* EDIT */}
                  <button
                    onClick={() =>
                      router.push(
                        `/admin/events/${event.id}/edit`
                      )
                    }
                    className="px-3 py-1 border border-black rounded text-black hover:bg-black hover:text-white"
                  >
                    Edit
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className={`px-3 py-1 border border-red-600 rounded ${
                      deletingId === event.id
                        ? "opacity-50 cursor-not-allowed"
                        : "text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    {deletingId === event.id ? "Menghapus..." : "Hapus"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
