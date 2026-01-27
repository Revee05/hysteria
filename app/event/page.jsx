import Image from "next/image";

const events = [
  {
    id: 1,
    title: "Workshop React Advanced",
    date: "25 Januari 2026",
    location: "Jakarta Convention Center",
    category: "Workshop",
    desc: "Pelajari teknik-teknik advanced React untuk membangun aplikasi yang lebih powerful.",
  },
  {
    id: 2,
    title: "Music Festival Hysteria 2026",
    date: "15 Februari 2026",
    location: "GBK Senayan",
    category: "Festival",
    desc: "Festival musik terbesar tahun ini dengan berbagai artis ternama.",
  },
  {
    id: 3,
    title: "Tech Talk: AI & Web Development",
    date: "5 Maret 2026",
    location: "Online",
    category: "Seminar",
    desc: "Diskusi tentang bagaimana AI mengubah landscape web development modern.",
  },
  {
    id: 4,
    title: "Konser Indie Night",
    date: "20 Maret 2026",
    location: "Rolling Stone Cafe",
    category: "Konser",
    desc: "Malam penuh musik indie dari band-band lokal terbaik.",
  },
];

export default function EventPage() {
  return (
    <div className="flex items-center justify-center bg-zinc-900 text-white font-sans dark:bg-black">
      <div className="relative w-full max-w-[1920px] lg:w-[1920px] min-h-screen mx-auto flex flex-col items-center justify-start py-32 px-16 bg-[#0b1220] sm:items-start opacity-100">
        <h1 className="text-4xl font-bold mb-2">Event</h1>
        <p className="text-zinc-400 mb-8">Temukan event menarik yang akan datang</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {events.map((event) => (
            <article
              key={event.id}
              className="bg-[#0f1724] p-6 rounded-lg shadow hover:bg-[#1a2332] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 bg-blue-600 text-xs rounded-full">
                  {event.category}
                </span>
                <span className="text-sm text-zinc-400">{event.date}</span>
              </div>

              <h2 className="text-2xl font-semibold mb-2">{event.title}</h2>
              
              <div className="flex items-center text-sm text-zinc-300 mb-3">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {event.location}
              </div>

              <p className="text-zinc-400 text-sm mb-4">{event.desc}</p>

              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded transition-colors">
                Lihat Detail
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
