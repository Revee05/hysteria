"use client";

import { useEffect, useState } from "react";
import EventTable from "../../../components/adminUI/Event/EventTable";
import Link from "next/link";

export default function EventPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events");
        const data = await res.json();

        // MAP KE FORMAT EventTable
        const mapped = data.map((e) => ({
          id: e.id,
          title: e.title,
          date: new Date(e.startAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: new Date(e.startAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          location: e.location || "-",
          status: e.status,
          poster: e.poster || "",
        }));

        setEvents(mapped);
      } catch (err) {
        console.error("Gagal fetch event", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading event...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">
          Daftar Event
        </h1>

        <Link
          href="/admin/events/create"
          className="px-4 py-2 bg-pink-600 text-white rounded-lg"
        >
          + Tambah Event
        </Link>
      </div>

      <EventTable events={events} />
    </div>
  );
}
