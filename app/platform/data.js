/**
 * Layout types for category pages:
 * - 'carousel' : Hero section + sub-categories each rendered as horizontal card sliders (e.g. Podcast Artlab)
 * - 'grid'     : Hero section + search/filter bar + card grid (e.g. Workshop Artlab)
 *
 * Each category can define:
 *   layout        : 'carousel' | 'grid'  (default: 'grid')
 *   subCategories : (for carousel) array of { title, slug, linkUrl?, items[] }
 *   items         : (for grid) flat array of card items
 *   filters       : (for grid) array of filter tag strings
 */

export const PLATFORM_DATA = {
  'hysteria-artlab': {
    head: {
      title: 'Laboratorium seni, eksperimentasi, dan kolaborasi',
      description: 'Artlab Hysteria adalah ruang kolaborasi seni-budaya tempat ide diuji, diproduksi, dan dipertemukan dengan publik. Kami membuka laboratorium terbuka bagi eksperimen lintas disiplin, kerja kolektif, dan pengembangan program yang relevan dengan konteks sosial hari ini.',
      instagramUrl: '#',
      youtubeUrl: '#',
      images: [
        { src: '/image/Artlab.jpg', alt: 'ArtLab' }
      ]
    },
    categories: [
      {
        title: 'Merchandise',
        slug: 'merchandise',
        url: '/platform/hysteria-artlab/merchandise',
        image: '/image/list-item.jpg',
        description: 'Produk dan merchandise yang dihasilkan oleh kolaborasi dan program Artlab.',
        layout: 'grid',
        filters: [],
        items: []
      },
      {
        title: 'Podcast Artlab',
        slug: 'podcast-artlab',
        url: '/platform/hysteria-artlab/podcast-artlab',
        image: '/image/list-item.jpg',
        description: 'Menceritakan seni budaya dan kehidupan kampung melalui kerja kolaborasi dengan bermain.',
        layout: 'carousel',
        subCategories: [
          {
            title: 'Stonen 29 Radio Show',
            slug: 'stonen-29-radio-show',
            cardType: 'poster',
            linkUrl: '#',
            items: [
              { src: '/image/bakso_bakar.webp', alt: 'Episode 1', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Akan Berlangsung', meta: 'Sabtu, 8 Maret 2026'},
              { src: '/image/artist.webp', alt: 'Episode 2', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Sedang Berlangsung', meta: 'Sabtu, 15 Maret 2026'},
              { src: '/image/DummyPoster.webp', alt: 'Episode 3', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Telah Berakhir', meta: 'Sabtu, 22 Maret 2026'},
              { src: '/image/bakso_malang.jpg', alt: 'Episode 1', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Akan Berlangsung', meta: 'Sabtu, 8 Maret 2026'},
              { src: '/image/DummyPoster.webp', alt: 'Episode 2', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Sedang Berlangsung', meta: 'Sabtu, 15 Maret 2026'},
              { src: '/image/artist.webp', alt: 'Episode 3', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Telah Berakhir', meta: 'Sabtu, 22 Maret 2026'},
              { src: '/image/DummyPoster.webp', alt: 'Episode 1', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Akan Berlangsung', meta: 'Sabtu, 8 Maret 2026'},
              { src: '/image/bakso_malang.jpg', alt: 'Episode 2', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Sedang Berlangsung', meta: 'Sabtu, 15 Maret 2026'},
              { src: '/image/DummyPoster.webp', alt: 'Episode 3', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Telah Berakhir', meta: 'Sabtu, 22 Maret 2026'},
              { src: '/image/artist.webp', alt: 'Episode 1', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Akan Berlangsung', meta: 'Sabtu, 8 Maret 2026'},
              { src: '/image/DummyPoster.webp', alt: 'Episode 2', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Sedang Berlangsung', meta: 'Sabtu, 15 Maret 2026'},
              { src: '/image/bakso_malang.jpg', alt: 'Episode 3', title: 'Di Korea Mung Pindah Turu Tok! ~Buah Tangan dari Korsel~', badge: 'Telah Berakhir', meta: 'Sabtu, 22 Maret 2026'},
            ]
          },
          {
            title: 'Anitalk',
            slug: 'anitalk',
            cardType: 'video',
            linkUrl: '#',
            items: [
              { src: 'https://youtu.be/D0UnqGm_miA', alt: 'Anitalk 1', title: 'Anitalk Episode 1', timestamp: '22.00' },
              { src: '/image/video.webp', alt: 'Anitalk 2', title: 'Anitalk Episode 2', timestamp: '22.00' },
              { src: '/image/video.webp', alt: 'Anitalk 3', title: 'Anitalk Episode 3', timestamp: '22.00' },
            ]
          },
          {
            title: 'Artist Radar',
            slug: 'artist-radar',
            cardType: 'artist',
            linkUrl: '#',
            items: [
              { src: '/image/artist.webp', alt: 'Artist 1', name: 'Nama Artist 1', role: 'Vocalist & Lyricist', episode: 'Edisi 1' },
              { src: '/image/artist.webp', alt: 'Artist 2', name: 'Nama Artist 2', role: 'Producer & Beatmaker', episode: 'Edisi 2' },
              { src: '/image/artist.webp', alt: 'Artist 3', name: 'Nama Artist 3', role: 'Visual Artist', episode: 'Edisi 3' },
            ]
          }
        ]
      },
      {
        title: 'Workshop',
        slug: 'workshop',
        url: '/platform/hysteria-artlab/workshop',
        image: '/image/list-item.jpg',
        description: 'Menceritakan seni budaya dan kehidupan kampung melalui kerja kolaborasi dengan bermain.',
        layout: 'grid',
        filters: ['Having Fun Artlab', 'Peltoe', 'test1', 'test2', 'test3', 'test4', 'test5'],
        items: [
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Having Fun Artlab', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Having Fun Artlab', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Peltoe', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Peltoe', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Having Fun Artlab', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Having Fun Artlab', badge: null, meta: null },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Peltoe', badge: 'Akan Berlangsung', meta: 'Sabtu, 29 Maret 2026' },
          { src: '/image/DummyPoster.webp', title: 'AI SUNRISE WALK MERAPI', tag: 'Peltoe', badge: 'Telah Berakhir', meta: 'Sabtu, 22 Maret 2026' },
        ]
      },
      {
        title: 'Screening Film',
        slug: 'screening-film',
        url: '/platform/hysteria-artlab/screening-film',
        image: '/image/list-item.jpg',
        description: 'Jadwal pemutaran film dan diskusi seputar karya-karya eksperimental dan independen.',
        layout: 'grid',
        filters: [],
        items: []
      },
      {
        title: 'Untuk Perhatian',
        slug: 'untuk-perhatian',
        url: '/platform/hysteria-artlab/untuk-perhatian',
        image: '/image/list-item.jpg',
        description: 'Proyek dan inisiatif yang dirancang untuk menarik perhatian publik dan mendorong dialog.',
        layout: 'grid',
        filters: [],
        items: []
      }
    ],
    mediaURL: 'https://www.youtube.com/embed/M7lc1UVf-VE'
  },
  'ditampart': {
    head: {
      title: 'Laboratorium Para Seniman Semarang Eksis',
      description: 'Kolektif Hysteria merupakan ruang produksi artistik sekaligus fasilitator untuk pertemuan lintas disipliner dalam skala lokal hingga global untuk mencari trobosan-trobosan dalam persoalan kreatifitas, seni, komunitas, anak muda, dan isu kota.',
      images: [
        { src: '/image/ditampart1.png', alt: 'Ditam Part' },
        { src: '/image/ditampart2.png', alt: 'Ditam Part' },
      ],
      multyImages: true
    },
    categories: [
      { title: '3D', slug: '3d', url: '/platform/ditampart/3d', image: '/image/list-item.jpg', description: 'Karya dan eksperimen 3D: pemodelan, instalasi, dan prototipe.', layout: 'grid', filters: [], items: [] },
      { title: 'Foto Kegiatan', slug: 'foto-kegiatan', url: '/platform/ditampart/foto-kegiatan', image: '/image/list-item.jpg', description: 'Dokumentasi foto dari berbagai kegiatan dan pameran Ditampart.', layout: 'grid', filters: [], items: [] },
      { title: 'Mockup dan Poster', slug: 'mockup-dan-poster', url: '/platform/ditampart/mockup-dan-poster', image: '/image/list-item.jpg', description: 'Koleksi mockup, poster, dan materi grafis yang diproduksi oleh kolektif.', layout: 'grid', filters: [], items: [] },
      { title: 'Short Film Dokumenter', slug: 'short-film-dokumenter', url: '/platform/ditampart/short-film-dokumenter', image: '/image/list-item.jpg', description: 'Film pendek dokumenter yang merekam proses kreatif dan cerita para pelaku.', layout: 'carousel', subCategories: [] },
      { title: 'Event Ditampart', slug: 'event-ditampart', url: '/platform/ditampart/event-ditampart', image: '/image/list-item.jpg', description: 'Informasi acara, pameran, dan kegiatan publik yang diselenggarakan Ditampart.', layout: 'grid', filters: [], items: [] },
    ],
    mediaURL: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  'laki-masak': {
    head: {
      title: 'Panggung Ekspresi Menghadirkan Sejuta Rasa dan Cerita',
      description: 'Laki Masak adalah ruang masak yang nggak cuma soal resep, tapi juga soal cerita, obrolan, dan sikap. Di dapur, laki-laki hadir bukan buat pamer jago, tapi buat berbagi—tentang rasa, proses, ingatan, dan keseharian yang sering luput dibicarakan.',
      instagramUrl: '#',
      youtubeUrl: '#',
      images: [
        { src: '/image/Artlab.jpg', alt: 'Laki Masak' }
      ]
    },
    categories: [
      { title: 'Meramu', slug: 'meramu', url: '/platform/laki-masak/meramu', image: '/image/list-item.jpg', description: 'Resep, teknik, dan pendekatan memasak yang dipraktekkan dalam proyek Laki Masak.', layout: 'grid', filters: [], items: [] },
      { title: 'Homecooked', slug: 'homecooked', url: '/platform/laki-masak/homecooked', image: '/image/list-item.jpg', description: 'Menu dan sajian rumahan hasil kolaborasi komunitas dan program Laki Masak.', layout: 'grid', filters: [], items: [] },
      { title: 'Komik Ramuan', slug: 'komik-ramuan', url: '/platform/laki-masak/komik-ramuan', image: '/image/list-item.jpg', description: 'Ilustrasi dan komik yang mengeksplorasi tema makanan, resep, dan budaya.', layout: 'carousel', subCategories: [] },
      { title: 'Pre-Order', slug: 'pre-order', url: '/platform/laki-masak/pre-order', image: '/image/list-item.jpg', description: 'Informasi pre-order untuk produk makanan atau paket kuliner dari program.', layout: 'grid', filters: [], items: [] },
    ],
    mediaURL: 'https://www.youtube.com/embed/e-ORhEE9VVg'
  }
}
