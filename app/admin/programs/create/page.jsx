"use client";

// PERHATIKAN PATH IMPORT INI: Mengarah ke folder Program
import ProgramForm from "../../../../components/adminUI/Program/ProgramForm";
import { useRouter } from "next/navigation";
import { useAuthState } from "../../../../lib/context/auth-context";
import { useEffect } from "react";

export default function CreateProgramPage() {
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
      <h1 className="text-2xl font-semibold text-black">Tambah Postingan Program</h1>
      <p className="text-sm text-gray-500">
        Buat konten program baru untuk dipublikasikan
      </p>
      {/* Memanggil form khusus Program */}
      <ProgramForm />
    </div>
  );
}