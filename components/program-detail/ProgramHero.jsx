// components/program-detail/ProgramHero.jsx
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ProgramHero({ title, subtitle }) {
  return (
    <section className={`relative w-full h-[700px] ${poppins.className}`}>
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <Image 
          src="/image/bg_program.jpeg" // BG disamakan dengan slug lain
          alt="Background Hysteria Berkelana" 
          fill 
          priority 
          className="object-cover" 
          quality={100} 
        />
        {/* Overlay gelap agar teks lebih terbaca */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* TEXT CONTENT (Kiri Bawah) */}
      <div className="relative z-10 w-full px-10 lg:px-20 h-full flex flex-col justify-end pb-24 text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-md tracking-tight uppercase">
          {title}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl font-medium opacity-95 leading-relaxed drop-shadow-sm">
          {subtitle}
        </p>
      </div>
    </section>
  );
}