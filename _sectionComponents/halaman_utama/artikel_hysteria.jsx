export default function ArtikelHysteria() {
  const articles = [
    {
      title: "Seni Jalanan sebagai Resistensi",
      excerpt: "Melihat bagaimana seni jalanan menjadi medium perlawanan terhadap homogenisasi ruang kota.",
      date: "23 Jan 2026"
    },
    {
      title: "Dokumentasi Independen di Era Digital",
      excerpt: "Pentingnya arsip dan dokumentasi mandiri untuk menjaga memori kolektif komunitas.",
      date: "20 Jan 2026"
    },
    {
      title: "Ruang Kreatif Bersama",
      excerpt: "Membangun ekosistem seni-budaya yang inklusif dan berkelanjutan di Semarang.",
      date: "18 Jan 2026"
    }
  ];

  return (
    <section className="w-full max-w-[1200px] mx-auto py-20 text-white">
      <h2 className="text-3xl sm:text-4xl font-bold mb-12">Buku Buku</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <article key={idx} className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800 hover:border-zinc-600 transition-colors">
            <time className="text-sm text-zinc-500">{article.date}</time>
            <h3 className="text-xl font-semibold mt-2 mb-3">{article.title}</h3>
            <p className="text-zinc-400 text-sm">{article.excerpt}</p>
            <a href="#" className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300">
              Baca selengkapnya →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
