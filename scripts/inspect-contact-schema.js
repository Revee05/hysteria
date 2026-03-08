require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%contact%' ORDER BY table_name"
  );

  console.log("TABLES", tables.rows);

  for (const row of tables.rows) {
    const columns = await client.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
      [row.table_name]
    );

    console.log(`COLUMNS:${row.table_name}`, columns.rows);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
