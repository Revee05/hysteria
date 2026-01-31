
const { Client } = require('pg')
const logger = require('../../lib/logger')

module.exports = async function seed() {
	const url = process.env.DATABASE_URL
	if (!url) {
		logger.warn('DATABASE_URL not set; skipping 009-nav-category')
		return
	}

	const client = new Client({ connectionString: url })
	await client.connect()

	// Define categories and items according to NavigationSystemPlan
	const categories = [
		{ title: 'Program Hysteria', slug: 'program-hysteria', order: 0 },
		{ title: 'Platform', slug: 'platform', order: 1 },
		{ title: 'Artikel', slug: 'artikel', order: 2 }
	]

	const items = [
		// Program Hysteria (category: program-hysteria)
		{ categorySlug: 'program-hysteria', title: 'Festival dan Pameran', slug: 'festival-dan-pameran', url: '/program/festival', order: 0, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Festival Kampung', slug: 'festival-kampung', url: '/program/festival-kampung', order: 0, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Gebyuran Bustaman', slug: 'gebyuran-bustaman', url: '/program/festival-kampung/gebyuran-bustaman', order: 0, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Nginguk Githok', slug: 'nginguk-githok', url: '/program/festival-kampung/nginguk-githok', order: 1, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Festival Bukit Jatiwayang', slug: 'festival-bukit-jatiwayang', url: '/program/festival-kampung/festival-bukit-jatiwayang', order: 2, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Sobo Roworejo', slug: 'sobo-roworejo', url: '/program/festival-kampung/sobo-roworejo', order: 3, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Srawung Sendang', slug: 'srawung-sendang', url: '/program/festival-kampung/srawung-sendang', order: 4, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Festival Ngijo', slug: 'festival-ngijo', url: '/program/festival-kampung/festival-ngijo', order: 5, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Banyu Pitu', slug: 'banyu-pitu', url: '/program/festival-kampung/banyu-pitu', order: 6, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Bulusan Fest', slug: 'bulusan-fest', url: '/program/festival-kampung/bulusan-fest', order: 7, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Labuhan Kali', slug: 'labuhan-kali', url: '/program/festival-kampung/labuhan-kali', order: 8, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Iki Buntu Fest', slug: 'iki-buntu-fest', url: '/program/festival-kampung/iki-buntu-fest', order: 9, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Festival ke Tugu', slug: 'festival-ke-tugu', url: '/program/festival-kampung/festival-ke-tugu', order: 10, parentSlug: 'festival-kampung' },

		{ categorySlug: 'program-hysteria', title: 'Festival Kota', slug: 'festival-kota', url: '/program/festival-kota', order: 1, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Zine Fest', slug: 'zine-fest', url: '/program/festival-kota/zine-fest', order: 0, parentSlug: 'festival-kota' },
		{ categorySlug: 'program-hysteria', title: 'Semarang Writers Week', slug: 'semarang-writers-week', url: '/program/festival-kota/semarang-writers-week', order: 1, parentSlug: 'festival-kota' },
		{ categorySlug: 'program-hysteria', title: 'City Canvas', slug: 'city-canvas', url: '/program/festival-kota/city-canvas', order: 2, parentSlug: 'festival-kota' },
		{ categorySlug: 'program-hysteria', title: 'Dokumentaria', slug: 'dokumentaria', url: '/program/festival-kota/dokumentaria', order: 3, parentSlug: 'festival-kota' },

		{ categorySlug: 'program-hysteria', title: 'Biennale', slug: 'biennale', url: '/program/festival-biennale', order: 2, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Pentak Labs', slug: 'pentak-labs', url: '/program/festival-biennale/pentak-labs', order: 0, parentSlug: 'biennale' },
		{ categorySlug: 'program-hysteria', title: 'Tengok Bustaman', slug: 'tengok-bustaman', url: '/program/festival-biennale/tengok-bustaman', order: 1, parentSlug: 'biennale' },

		{ categorySlug: 'program-hysteria', title: 'Forum', slug: 'forum', url: '/program/forum', order: 3, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Temu Jejaring', slug: 'temu-jejaring', url: '/program/forum/temu-jejaring', order: 0, parentSlug: 'forum' },
		{ categorySlug: 'program-hysteria', title: 'Buah tangan', slug: 'buah-tangan', url: '/program/forum/buah-tangan', order: 1, parentSlug: 'forum' },
		{ categorySlug: 'program-hysteria', title: 'Lawatan Jalan Terus', slug: 'lawatan-jalan-terus', url: '/program/forum/lawatan-jalan-terus', order: 2, parentSlug: 'forum' },
		{ categorySlug: 'program-hysteria', title: 'Simposium', slug: 'simposium', url: '/program/forum/simposium', order: 3, parentSlug: 'forum' },
		{ categorySlug: 'program-hysteria', title: 'Meditasi', slug: 'meditasi', url: '/program/forum/meditasi', order: 4, parentSlug: 'forum' },

		{ categorySlug: 'program-hysteria', title: 'Podcast', slug: 'podcast', url: '/program/podcast', order: 4, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Safari Memori', slug: 'safari-memori', url: '/program/podcast/safari-memori', order: 0, parentSlug: 'podcast' },
		{ categorySlug: 'program-hysteria', title: 'Aston', slug: 'aston', url: '/program/podcast/aston', order: 1, parentSlug: 'podcast' },
		{ categorySlug: 'program-hysteria', title: 'Sore di Stonen', slug: 'sore-di-stonen', url: '/program/podcast/sore-di-stonen', order: 2, parentSlug: 'podcast' },

		{ categorySlug: 'program-hysteria', title: 'Music', slug: 'music', url: '/program/music', order: 5, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'SGRT', slug: 'sgrt', url: '/program/music/sgrt', order: 0, parentSlug: 'music' },
		{ categorySlug: 'program-hysteria', title: 'Kotak Listrik', slug: 'kotak-listrik', url: '/program/music/kotak-listrik', order: 1, parentSlug: 'music' },
		{ categorySlug: 'program-hysteria', title: 'Di(e)gital', slug: 'die-gital', url: '/program/music/die-gital', order: 2, parentSlug: 'music' },
		{ categorySlug: 'program-hysteria', title: 'Bunyi Halaman Belakang', slug: 'bunyi-halaman-belakang', url: '/program/music/bunyi-halaman-belakang', order: 3, parentSlug: 'music' },
		{ categorySlug: 'program-hysteria', title: 'Folk Me Up', slug: 'folk-me-up', url: '/program/music/folk-me-up', order: 4, parentSlug: 'music' },

		{ categorySlug: 'program-hysteria', title: 'Pemutaran Film', slug: 'pemutaran-film', url: '/program/pemutaran-film', order: 6, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Screening AM', slug: 'screening-am-film', url: '/program/pemutaran-film/screening-am', order: 0, parentSlug: 'pemutaran-film' },
		{ categorySlug: 'program-hysteria', title: 'Lawatan Bandeng Keliling', slug: 'lawatan-bandeng-keliling-film', url: '/program/pemutaran-film/lawatan-bandeng-keliling', order: 1, parentSlug: 'pemutaran-film' },

		{ categorySlug: 'program-hysteria', title: 'Residensi dan Workshop', slug: 'residensi-dan-workshop', url: '/program/residensi-workshop', order: 7, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Flash Residency', slug: 'flash-residency', url: '/program/residensi-workshop/flash-residency', order: 0, parentSlug: 'residensi-dan-workshop' },
		{ categorySlug: 'program-hysteria', title: 'Kandang Tandang', slug: 'kandang-tandang', url: '/program/residensi-workshop/kandang-tandang', order: 1, parentSlug: 'residensi-dan-workshop' },

		{ categorySlug: 'program-hysteria', title: 'Video Series', slug: 'video-series', url: '/program/video-series', order: 8, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Screening AM', slug: 'screening-am-video', url: '/program/video-series/screening-am', order: 0, parentSlug: 'video-series' },
		{ categorySlug: 'program-hysteria', title: 'Lawatan Bandeng Keliling', slug: 'lawatan-bandeng-keliling-video', url: '/program/video-series/lawatan-bandeng-keliling', order: 1, parentSlug: 'video-series' },

		// Platform (category: platform)
		{ categorySlug: 'platform', title: 'Hysteria Artlab', slug: 'hysteria-artlab', url: '/platform/artlab', order: 0, parentSlug: null },
		{ categorySlug: 'platform', title: 'Merchandise', slug: 'merchandise', url: '/platform/artlab/merchandise', order: 0, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Podcast Artlab', slug: 'podcast-artlab', url: '/platform/artlab/podcast-artlab', order: 1, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Stonen 29 Radio Show', slug: 'stonen-29-radio-show', url: '/platform/artlab/podcast-artlab/stonen-29-radio-show', order: 0, parentSlug: 'podcast-artlab' },
		{ categorySlug: 'platform', title: 'Anitalk', slug: 'anitalk', url: '/platform/artlab/podcast-artlab/anitalk', order: 1, parentSlug: 'podcast-artlab' },
		{ categorySlug: 'platform', title: 'Artist Radar', slug: 'artist-radar', url: '/platform/artlab/podcast-artlab/artist-radar', order: 2, parentSlug: 'podcast-artlab' },
		{ categorySlug: 'platform', title: 'Workshop', slug: 'workshop', url: '/platform/artlab/workshop', order: 2, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Having Fun Artlab', slug: 'having-fun-artlab', url: '/platform/artlab/workshop/having-fun-artlab', order: 0, parentSlug: 'workshop' },
		{ categorySlug: 'platform', title: 'Peltoe', slug: 'peltoe', url: '/platform/artlab/workshop/peltoe', order: 1, parentSlug: 'workshop' },
		{ categorySlug: 'platform', title: 'Screening Film', slug: 'screening-film', url: '/platform/artlab/screening-film', order: 2, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Making Artist', slug: 'making-artist', url: '/platform/artlab/screening-film/making-artist', order: 0, parentSlug: 'screening-film' },
		{ categorySlug: 'platform', title: 'Usil', slug: 'usil', url: '/platform/artlab/screening-film/usil', order: 1, parentSlug: 'screening-film' },
		{ categorySlug: 'platform', title: 'Untuk Perhatian', slug: 'untuk-perhatian', url: '/platform/artlab/untuk-perhatian', order: 3, parentSlug: 'hysteria-artlab' },

		{ categorySlug: 'platform', title: 'Ditampart', slug: 'ditampart', url: '/platform/ditampart', order: 2, parentSlug: null },
		{ categorySlug: 'platform', title: '3D', slug: '3d', url: '/platform/ditampart/3d', order: 0, parentSlug: 'ditampart' },
		{ categorySlug: 'platform', title: 'Mockup dan Poster', slug: 'mockup-dan-poster', url: '/platform/ditampart/mockup-dan-poster', order: 1, parentSlug: 'ditampart' },
		{ categorySlug: 'platform', title: 'Short Dokumentasi', slug: 'short-dokumentasi', url: '/platform/ditampart/short-dokumentasi', order: 2, parentSlug: 'ditampart' },
		{ categorySlug: 'platform', title: 'Dokumentasi ditampart', slug: 'dokumentasi-ditampart', url: '/platform/ditampart/dokumentasi-ditampart', order: 3, parentSlug: 'ditampart' },

		{ categorySlug: 'platform', title: 'Laki Masak', slug: 'laki-masak', url: '/platform/laki-masak', order: 3, parentSlug: null },
		{ categorySlug: 'platform', title: 'Meramu', slug: 'meramu', url: '/platform/laki-masak/meramu', order: 0, parentSlug: 'laki-masak' },
		{ categorySlug: 'platform', title: 'Homecooked', slug: 'homecooked', url: '/platform/laki-masak/homecooked', order: 1, parentSlug: 'laki-masak' },
		{ categorySlug: 'platform', title: 'Komik Ramuan', slug: 'komik-ramuan', url: '/platform/laki-masak/komik-ramuan', order: 2, parentSlug: 'laki-masak' },
		{ categorySlug: 'platform', title: 'Pre-Order', slug: 'pre-order', url: '/platform/laki-masak/pre-order', order: 3, parentSlug: 'laki-masak' },

		{ categorySlug: 'platform', title: 'Pekakota', slug: 'pekakota', url: '/platform/pekakota', order: 4, parentSlug: null },
		{ categorySlug: 'platform', title: 'Bukit Buku', slug: 'bukit-buku', url: '/platform/bukit-buku', order: 5, parentSlug: null },

		// Artikel (category: artikel)
		{ categorySlug: 'artikel', title: 'Esai', slug: 'esai', url: '/artikel/esai', order: 0, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Bedah Buku', slug: 'bedah-buku', url: '/artikel/bedah-buku', order: 1, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Zine', slug: 'zine', url: '/artikel/zine', order: 2, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Media Partner', slug: 'media-partner', url: '/artikel/media-partner', order: 3, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Rilisan Buku', slug: 'rilisan-buku', url: '/artikel/rilisan-buku', order: 4, parentSlug: null }
	]

	try {
		logger.info('009: Seeding navigation categories and items...')
		await client.query('BEGIN')

		// Upsert categories and build mapping slug -> id
		const categoryMap = {}
		for (const cat of categories) {
			const res = await client.query(
				`INSERT INTO "Category" ("title", "slug", "order", "isActive", "createdAt", "updatedAt")
				 VALUES ($1, $2, $3, true, now(), now())
				 ON CONFLICT ("slug") DO UPDATE
				 SET "title" = EXCLUDED."title", "order" = EXCLUDED."order", "isActive" = true, "updatedAt" = now()
				 RETURNING "id"`,
				[cat.title, cat.slug, cat.order]
			)
			categoryMap[cat.slug] = res.rows[0].id
		}

		// Insert items without parentId first
		const itemMap = {} // key: categorySlug|itemSlug -> id
		for (const it of items) {
			// insert or update based on slug + categoryId existence
			const categoryId = categoryMap[it.categorySlug]
			if (!categoryId) throw new Error(`Category not found: ${it.categorySlug}`)

			// Try find existing
			const found = await client.query(
				`SELECT id FROM "CategoryItem" WHERE "slug" = $1 AND "categoryId" = $2 LIMIT 1`,
				[it.slug, categoryId]
			)

			if (found.rows[0]?.id) {
				// update
				const upd = await client.query(
					`UPDATE "CategoryItem"
					 SET "title" = $1, "url" = $2, "order" = $3, "isActive" = true, "updatedAt" = now()
					 WHERE id = $4
					 RETURNING id`,
					[it.title, it.url, it.order, found.rows[0].id]
				)
				itemMap[`${it.categorySlug}|${it.slug}`] = upd.rows[0].id
			} else {
				const ins = await client.query(
					`INSERT INTO "CategoryItem" ("categoryId", "parentId", "title", "slug", "url", "order", "meta", "isActive", "createdAt", "updatedAt")
					 VALUES ($1, NULL, $2, $3, $4, $5, NULL, true, now(), now())
					 RETURNING id`,
					[categoryId, it.title, it.slug, it.url, it.order]
				)
				itemMap[`${it.categorySlug}|${it.slug}`] = ins.rows[0].id
			}
		}

		// Second pass: set parentId where applicable
		for (const it of items) {
			if (!it.parentSlug) continue
			const childKey = `${it.categorySlug}|${it.slug}`
			const parentKey = `${it.categorySlug}|${it.parentSlug}`
			const childId = itemMap[childKey]
			const parentId = itemMap[parentKey]
			if (!childId) throw new Error(`Child item not found: ${childKey}`)
			if (!parentId) throw new Error(`Parent item not found: ${parentKey}`)

			await client.query(
				`UPDATE "CategoryItem" SET "parentId" = $1, "updatedAt" = now() WHERE id = $2`,
				[parentId, childId]
			)
		}

		await client.query('COMMIT')
		logger.info('009: Navigation seed complete')
	} catch (e) {
		await client.query('ROLLBACK')
		logger.error('009 seeder error:', { error: e.message })
		throw e
	} finally {
		await client.end()
	}
}
