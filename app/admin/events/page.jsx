"use client";

import { useEffect, useState } from "react";
import EventTable from "../../../components/adminUI/Event/EventTable";
import EventForm from "../../../components/adminUI/Event/EventForm";

export default function EventPage() {
  const [view, setView] = useState("list"); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      const data = await res.json();

      const mapped = data.map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt, 
        endAt: e.endAt,
        location: e.location || "-",
        status: e.status,
        poster: e.poster || "",
        organizers: e.organizers,
        eventCategories: e.eventCategories,
        isPublished: e.isPublished,
      }));

      setEvents(mapped);
    } catch (err) {
      console.error("Gagal fetch event", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading event...</div>;
  }

  const handleEdit = async (id) => {
    try {
      setLoadingEdit(true);
      setView("edit");

      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();

      setSelectedEventId(id);
      setEditData(data);
    } catch (err) {
      console.error("Gagal ambil data edit", err);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus event ini?")) return;

    try {
      await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      fetchEvents(); // refresh data
    } catch (err) {
      console.error("Gagal hapus event:", err);
    }
  };

  return (
    <div className="space-y-6 px-6 py-4 bg-white rounded-lg shadow-sm">
      
      {/* ================= LIST ================= */}
      {view === "list" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-black">
                Event
              </h1>
              <p className="text-[14px] text-gray-500">
                Manage all content across event
              </p>
            </div>

            <button
              onClick={() => setView("create")}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg"
            >
              + Tambah Event
            </button>
          </div>

          <EventTable events={events} onEdit={handleEdit} onDelete={handleDelete} />
        </>
      )}

      {/* ================= CREATE ================= */}
      {view === "create" && (
        <>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-black">Create Event</h1>
            <p className="text-sm text-gray-500">
              Create new content for event
            </p>
          </div>

          <EventForm
            onClose={() => {
              setView("list");
              fetchEvents(); 
            }}
          />
        </>
      )}

      {/* ================= EDIT ================= */}
      {view === "edit" && (
        <>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-black">
              Edit Event
            </h1>
            <p className="text-sm text-gray-500">
              Edited a content for event
            </p>
          </div>

          {loadingEdit ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <EventForm
              initialData={editData}
              isEdit
              eventId={selectedEventId}
              onClose={() => {
                setView("list");
                fetchEvents();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}