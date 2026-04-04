// _components/halaman_program/FestivalSection.jsx
import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

// KOMPONEN MENERIMA DATA "covers" DARI PAGE INDUK
export default function FestivalSection({ covers }) {
  
  // Siapkan fallback image kalau admin belum upload gambar di CMS
  const fallbackKampung = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80";
  const fallbackKota = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80";
  const fallbackBiennale = "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=800&q=80";

  // Ambil gambar dari database, kalau kosong pakai fallback
  const imgKampung = covers?.festivalKampung || fallbackKampung;
  const imgKota = covers?.festivalKota || fallbackKota;
  const imgBiennale = covers?.biennale || fallbackBiennale;

  return (
    <section id="festival" className="w-full max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-10 mb-10">
      
      {/* JUDUL SECTION */}
      <div className="flex justify-between items-end mb-8">
        <h2 className={`${poppins.className} text-[28px] md:text-[32px] font-bold text-black`}>
            Festival dan Pameran
        </h2>
      </div>

      {/* GRID LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[500px]">
        
        {/* --- KOLOM KIRI (ITEM BESAR/UTAMA - Festival Kampung) --- */}
        <Link 
            href="/program/festival-kampung" 
            className="relative w-full lg:w-3/5 h-[300px] lg:h-full rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300"
        >
             <FestivalCardContent title="Festival Kampung" image={imgKampung} />
        </Link>

        {/* --- KOLOM KANAN (2 ITEM KECIL DITUMPUK) --- */}
        <div className="w-full lg:w-2/5 flex flex-col gap-6 h-full">
          
          {/* Item Atas - Festival Kota */}
          <Link 
            href="/program/festival-kota"
            className="relative w-full h-[240px] lg:h-1/2 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300"
          >
             <FestivalCardContent title="Festival Kota" image={imgKota} />
          </Link>

          {/* Item Bawah - Biennale */}
          <Link 
            href="/program/festival-biennale"
            className="relative w-full h-[240px] lg:h-1/2 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300"
          >
             <FestivalCardContent title="Biennale" image={imgBiennale} />
          </Link>

        </div>
      </div>
    </section>
  );
}

// Sub-komponen Konten Card (Diubah untuk menerima title dan image langsung)
function FestivalCardContent({ title, image }) {
  return (
    <>
      {/* Background Image dengan efek zoom saat hover */}
      <div className="absolute inset-0 w-full h-full">
         <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
         />
      </div>

      {/* Overlay Gradient (Supaya teks terbaca) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Konten (Teks & Tombol Icon) */}
      <div className="absolute inset-0 p-6 flex items-end justify-between z-10">
        
        <h3 className={`${poppins.className} text-white text-xl md:text-2xl font-bold drop-shadow-md`}>
          {title}
        </h3>
        
        {/* Icon Panah Bulat */}
        <div className="bg-white/90 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:translate-x-2 group-hover:bg-pink-600 text-pink-600 group-hover:text-white border border-white/50">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
}