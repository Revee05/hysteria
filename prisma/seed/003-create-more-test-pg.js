const { Client } = require('pg');

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('DATABASE_URL not set; skipping 003-create-more-test-pg');
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    console.log('003: Inserting test row process started...');
    await client.query('INSERT INTO "Test" (name) VALUES ($1)', ['Seed 003']);
    console.log('003: Inserted test row.');
  } catch (e) {
    console.error('003 pg seeder error:', e.message);
    throw e;
  } finally {
    await client.end();
  }
};
