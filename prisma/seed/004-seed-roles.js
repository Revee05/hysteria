const { Client } = require('pg')

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
    console.warn('DATABASE_URL not set; skipping 004-seed-roles')
    return
  }

  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    console.log('004: Seeding roles process started...')
    for (const r of roles) {
      // Upsert by key
      await client.query(
        `INSERT INTO "Role" ("key", "name") VALUES ($1, $2)
         ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name"`,
        [r.key, r.name]
      )
    }
    console.log('004: Seed roles done')
  } catch (e) {
    console.error('004 pg seeder error:', e.message)
    throw e
  } finally {
    await client.end()
  }
}
