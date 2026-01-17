const { Client } = require('pg')
const bcrypt = require('bcrypt')
const logger = require('../../lib/logger')

module.exports = async function seed() {
  const url = process.env.DATABASE_URL
  if (!url) {
    logger.warn('DATABASE_URL not set; skipping 006-create-admin-user')
    return
  }

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Super Admin'

  if (!email || !password) {
    logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping 006-create-admin-user')
    return
  }

  const client = new Client({ connectionString: url })
  await client.connect()

  try {
    logger.info('006: Creating/updating admin user...')
    await client.query('BEGIN')

    const statusRes = await client.query('SELECT id FROM "UserStatus" WHERE key = $1', ['ACTIVE'])
    const roleRes = await client.query('SELECT id FROM "Role" WHERE key = $1', ['SUPERADMIN'])

    if (!statusRes.rows[0]?.id) {
      throw new Error('ACTIVE status not found. Run status seed first.')
    }
    if (!roleRes.rows[0]?.id) {
      throw new Error('SUPERADMIN role not found. Run role seed first.')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userRes = await client.query(
      `INSERT INTO "User" ("email", "name", "password", "statusId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())
       ON CONFLICT ("email") DO UPDATE
       SET "name" = EXCLUDED."name",
           "password" = EXCLUDED."password",
           "statusId" = EXCLUDED."statusId",
           "updatedAt" = now()
       RETURNING "id"`,
      [email, name, passwordHash, statusRes.rows[0].id]
    )

    const userId = userRes.rows[0].id

    await client.query(
      `INSERT INTO "UserRole" ("userId", "roleId")
       VALUES ($1, $2)
       ON CONFLICT ("userId", "roleId") DO NOTHING`,
      [userId, roleRes.rows[0].id]
    )

    await client.query('COMMIT')
    logger.info('006: Admin user ready')
  } catch (e) {
    await client.query('ROLLBACK')
    logger.error('006 seeder error:', { error: e.message })
    throw e
  } finally {
    await client.end()
  }
}
