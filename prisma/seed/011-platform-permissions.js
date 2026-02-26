const { Client } = require("pg");
const logger = require("../../lib/logger");

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 011-platform-permissions");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("🔐 Seeding platform permissions...");

  try {
    // Create permission group
    const groupResult = await client.query(
      `INSERT INTO "PermissionGroup" (key, name, description, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      ["platform-management", "Platform Management", "Permissions related to platform page management"],
    );

    let groupId = groupResult.rows[0]?.id;
    if (!groupId) {
      const existing = await client.query(`SELECT id FROM "PermissionGroup" WHERE key = $1`, ["platform-management"]);
      groupId = existing.rows[0].id;
    }

    const permissions = [
      {
        key: "platform.read",
        name: "Read Platform",
        description: "View platform pages, cover images and hero images",
        groupId,
      },
      {
        key: "platform.update",
        name: "Update Platform",
        description: "Update platform pages, cover images and hero images",
        groupId,
      },
    ];

    for (const perm of permissions) {
      await client.query(
        `INSERT INTO "Permission" (key, name, description, "groupId", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name, description = EXCLUDED.description, "groupId" = EXCLUDED."groupId"`,
        [perm.key, perm.name, perm.description, perm.groupId],
      );
      console.log(`  ✓ Created/Updated permission: ${perm.key}`);
    }

    // Assign to ADMIN role
    const adminResult = await client.query(`SELECT id FROM "Role" WHERE key = $1`, ["ADMIN"]);
    if (adminResult.rows.length > 0) {
      const adminRoleId = adminResult.rows[0].id;
      console.log("\n📋 Assigning platform permissions to ADMIN role...");
      for (const perm of permissions) {
        const permRow = await client.query(`SELECT id FROM "Permission" WHERE key = $1`, [perm.key]);
        if (permRow.rows.length > 0) {
          await client.query(
            `INSERT INTO "RolePermission" ("roleId", "permissionId", "assignedAt")
             VALUES ($1, $2, NOW())
             ON CONFLICT ("roleId", "permissionId") DO NOTHING`,
            [adminRoleId, permRow.rows[0].id],
          );
          console.log(`  ✓ Assigned ${perm.key} to ADMIN`);
        }
      }
    }

    console.log("\n✅ Platform permissions seeded successfully!");
  } catch (error) {
    logger.error("Error seeding platform permissions:", error);
    throw error;
  } finally {
    await client.end();
  }
};
