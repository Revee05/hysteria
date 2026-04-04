import { Instagram, Facebook, Youtube, Mail, X, Music2 } from "lucide-react";

export default function SocialMediaSection({ contactData }) {
  const instagram = contactData?.instagramUrl || "https://instagram.com/grobakhysteria";
  const facebook = contactData?.facebookUrl || "https://facebook.com/kolektifhysteria";
  const twitter = contactData?.twitterUrl || "https://twitter.com/grobakhysteria";
  const youtube = contactData?.youtubeUrl || "https://youtube.com/@kolektifhysteria";
  const tiktok = contactData?.tiktokUrl;
  const email = contactData?.email || "hysteriakita59@gmail.com";

  return (
    <section className="mt-14 md:mt-18 lg:mt-20 mb-14 md:mb-20 lg:mb-24 text-center">
      <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">Terhubung di Media Sosial</h3>
      <p className="mx-auto mt-3 md:mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-zinc-700 leading-relaxed">
        Dapatkan update terbaru tentang kegiatan, proyek, dan gerakan seni sosial kami
      </p>

      <div className="mt-7 md:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
              <Instagram className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-[#2F2237]">Instagram</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-600">Kolektif Hysteria</div>
            </div>
          </a>
        )}

        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
              <Facebook className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-[#2F2237]">Facebook</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-600">Kolektif Hysteria</div>
            </div>
          </a>
        )}

        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
              <X className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-[#2F2237]">Twitter/X</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-600">@grobakhysteria</div>
            </div>
          </a>
        )}

        {youtube && (
          <a
            href={youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
              <Youtube className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-[#2F2237]">Youtube</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-600">Kolektif Hysteria</div>
            </div>
          </a>
        )}

        <a
          href={`mailto:${email}`}
          className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
        >
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
            <Mail className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
          </div>
          <div>
            <div className="text-sm md:text-base font-extrabold text-[#2F2237]">Gmail</div>
            <div className="mt-1 text-xs sm:text-sm text-zinc-600 break-all">{email}</div>
          </div>
        </a>

        {tiktok && (
          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 sm:gap-4 rounded-lg bg-white px-4 sm:px-5 md:px-6 py-4 sm:py-5 text-left shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="grid h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 place-items-center rounded-md bg-white">
              <Music2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-[#2F2237]" />
            </div>
            <div>
              <div className="text-sm md:text-base font-extrabold text-[#2F2237]">TikTok</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-600">Kolektif Hysteria</div>
            </div>
          </a>
        )}
      </div>
    </section>
  );
}
