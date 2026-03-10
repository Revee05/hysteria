export default function CollaborationWhatsApp({
  whatsappNumber = "6281214272483",
  message = "Halo, saya tertarik untuk berkolaborasi dengan Hysteria",
}) {
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section className="bg-white pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-[0_12px_30px_rgba(0,0,0,0.12)] md:px-12">
          <h4 className="text-xl font-extrabold tracking-tight md:text-xl">Masih Ragu untuk Berkolaborasi</h4>
          <p className="mx-auto mt-4 max-w-2xl text-xs leading-6 text-zinc-700">
            Hubungi kami langsung via WhatsApp untuk pertanyaan mendesak atau diskusi langsung
          </p>

          <div className="mt-8">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#2F2237] px-10 py-3 text-xs font-semibold text-white shadow transition-colors hover:bg-[#1f1627]"
            >
              Chat WhatsApp Sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
