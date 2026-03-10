require("dotenv").config();
const { Client } = require("pg");

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const tables = [
    "Role",
    "UserStatus",
    "User",
    "Permission",
    "Category",
    "CategoryItem",
    "Platform",
    "Event",
  ];

  const counts = {};
  for (const table of tables) {
    const result = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
    counts[table] = result.rows[0].count;
  }

  await client.end();
  console.log(JSON.stringify(counts, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
