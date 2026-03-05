"use client";

// Kita "pinjam" ProgramForm yang tadi sudah susah payah kita buat!
import ProgramForm from "../../../../components/adminUI/Program/ProgramForm";

export default function CreateHysteriaPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-black">Tambah Hysteria Berkelana</h1>
      <p className="text-sm text-gray-500 mb-6">
        Buat konten khusus untuk program Hysteria Berkelana
      </p>
      {/* Nanti di level API kita tinggal ngakalin tipe datanya */}
      <ProgramForm />
    </div>
  );
}