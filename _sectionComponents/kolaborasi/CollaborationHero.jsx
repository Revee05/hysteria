import { ArrowDown } from "lucide-react";

export default function CollaborationHero({
  title = "Mari Berkolaborasi",
  description =
    "Kami membuka ruang kolaborasi bagi individu, komunitas, dan institusi yang ingin menciptakan program, event, dan inisiatif berdampak bersama.",
  googleFormUrl = "#form-kolaborasi",
  notesText =
    "Kolaborasi bagi kami bukan sekadar kerja sama, melainkan proses saling belajar, berbagi peran, dan membangun dampak jangka panjang.",
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-6 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-700">{description}</p>

          <div className="mt-8">
            <a
              href={googleFormUrl}
              target={googleFormUrl.startsWith("http") ? "_blank" : undefined}
              rel={googleFormUrl.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center justify-center rounded-md bg-[#E93C8E] px-6 py-3 text-xs font-semibold text-white shadow transition-colors hover:bg-[#d63581]"
            >
              Ajukan Kolaborasi
            </a>
          </div>

          <p className="mx-auto mt-14 max-w-3xl text-xs leading-6 text-zinc-700">"{notesText}"</p>

          <div className="mt-10 flex justify-center pb-10">
            <a
              href="#mengapa"
              aria-label="Scroll ke section berikutnya"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#E93C8E] text-[#E93C8E]"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
