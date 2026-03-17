// components/program-detail/DefaultProgramView.client.jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Poppins } from 'next/font/google';
import Link from 'next/link';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const PROGRAM_DATA = {
  'festival-kampung': { title: 'Festival Kampung', desc: 'Perayaan seni, budaya, dan kehidupan kampung.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'Gebyuran Bustaman', id: 'gebyuran-bustaman' }, { name: 'Nginguk Githok', id: 'nginguk-githok' }, { name: 'Festival Bukit Jatiwayang', id: 'festival-bukit-jatiwayang' }, { name: 'Sobo Roworejo', id: 'sobo-roworejo' }, { name: 'Srawung Sendang', id: 'srawung-sendang' }, { name: 'Festival Ngijo', id: 'festival-ngijo' }, { name: 'Banyu Pitu', id: 'banyu-pitu' }, { name: 'Bulusan Fest', id: 'bulusan-fest' }, { name: 'Labuhan Kali', id: 'labuhan-kali' }, { name: 'Iki Buntu Fest', id: 'iki-buntu-fest' }, { name: 'Festival ke Tugu', id: 'festival-ke-tugu' }] },
  'festival-kota': { title: 'Festival Kota', desc: 'Perayaan seni di ruang publik.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'Zine Fest', id: 'zine-fest' }, { name: 'Semarang Writers Week', id: 'semarang-writers-week' }, { name: 'City Canvas', id: 'city-canvas' }, { name: 'Dokumentaria', id: 'dokumentaria' }] },
  'festival-biennale': { title: 'Biennale', desc: 'Perhelatan dua tahunan.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'Pentak Labs', id: 'pentak-labs' }, { name: 'Tengok Bustaman', id: 'tengok-bustaman' }] },
  'forum': { title: 'Forum', desc: 'Ruang diskusi dan pertukaran gagasan.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'Temu Jejaring', id: 'temu-jejaring' }, { name: 'Buah tangan', id: 'buah-tangan' }, { name: 'Lawatan Jalan Terus', id: 'lawatan-jalan-terus' }, { name: 'Simposium', id: 'simposium' }, { name: 'Meditasi', id: 'meditasi' }] },
  'music': { title: 'Music', desc: 'Pertunjukan musik dan eksplorasi bunyi.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'SGRT', id: 'sgrt' }, { name: 'Kotak Listrik', id: 'kotak-listrik' }, { name: 'Di(e)gital', id: 'die-gital' }, { name: 'Bunyi Halaman Belakang', id: 'bunyi-halaman-belakang' }, { name: 'Folk Me Up', id: 'folk-me-up' }] },
  'pemutaran-film': { title: 'Pemutaran Film', desc: 'Apresiasi sinema alternatif.', categories: [{ name: 'Semua', id: 'semua' }, { name: 'Screening AM', id: 'screening-am-film' }, { name: 'Lawatan Bandeng Keliling', id: 'lawatan-bandeng-keliling-film' }] },
  
  // KELOMPOK 6 CARD (TANPA SIDEBAR)
  'flash-residency': { title: 'Flash Residency', desc: 'Program residensi singkat.', categories: [] },
  'kandang-tandang': { title: 'Kandang Tandang', desc: 'Pertukaran seniman antar wilayah.', categories: [] },
  'safari-memori': { title: 'Safari Memori', desc: 'Penelusuran sejarah dan ingatan kolektif warga melalui medium siniar dan obrolan.', categories: [] },
  'aston': { title: 'Aston', desc: 'Seri podcast yang membahas fenomena urban.', categories: [] },
  'sore-di-stonen': { title: 'Sore di Stonen', desc: 'Bincang santai menjelang senja.', categories: [] },
  'sapa-warga': { title: 'Sapa Warga', desc: 'Dokumentasi video interaksi warga.', categories: [] }
};

// 1. TAMBAHKAN PROPS "heroData" DI SINI
export default function DefaultProgramView({ actualSlug, heroData }) {
  const data = PROGRAM_DATA[actualSlug];

  // 2. SIAPKAN VARIABEL TAMPILAN HERO (Utamakan dari Admin, kalau kosong pakai default)
  const displayTitle = heroData?.title || data?.title || "Program";
  const displayDesc = heroData?.subtitle || data?.desc || "";
  const displayImage = heroData?.image || "/image/bg_program.jpeg";

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [realItems, setRealItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasSidebar = data?.categories && data.categories.length > 0;
  const itemsPerPage = hasSidebar ? 15 : 18; 

  // 👉 FETCH DATA & FILTERING STRICT BERDASARKAN "SUB KATEGORI" DATABASE
  useEffect(() => {
    async function fetchPrograms() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/programs');
        if (!res.ok) throw new Error('Gagal memuat data');
        const dbPrograms = await res.json();

        // 1. KUMPULKAN KATA KUNCI SAH UNTUK HALAMAN INI
        const mainTitle = data?.title.toLowerCase().trim() || "";
        const fallbackTitle = actualSlug.toLowerCase().replace(/-/g, ' ').trim();
        
        // Ambil nama sub-kategori (Kecuali kata 'semua')
        const validCategoryNames = data?.categories
            ?.map(c => c.name.toLowerCase().trim())
            .filter(name => name !== 'semua') || [];

        // Gabungkan jadi satu "Daftar Putih" (Whitelist)
        const validPageTags = [mainTitle, fallbackTitle, ...validCategoryNames];

        const formatted = dbPrograms
          .filter(p => p.isPublished && p.type !== 'HYSTERIA_BERKELANA')
          .filter(p => {
             // 2. AMBIL HANYA SUB KATEGORI DARI DATABASE (Abaikan Tag Manual/Penyelenggara)
             const catNames = p.programCategories?.map(pc => pc.categoryItem?.title.toLowerCase().trim()) || [];

             // 3. LOGIKA KUNCI: Program ini masuk JIKA punya minimal 1 Sub Kategori yang ada di Daftar Putih
             return catNames.some(cat => validPageTags.includes(cat));
          })
          .map(p => {
            const startDate = p.startAt ? new Date(p.startAt) : null;
            const today = new Date();
            const status = startDate && startDate > today ? 'Akan Berlangsung' : 'Selesai';
            
            const dateStr = startDate 
              ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(startDate)
              : 'Waktu Menyesuaikan';

            // Ambil nama original (huruf besar/kecil asli) khusus dari Sub Kategori
            const rawCatNames = p.programCategories?.map(pc => pc.categoryItem?.title.trim()) || [];

            // Cari label paling spesifik untuk kartu (Hindari tulisan "Semua" atau judul halaman utama)
            const specificCats = rawCatNames.filter(c => 
                c.toLowerCase() !== mainTitle && 
                c.toLowerCase() !== fallbackTitle &&
                c.toLowerCase() !== 'semua'
            );
            const primaryCat = specificCats.length > 0 ? specificCats[0] : (data?.title || 'Program');

            return {
              id: p.id,
              title: p.title,
              category: primaryCat, // Label ungu/pink di dalam kartu
              filterCategories: rawCatNames, // 👉 Strictly untuk filter Sidebar
              status: status,
              date: dateStr,
              image: p.poster,
              isChoice: false 
            };
          });

        setRealItems(formatted);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrograms();
  }, [actualSlug, data]);

  // Efek ganti kategori lewat URL param
  useEffect(() => {
    const paramKategori = searchParams.get('kategori');
    if (paramKategori && data?.categories) {
      const foundCategory = data.categories.find(c => c.id === paramKategori);
      if (foundCategory) {
        setActiveCategory(foundCategory.name);
        setCurrentPage(1);
      }
    }
  }, [searchParams, data]);

  const handleCategoryChange = (categoryObj) => {
    setActiveCategory(categoryObj.name);
    setCurrentPage(1);
    if (categoryObj.id && categoryObj.id !== 'semua') {
      router.replace(`${pathname}?kategori=${categoryObj.id}`, { scroll: false });
    } else {
      router.replace(pathname, { scroll: false }); 
    }
  };

  // 👉 LOGIKA FILTER SIDEBAR (HANYA MENGGUNAKAN SUB-KATEGORI)
  const filteredItems = useMemo(() => {
    return realItems.filter((item) => {
      // Cek apakah activeCategory ada di dalam array kategori asli milik program ini
      const matchCategory = !hasSidebar || activeCategory === 'Semua' || 
          item.filterCategories.some(c => c.toLowerCase() === activeCategory.toLowerCase().trim());
          
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchSearch;
    });
  }, [realItems, activeCategory, searchQuery, hasSidebar]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentDisplayItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const getVisiblePageNumbers = () => {
    const maxVisibleButtons = 5; 
    if (totalPages <= maxVisibleButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let startPage = currentPage - Math.floor(maxVisibleButtons / 2);
    let endPage = currentPage + Math.floor(maxVisibleButtons / 2);

    if (startPage < 1) { startPage = 1; endPage = maxVisibleButtons; }
    if (endPage > totalPages) { endPage = totalPages; startPage = totalPages - maxVisibleButtons + 1; }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  if (!data) return null;

  return (
    <main className={`min-h-screen bg-white ${poppins.className}`}>
      {/* 3. HERO SECTION DENGAN UKURAN 100% PROPORSIONAL GAMBAR */}
      <section className="relative w-full aspect-square sm:aspect-video md:aspect-[1920/850] flex flex-col justify-end">
        <div className="absolute inset-0">
          <Image 
            src={displayImage} 
            alt={displayTitle} 
            fill 
            priority 
            className="object-cover object-center" 
            quality={100} 
          />
          <div className="absolute inset-0 bg-black/40"></div> 
        </div>
        
        {/* Padding bawah (pb) dikurangi sedikit biar teks agak turun dan rapi */}
        <div className="relative z-10 w-full px-10 lg:px-20 pb-10 md:pb-14 text-white mt-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 drop-shadow-lg tracking-tight uppercase whitespace-pre-line">
            {displayTitle}
          </h1>
          <p className="text-base md:text-lg lg:text-xl max-w-2xl font-medium opacity-95 leading-relaxed drop-shadow-md whitespace-pre-line">
            {displayDesc}
          </p>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <div className="w-full px-10 lg:px-20 mt-10 mb-8">
        <div className="flex gap-4 items-center w-full max-w-3xl mx-auto">
            <div className="relative flex-grow">
              <input type="text" placeholder="Cari program atau karya..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full border border-[#D63384] rounded-full py-3 px-6 text-[#D63384] placeholder-[#D63384]/60 focus:outline-none focus:ring-1 focus:ring-[#D63384] transition-all bg-white shadow-sm" />
            </div>
            {hasSidebar && (
              <button onClick={() => { setSearchQuery(''); handleCategoryChange({ name: 'Semua', id: 'semua' }); }} className="flex-shrink-0 w-12 h-12 rounded-full border border-[#D63384] flex items-center justify-center text-[#D63384] hover:bg-pink-50 transition-colors bg-white shadow-sm">
                 <span className="font-bold">X</span>
              </button>
            )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-10 lg:px-20 pb-20">
         <div className={`flex flex-row gap-8 items-start ${hasSidebar ? 'justify-center lg:justify-start' : 'justify-center'}`}>
            
            {/* SIDEBAR */}
            {hasSidebar && (
                <aside className="w-[240px] flex-shrink-0 hidden md:block">
                   <div className="flex flex-col border border-[#D63384] rounded-xl overflow-hidden shadow-sm">
                      {data.categories.map((catItem, index) => {
                         const isActive = activeCategory === catItem.name;
                         const isLast = index === data.categories.length - 1;
                         return (
                            <button key={index} onClick={() => handleCategoryChange(catItem)}
                               className={`w-full py-3 px-4 text-sm font-semibold transition-all duration-200 text-center ${!isLast ? 'border-b border-[#D63384]' : ''} ${isActive ? 'bg-[#D63384] text-white' : 'bg-white text-[#D63384] hover:bg-pink-50'}`}>
                               {catItem.name}
                            </button>
                         );
                      })}
                   </div>
                </aside>
            )}

            {/* CARD AREA */}
            <div className={`flex-1 w-full ${!hasSidebar ? 'max-w-7xl' : ''}`}>
                {/* TAMPILAN LOADING */}
                {isLoading ? (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center text-[#D63384]">
                        <p className="text-lg font-medium animate-pulse">Memuat program...</p>
                    </div>
                ) : currentDisplayItems.length === 0 ? (
                    <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <p className="text-lg font-medium">Tidak ada program yang ditemukan.</p>
                    </div>
                ) : (
                    <div className={`grid gap-6 justify-items-center ${
                        hasSidebar ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:justify-items-start' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                    }`}>
                        {currentDisplayItems.map((item) => (
                            <Link 
                                  href={`/program/${actualSlug}/${item.id}`} 
                                  key={item.id} 
                                  className="group relative rounded-[10px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 w-full block" 
                                  style={{ 
                                    maxWidth: '210px', 
                                    height: '290px', 
                                    backgroundImage: item.image ? `url(${item.image})` : 'linear-gradient(180deg, #F2C94C 0%, #F2994A 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                              >
                                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-0 transition-opacity duration-300 group-hover:opacity-0"></div>
                                <div className="relative z-10 p-4 h-full flex flex-col justify-between text-white transition-opacity duration-300 group-hover:opacity-0">
                                    <div className="self-start">{item.isChoice && <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm border border-white/10">Pilihan</span>}</div>
                                    <div>
                                      <span className="text-[10px] font-medium text-pink-300 block mb-1">{item.category}</span>
                                      <h3 className="font-bold text-sm leading-tight line-clamp-3 drop-shadow-md">{item.title}</h3>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col justify-end p-4">
                                    <div className="flex flex-col transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="bg-white text-[#D63384] text-[10px] font-bold px-3 py-1 rounded-full w-max mb-2 shadow-sm">{item.status}</span>
                                        <h3 className="font-bold text-sm leading-snug text-white mb-1">{item.title}</h3>
                                        <span className="text-[10px] font-medium text-gray-200 block mb-3">{item.date}</span>
                              
                                        {item.status === 'Akan Berlangsung' && <span className="bg-[#D63384] hover:bg-[#b52a6f] text-white text-[11px] py-2 px-4 rounded-md font-semibold w-max transition-colors shadow-md cursor-pointer block text-center">Ikuti Sekarang</span>}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex items-center gap-2 bg-[#D63384] px-3 py-2 rounded-full shadow-lg">
                            <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#D63384] disabled:opacity-50">&lt;</button>
                            <div className="flex items-center gap-1 px-2">
                                {getVisiblePageNumbers().map((page) => (
                                    <button key={page} onClick={() => handlePageChange(page)} className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold ${currentPage === page ? 'bg-white/30 text-white' : 'text-white'}`}>{page}</button>
                                ))}
                            </div>
                            <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#D63384] disabled:opacity-50">&gt;</button>
                        </div>
                    </div>
                )}
            </div>
         </div>
      </div>
    </main>
  );
}