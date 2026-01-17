const { Client } = require('pg')
const logger = require('../../lib/logger')

const roles = [
  { key: 'SUPERADMIN', name: 'Super Admin' },
  { key: 'ADMIN', name: 'Admin' },
  { key: 'REPORTER', name: 'Reporter' },
  { key: 'JUNALIS', name: 'Jurnalis' },
  { key: 'DATA_ANALIS', name: 'Data Analis' },
  { key: 'GUEST', name: 'Guest' },
]

module.exports = async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    logger.warn('DATABASE_URL not set; skipping 004-seed-roles')
    return
  }

  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    logger.info('004: Seeding roles process started...')
    for (const r of roles) {
      // Upsert by key
      await client.query(
        `INSERT INTO "Role" ("key", "name") VALUES ($1, $2)
         ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name"`,
        [r.key, r.name]
      )
    }
    logger.info('004: Seed roles done')
  } catch (e) {
    logger.error('004 pg seeder error:', { error: e.message })
    throw e
  } finally {
    await client.end()
  }
}
