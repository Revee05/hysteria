"use client";

import { useEffect } from "react";
import EventForm from "../../../../components/adminUI/Event/EventForm";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  useEffect(() => {
    // Paksa refresh token saat page dibuka
    fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    }).catch(() => {
      router.replace("/auth/login");
    });
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-black">
        Tambah Event
      </h1>

      <EventForm />
    </div>
  );
}
