"use client";

import { Poppins } from "next/font/google";
import TimHero from "./_components/TimHero";
import ProfileCard from "./_components/ProfileCard";
import ProfileSlider from "./_components/ProfileSlider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
});

const pengelolaProfiles = [
  { name: "A Khairudin", role: "Solidarity Maker" },
  { name: "Ragil Maulana A.", role: "General Manager" },
  { name: "Izza Nadia Hikma", role: "Sekretaris" },
  { name: "Titis Wijayanti", role: "Bendahara" },
  { name: "Tommy Ari Wibowo", role: "Manajer Ruang" },
  { name: "Arif Fitra Kurniawan", role: "Divisi Riset" },
  { name: "Purna Cipta N.", role: "Deputi Sapu Jagad" },
  { name: "Istiqbalul F. Asteja", role: "Direktur Bukit Buku" },
];

const artlabProfiles = [
  { name: "Tyok Hari", role: "Staff Hysteria Artlab" },
  { name: "Hananingsih W.", role: "Staff Hysteria Artlab" },
  { name: "Humam Zidni Ahmad", role: "Staff Hysteria Artlab" },
  { name: "Wan Fajar", role: "Staff Hysteria Artlab" },
  { name: "Mukhammad J. F.", role: "Staff Hysteria Artlab" },
  { name: "Anita Dewi", role: "Staff Hysteria Artlab" },
  { name: "Dheni Fattah", role: "Staff Hysteria Artlab" },
];

const pekakotaProfiles = [
  { name: "Pujo Nugroho", role: "Staff Pekakota" },
  { name: "Nella Ardiantanti S.", role: "Staff Pekakota" },
  { name: "Radit Bayu Anggoro", role: "Staff Pekakota" },
  { name: "Yasin Fajar", role: "Staff Pekakota" },
  { name: "Salma Ibrahim", role: "Staff Pekakota" },
];

export default function TimPage() {
  return (
    <main className={`${poppins.variable} font-sans bg-white min-h-screen pb-32`}>
      <TimHero />

      {/* Section 1: Pengelola Hysteria (Grid) */}
      <section className="py-20 relative px-4 md:px-0">

        <div className="max-w-[1400px] mx-auto mt-12 md:mt-24">
          <h2 className="text-center font-bold text-[32px] md:text-[40px] leading-[1.5] mb-16 text-black font-poppins">Pengelola Hysteria</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 justify-items-center">
            {pengelolaProfiles.map((p, i) => (
              <ProfileCard
                key={i}
                {...p}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Hysteria Artlab (Slider) */}
      <ProfileSlider
        title="Pengurus Hysteria Artlab"
        profiles={artlabProfiles}
      />

      {/* Section 3: Pengurus Pekakota (Slider) */}
      <ProfileSlider
        title="Pengurus Pekakota"
        profiles={pekakotaProfiles}
      />
    </main>
  );
}
