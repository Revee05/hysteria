// components/program-detail/ProgramHero.jsx
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// 1. TANGKAP PROPS "heroImage" DARI PAGE.JSX
export default function ProgramHero({ title, subtitle, heroImage }) {
  
  // 2. SIAPKAN FALLBACK (Kalau admin belum upload, pakai gambar default)
  const displayImage = heroImage || "/image/bg_program.jpeg";

  return (
    // 3. UBAH UKURAN JADI PRESISI 1920x850 (Tanpa h-[700px] lagi)
    <section className={`relative w-full aspect-square sm:aspect-video md:aspect-[1920/850] flex flex-col justify-end ${poppins.className}`}>
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <Image 
          src={displayImage} 
          alt={title || "Background Hysteria Berkelana"} 
          fill 
          priority 
          className="object-cover object-center" 
          quality={100} 
        />
        {/* Overlay disamakan biar konsisten sama halaman lain */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* TEXT CONTENT (Kiri Bawah) */}
      <div className="relative z-10 w-full px-10 lg:px-20 pb-10 md:pb-14 text-white mt-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 drop-shadow-lg tracking-tight uppercase whitespace-pre-line">
          {title}
        </h1>
        <p className="text-base md:text-lg lg:text-xl max-w-2xl font-medium opacity-95 leading-relaxed drop-shadow-md whitespace-pre-line">
          {subtitle}
        </p>
      </div>
    </section>
  );
}