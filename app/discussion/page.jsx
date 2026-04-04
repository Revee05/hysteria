import Link from "next/link";

export const metadata = {
  title: "Diskusi Kolaborasi | Hysteria",
  description: "Ruang awal untuk memulai diskusi kolaborasi dengan Hysteria.",
};

export default function DiscussionPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <h1 className="text-3xl font-bold text-[#0f172a] md:text-4xl">Mulai Diskusi</h1>
        <p className="mt-4 text-base leading-7 text-[#475569]">
          Halaman ini disiapkan sebagai tahap awal diskusi kolaborasi. Untuk sementara, jalur komunikasi utama
          masih melalui email agar kebutuhan tercatat rapi.
        </p>

        <div className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#334155]">Langkah cepat:</p>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-[#475569]">
            <li>1. Buka halaman kontak</li>
            <li>2. Kirim ringkasan kebutuhan kolaborasi</li>
            <li>3. Tim Hysteria akan follow-up sesuai prioritas</li>
          </ol>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Buka Halaman Kontak
          </Link>
        </div>
      </section>
    </main>
  );
}
