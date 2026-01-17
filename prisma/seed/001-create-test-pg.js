const { Client } = require('pg');
const logger = require('../../lib/logger');

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn('DATABASE_URL not set; skipping 001-create-test-pg');
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    logger.info('001: Inserting test row process started...');
    await client.query('INSERT INTO "Test" (name) VALUES ($1)', ['Seed 001']);
    logger.info('001: Inserted test row.');
  } catch (e) {
    logger.error('001 pg seeder error:', { error: e.message });
    throw e;
  } finally {
    await client.end();
  }
};
