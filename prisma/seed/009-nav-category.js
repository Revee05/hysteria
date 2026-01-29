
const { Client } = require('pg')
const logger = require('../../lib/logger')

module.exports = async function seed() {
	const url = process.env.DATABASE_URL
	if (!url) {
		logger.warn('DATABASE_URL not set; skipping 008-nav-category')
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
		{ categorySlug: 'program-hysteria', title: 'Festival Kampung', slug: 'festival-kampung', url: '/program/festival/kampung', order: 0, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Festival Kampung Baharu', slug: 'kampung-baharu', url: '/program/festival/kampung/baharu', order: 0, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Gebyarun Bustaman', slug: 'gebyarun-bustaman', url: '/program/festival/kampung/gebyarun', order: 1, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Ngajak Gitlok', slug: 'ngajak-gitlok', url: '/program/festival/kampung/gitlok', order: 2, parentSlug: 'festival-kampung' },
		{ categorySlug: 'program-hysteria', title: 'Festival Kota', slug: 'festival-kota', url: '/program/festival/kota', order: 1, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Zine Fest', slug: 'zine-fest', url: '/program/festival/kota/zine-fest', order: 0, parentSlug: 'festival-kota' },
		{ categorySlug: 'program-hysteria', title: 'Rilis Fest', slug: 'rilis-fest', url: '/program/festival/kota/rilis-fest', order: 1, parentSlug: 'festival-kota' },
		{ categorySlug: 'program-hysteria', title: 'Biennale', slug: 'biennale', url: '/program/festival/biennale', order: 2, parentSlug: 'festival-dan-pameran' },
		{ categorySlug: 'program-hysteria', title: 'Rumah Luka', slug: 'rumah-luka', url: '/program/festival/biennale/rumah', order: 0, parentSlug: 'biennale' },
		{ categorySlug: 'program-hysteria', title: 'Forum', slug: 'forum', url: '/program/forum', order: 1, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Temu Jejaring', slug: 'temu-jejaring', url: '/program/forum/temu-jejaring', order: 0, parentSlug: 'forum' },
		{ categorySlug: 'program-hysteria', title: 'Podcast', slug: 'podcast', url: '/program/podcast', order: 2, parentSlug: null },
		{ categorySlug: 'program-hysteria', title: 'Sorel di Sekitar', slug: 'sorel-di-sekitar', url: '/program/podcast/sorel', order: 0, parentSlug: 'podcast' },

		// Platform (category: platform)
		{ categorySlug: 'platform', title: 'Hysteria Artlab', slug: 'hysteria-artlab', url: '/platform/artlab', order: 0, parentSlug: null },
		{ categorySlug: 'platform', title: 'Merchandise', slug: 'merchandise', url: '/platform/artlab/merchandise', order: 0, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Podcast Artlab', slug: 'podcast-artlab', url: '/platform/artlab/podcast', order: 1, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Workshop', slug: 'workshop', url: '/platform/artlab/workshop', order: 2, parentSlug: 'hysteria-artlab' },
		{ categorySlug: 'platform', title: 'Ditampart', slug: 'ditampart', url: '/platform/ditampart', order: 1, parentSlug: null },
		{ categorySlug: 'platform', title: '3D', slug: '3d', url: '/platform/ditampart/3d', order: 0, parentSlug: 'ditampart' },

		// Artikel (category: artikel)
		{ categorySlug: 'artikel', title: 'Esai', slug: 'esai', url: '/artikel/esai', order: 0, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Bedah Buku', slug: 'bedah-buku', url: '/artikel/bedah-buku', order: 1, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Zine', slug: 'zine', url: '/artikel/zine', order: 2, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Media Partner', slug: 'media-partner', url: '/artikel/media-partner', order: 3, parentSlug: null },
		{ categorySlug: 'artikel', title: 'Rilisan Buku', slug: 'rilisan-buku', url: '/artikel/rilisan-buku', order: 4, parentSlug: null }
	]

	try {
		logger.info('008: Seeding navigation categories and items...')
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
		logger.info('008: Navigation seed complete')
	} catch (e) {
		await client.query('ROLLBACK')
		logger.error('008 seeder error:', { error: e.message })
		throw e
	} finally {
		await client.end()
	}
}
