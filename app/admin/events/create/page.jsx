"use client";

import EventForm from "../../../../components/adminUI/Event/EventForm";
import { useRouter } from "next/navigation";
import { useAuthState } from "../../../../lib/context/auth-context";
import { useEffect } from "react";

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthState();

  // Redirect kalau belum login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-black">
        Memuat...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-black">Tambah Postingan</h1>
      <p className="text-sm text-gray-500">
        Create new content for publication
      </p>
      <EventForm />
    </div>
  );
}