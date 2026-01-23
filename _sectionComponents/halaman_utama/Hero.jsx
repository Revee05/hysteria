import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full max-w-[1200px] mx-auto flex flex-col items-start gap-8 text-white pt-[120px] pb-20">
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-1">
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Selamat datang di Hysteria
          </h2>
          <p className="mt-4 text-lg text-zinc-300 max-w-xl">
            Platform dokumentasi dan manajemen konten untuk tim kamu — cepat,
            aman, dan bisa diskalakan. Mulai jelajahi fitur dan integrasi kami
            untuk meningkatkan alur kerja.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="#get-started"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:opacity-95"
            >
              Mulai Sekarang
            </a>
            <a
              href="#learn-more"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm text-white/90 hover:bg-white/5"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex items-center justify-center">
          <div className="relative w-56 h-56 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 shadow-lg">
            <Image
              src="/next.svg"
              alt="hero"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-contain p-6 dark:invert"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
