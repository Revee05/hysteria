// _components/HeroSection.jsx
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

// KOMPONEN MENERIMA DATA SEBAGAI "PROPS" (mainHero) DARI LUAR
export default function HeroSection({ mainHero }) {
  
  // Siapkan nilai default (Fallback) kalau admin belum ngisi data di CMS
  const headline = mainHero?.headline || "Laboratorium Para Seniman Semarang Eksis";
  const subHeadline = mainHero?.subHeadline || "Kolektif Hysteria merupakan ruang produksi artistik sekaligus fasilitator untuk pertemuan lintas disipliner dalam skala lokal hingga global untuk mencari terobosan-terobosan dalam persoalan kreatifitas, seni, komunitas, anak muda, dan isu kota.";
  const tautan = mainHero?.tautan || "https://drive.google.com/drive/folders/1VCbeKsG-Pnwvh7DDzPE4kM9J0U-Rvobb";
  const gambarKiri = mainHero?.gambarKiri || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80";
  const gambarKanan = mainHero?.gambarKanan || "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=800&q=80";

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 pt-6 lg:pt-5 pb-20">
      
      {/* Container Flex */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-16">
        
        {/* --- BAGIAN KIRI (TEKS) --- */}
        <div className="w-full lg:w-5/12 flex flex-col mt-0">
          <h1
            className={`${poppins.className} text-[40px] md:text-[56px] lg:text-[60px] font-bold text-[#0A0A0A] leading-[1.2] tracking-tight whitespace-pre-line`}
          >
            {headline}
          </h1>
          
          <p
            className={`${poppins.className} text-base md:text-lg text-[#4a4a4a] leading-relaxed mt-6 max-w-[500px] text-left whitespace-pre-line`}
          >
            {subHeadline}
          </p>

          {/* --- BUTTON TERBITAN HYSTERIA --- */}
          {tautan && (
            <div className="mt-12">
              <a
                href={tautan}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${poppins.className} 
                  inline-flex items-center justify-center 
                  px-8 py-3 
                  bg-white text-pink-600 
                  border border-pink-400 
                  font-semibold rounded-xl shadow-sm 
                  transition-colors duration-300
                  hover:bg-pink-600 hover:border-pink-600 hover:text-white
                `}
              >
                Terbitan Hysteria
              </a>
            </div>
          )}
        </div>

        {/* --- BAGIAN KANAN (GAMBAR KOLASE) --- */}
        <div className="w-full lg:w-7/12 flex justify-center lg:justify-end gap-6 items-start relative mt-10 lg:mt-0">
          
          {/* GAMBAR 1 (KIRI) */}
          <div className="relative w-[45%] md:w-[280px] lg:w-[320px] aspect-[320/420] rounded-[24px] overflow-hidden shadow-lg transform transition-transform hover:scale-[1.02]">
            <Image 
              src={gambarKiri} 
              alt="Gambar Hysteria 1" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 320px"
              priority
            />
          </div>

          {/* GAMBAR 2 (KANAN) */}
          <div className="relative w-[45%] md:w-[280px] lg:w-[320px] aspect-[320/420] rounded-[24px] overflow-hidden shadow-lg mt-20 md:mt-32 transform transition-transform hover:scale-[1.02]">
            <Image 
              src={gambarKanan} 
              alt="Gambar Hysteria 2" 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 320px"
            />
          </div>

        </div>
      </div>
    </section>
  );
}