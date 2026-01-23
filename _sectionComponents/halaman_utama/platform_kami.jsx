import Link from "next/link";

export default function PlatformKami() {
  return (
    <section className="w-full max-w-[1200px] mx-auto py-20 text-white">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
        Media & Kolektif Seni-Budaya Alternatif
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/buku" aria-label="Buku" className="group">
          <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700 cursor-pointer hover:scale-105 transform transition-all duration-150">
            <h3 className="text-xl font-semibold mb-3">Kolektif Hysteria</h3>
            <p className="text-zinc-300">
              Ruang ekspresi dan dokumentasi gerakan seni-budaya independen di Semarang.
            </p>
          </div>
        </Link>
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-xl font-semibold mb-3">Art Lab</h3>
          <p className="text-zinc-300">
            Laboratorium kreatif untuk eksperimen seni visual, musik, dan performance.
          </p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
          <h3 className="text-xl font-semibold mb-3">Peta Kota</h3>
          <p className="text-zinc-300">
            Pemetaan ruang-ruang alternatif dan komunitas budaya di Semarang.
          </p>
        </div>
      </div>
    </section>
  );
}
