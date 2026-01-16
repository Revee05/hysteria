const { Client } = require('pg');

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL not set; skipping 002-test-pg');
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    console.log('002: Inserting test row via pg...');
    await client.query('INSERT INTO "Test" (name) VALUES ($1)', ['Seed 002']);
    console.log('002: Inserted test row.');
  } catch (e) {
    console.error('002 pg seeder error:', e.message);
    throw e;
  } finally {
    await client.end();
  }
};
