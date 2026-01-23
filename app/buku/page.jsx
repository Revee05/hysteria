import Image from "next/image";

const books = [
  {
    id: 1,
    title: "Belajar React",
    author: "Jane Doe",
    year: 2023,
    desc: "Panduan ringkas untuk membangun aplikasi modern dengan React.",
  },
  {
    id: 2,
    title: "Next.js Praktis",
    author: "Budi Santoso",
    year: 2024,
    desc: "Tips dan trik menggunakan Next.js dengan App Router.",
  },
  {
    id: 3,
    title: "Desain Antarmuka",
    author: "Ayu Putri",
    year: 2022,
    desc: "Prinsip dasar desain UI/UX untuk aplikasi web.",
  },
];

export default function BukuPage() {
  return (
    <div className="flex items-center justify-center bg-zinc-900 text-white font-sans dark:bg-black">
      <div className="relative w-full max-w-[1920px] lg:w-[1920px] min-h-screen mx-auto flex flex-col items-center justify-start py-32 px-16 bg-[#0b1220] sm:items-start opacity-100">
        <h1 className="text-4xl font-bold mb-6">Buku</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {books.map((b) => (
            <article key={b.id} className="bg-[#0f1724] p-4 rounded-lg shadow">
              <div className="h-40 w-full bg-zinc-800 rounded mb-3 flex items-center justify-center text-zinc-400">
                {/* Placeholder cover area - replace with <Image> if you add images */}
                Sampul
              </div>
              <h2 className="text-xl font-semibold">{b.title}</h2>
              <p className="text-sm text-zinc-300">{b.author} — {b.year}</p>
              <p className="mt-2 text-zinc-400 text-sm">{b.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
