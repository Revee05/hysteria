"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EventForm from "../../../../../components/adminUI/Event/EventForm";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Event tidak ditemukan");
        }

        const data = await res.json();
        setInitialData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (!id) {
    return <div className="text-sm text-gray-500">Invalid event ID</div>;
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading event...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6 text-black">
        Edit Event
      </h1>

      <EventForm
        initialData={initialData}
        isEdit
        eventId={id}
      />
    </div>
  );
}
