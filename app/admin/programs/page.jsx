"use client";

// Pastikan path import ini sesuai dengan struktur foldermu ya
import ProgramTable from "../../../components/adminUI/Program/ProgramTable";

export default function ProgramPage() {
  return (
    <div className="p-6 min-h-screen bg-gray-50/50">
      {/* Memanggil komponen tabel yang sudah kita buat tadi */}
      <ProgramTable />
    </div>
  );
}