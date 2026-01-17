const { Client } = require('pg');
const logger = require('../../lib/logger');

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn('DATABASE_URL not set; skipping 002-test-pg');
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    logger.info('002: Inserting test row process started...');
    await client.query('INSERT INTO "Test" (name) VALUES ($1)', ['Seed 002']);
    logger.info('002: Inserted test row.');
  } catch (e) {
    logger.error('002 pg seeder error:', { error: e.message });
    throw e;
  } finally {
    await client.end();
  }
};
