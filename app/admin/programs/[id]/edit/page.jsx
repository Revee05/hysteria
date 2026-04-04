// app/admin/programs/[id]/edit/page.jsx
import ProgramForm from "@/components/adminUI/Program/ProgramForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProgramPage({ params }) {
  // 👉 PERBAIKAN UNTUK NEXT.JS 15: params harus di-await!
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  
  // Ambil data langsung lewat Prisma
  const program = await prisma.program.findUnique({
    where: { id },
    include: {
      programCategories: true,
      programOrganizers: true,
      programTags: { include: { tag: true } },
    },
  });

  if (!program) {
    return notFound();
  }

  // Merapikan nama objek agar cocok dengan state di ProgramForm.jsx kamu
  const formattedData = {
    ...program,
    organizers: program.programOrganizers, // Mengganti nama property untuk form
    tags: program.programTags,             // Mengganti nama property untuk form
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Edit Postingan Program</h1>
        <p className="text-gray-600 mt-1">Perbarui konten program yang sudah ada</p>
      </div>
      
      <ProgramForm 
        initialData={formattedData} 
        isEdit={true} 
        programId={id} 
      />
    </div>
  );
}