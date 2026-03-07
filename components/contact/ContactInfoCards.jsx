import { MapPin, Clock3 } from "lucide-react";

export default function ContactInfoCards({ contactData }) {
  const locationTitle = contactData?.locationTitle || "Gerobak Artkos x Hysteria";
  const locationAddress =
    contactData?.locationAddress ||
    "Jl. Stonen No.29, Bendan Ngisor, Kec. Gajahmungkur,\nKota Semarang, Jawa Tengah 50233";
  const operationalHours =
    contactData?.operationalHours ||
    "Senin - Jumat: 09:00 - 17:00 WIB\nSabtu: 10:00 - 15:00 WIB\nMinggu & Libur: Tutup";

  return (
    <section className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="rounded-xl bg-[#9B95A0] px-8 pb-[30px] pt-[38px] text-white shadow-lg">
        <div className="place-items-center pb-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow">
            <MapPin className="h-6 w-6 text-[#FF8FB7]" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-[#43334C]">Lokasi Kami</h2>
        <div className="mt-[20px] mb-[20px] text-center text-sm leading-6">
          <div className="font-semibold">{locationTitle}</div>
          <div className="opacity-95 whitespace-pre-line">{locationAddress}</div>
        </div>
      </div>

      <div className="rounded-xl bg-[#9B95A0] px-8 pb-[30px] pt-[38px] text-white shadow-lg">
        <div className="place-items-center pb-4">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow">
            <Clock3 className="h-6 w-6 text-[#FF8FB7]" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-[#43334C]">Jam Operasional</h2>
        <div className="mt-[20px] mb-[20px] text-center text-sm leading-6 whitespace-pre-line">
          {operationalHours}
        </div>
      </div>
    </section>
  );
}
