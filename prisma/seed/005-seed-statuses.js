const { Client } = require('pg')
const logger = require('../../lib/logger')

const statuses = [
  { key: 'BANNED', name: 'Banned', description: 'User is banned' },
  { key: 'SUSPEND', name: 'Suspended', description: 'User is suspended' },
  { key: 'RESIGN', name: 'Resigned', description: 'User has resigned' },
  { key: 'ACTIVE', name: 'Active', description: 'User is active' },
]

module.exports = async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    logger.warn('DATABASE_URL not set; skipping 005-seed-statuses')
    return
  }

  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    logger.info('005: Seeding user statuses process started...')
    for (const s of statuses) {
      // Upsert by key
      await client.query(
        `INSERT INTO "UserStatus" ("key", "name", "description") VALUES ($1, $2, $3)
         ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description"`,
        [s.key, s.name, s.description]
      )
    }
    logger.info('005: Seed user statuses done')
  } catch (e) {
    logger.error('005 pg seeder error:', { error: e.message })
    throw e
  } finally {
    await client.end()
  }
}
