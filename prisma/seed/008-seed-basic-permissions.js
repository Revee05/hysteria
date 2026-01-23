const { Client } = require("pg");
const logger = require("../../lib/logger");

module.exports = async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    logger.warn("DATABASE_URL not set; skipping 008-seed-basic-permissions");
    return;
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  console.log("🔐 Seeding permissions...");

  try {
    // Create permission groups (need to use 'key' field, not just 'name')
    const userGroupResult = await client.query(
      `INSERT INTO "PermissionGroup" (key, name, description, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      [
        "user-management",
        "User Management",
        "Permissions related to user management",
      ],
    );
    let userGroupId = userGroupResult.rows[0]?.id;

    const permGroupResult = await client.query(
      `INSERT INTO "PermissionGroup" (key, name, description, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      [
        "permission-management",
        "Permission Management",
        "Permissions related to permission and role management",
      ],
    );
    let permGroupId = permGroupResult.rows[0]?.id;

    const roleGroupResult = await client.query(
      `INSERT INTO "PermissionGroup" (key, name, description, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      ["role-management", "Role Management", "Permissions related to role management"],
    );
    let roleGroupId = roleGroupResult.rows[0]?.id;

    const heroGroupResult = await client.query(
      `INSERT INTO "PermissionGroup" (key, name, description, "createdAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING id`,
      ["hero-management", "Hero Management", "Permissions related to hero section management"],
    );
    let heroGroupId = heroGroupResult.rows[0]?.id;

    // If groups not returned (already exist), fetch them
    if (!userGroupId) {
      const existing = await client.query(
        `SELECT id FROM "PermissionGroup" WHERE key = $1`,
        ["user-management"],
      );
      userGroupId = existing.rows[0].id;
    }
    if (!permGroupId) {
      const existing = await client.query(
        `SELECT id FROM "PermissionGroup" WHERE key = $1`,
        ["permission-management"],
      );
      permGroupId = existing.rows[0].id;
    }
    if (!roleGroupId) {
      const existing = await client.query(
        `SELECT id FROM "PermissionGroup" WHERE key = $1`,
        ["role-management"],
      );
      roleGroupId = existing.rows[0].id;
    }
    if (!heroGroupId) {
      const existing = await client.query(
        `SELECT id FROM "PermissionGroup" WHERE key = $1`,
        ["hero-management"],
      );
      heroGroupId = existing.rows[0].id;
    }

    // Define all permissions
    const permissions = [
      // User permissions
      {
        key: "users.read",
        name: "Read Users",
        description: "View user list and details",
        groupId: userGroupId,
      },
      {
        key: "users.create",
        name: "Create Users",
        description: "Create new users",
        groupId: userGroupId,
      },
      {
        key: "users.update",
        name: "Update Users",
        description: "Update existing users",
        groupId: userGroupId,
      },
      {
        key: "users.delete",
        name: "Delete Users",
        description: "Delete users",
        groupId: userGroupId,
      },

      // User role management
      {
        key: "users.roles.read",
        name: "Read User Roles",
        description: "View roles assigned to users",
        groupId: userGroupId,
      },
      {
        key: "users.roles.assign",
        name: "Assign User Roles",
        description: "Assign roles to users",
        groupId: userGroupId,
      },
      {
        key: "users.roles.remove",
        name: "Remove User Roles",
        description: "Remove roles from users",
        groupId: userGroupId,
      },
      {
        key: "users.roles.replace",
        name: "Replace User Roles",
        description: "Bulk replace all roles for a user",
        groupId: userGroupId,
      },

      // Role management
      {
        key: "roles.read",
        name: "Read Roles",
        description: "View available roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.create",
        name: "Create Roles",
        description: "Create new roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.update",
        name: "Update Roles",
        description: "Update existing roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.delete",
        name: "Delete Roles",
        description: "Delete roles",
        groupId: roleGroupId,
      },

      // Permission management permissions
      {
        key: "permissions.read",
        name: "Read Permissions",
        description: "View permissions list",
        groupId: permGroupId,
      },
      {
        key: "permissions.create",
        name: "Create Permissions",
        description: "Create new permissions",
        groupId: permGroupId,
      },
      {
        key: "permissions.update",
        name: "Update Permissions",
        description: "Update existing permissions",
        groupId: permGroupId,
      },
      {
        key: "permissions.delete",
        name: "Delete Permissions",
        description: "Delete permissions",
        groupId: permGroupId,
      },

      // Role permissions management
      {
        key: "roles.permissions.read",
        name: "Read Role Permissions",
        description: "View permissions assigned to roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.permissions.assign",
        name: "Assign Role Permissions",
        description: "Assign permissions to roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.permissions.remove",
        name: "Remove Role Permissions",
        description: "Remove permissions from roles",
        groupId: roleGroupId,
      },
      {
        key: "roles.permissions.replace",
        name: "Replace Role Permissions",
        description: "Bulk replace all permissions for a role",
        groupId: roleGroupId,
      },

      // Permission Group management (manage permission groups themselves)
      {
        key: "permission-groups.read",
        name: "Read Permission Groups",
        description: "View permission groups",
        groupId: permGroupId,
      },
      {
        key: "permission-groups.create",
        name: "Create Permission Groups",
        description: "Create new permission groups",
        groupId: permGroupId,
      },
      {
        key: "permission-groups.update",
        name: "Update Permission Groups",
        description: "Update existing permission groups",
        groupId: permGroupId,
      },
      {
        key: "permission-groups.delete",
        name: "Delete Permission Groups",
        description: "Delete permission groups",
        groupId: permGroupId,
      },

      // Hero management
      {
        key: "hero.read",
        name: "Read Hero Sections",
        description: "View hero sections",
        groupId: heroGroupId,
      },
      {
        key: "hero.create",
        name: "Create Hero Section",
        description: "Create new hero sections",
        groupId: heroGroupId,
      },
      {
        key: "hero.update",
        name: "Update Hero Section",
        description: "Update existing hero sections",
        groupId: heroGroupId,
      },
      {
        key: "hero.delete",
        name: "Delete Hero Section",
        description: "Delete hero sections",
        groupId: heroGroupId,
      },
    ];

    // Create all permissions
    for (const perm of permissions) {
      await client.query(
        `INSERT INTO "Permission" (key, name, description, "groupId", "createdAt")
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (key) DO UPDATE 
         SET name = EXCLUDED.name, 
             description = EXCLUDED.description, 
             "groupId" = EXCLUDED."groupId"`,
        [perm.key, perm.name, perm.description, perm.groupId],
      );
      console.log(`  ✓ Created/Updated permission: ${perm.key}`);
    }

    // Get ADMIN role
    const adminRoleResult = await client.query(
      `SELECT id FROM "Role" WHERE key = $1`,
      ["ADMIN"],
    );

    if (adminRoleResult.rows.length > 0) {
      const adminRoleId = adminRoleResult.rows[0].id;
      console.log("\n📋 Assigning permissions to ADMIN role...");

      // Assign all permissions to ADMIN role
      for (const perm of permissions) {
        const permissionResult = await client.query(
          `SELECT id FROM "Permission" WHERE key = $1`,
          [perm.key],
        );

        if (permissionResult.rows.length > 0) {
          const permissionId = permissionResult.rows[0].id;

          await client.query(
            `INSERT INTO "RolePermission" ("roleId", "permissionId", "assignedAt")
             VALUES ($1, $2, NOW())
             ON CONFLICT ("roleId", "permissionId") DO NOTHING`,
            [adminRoleId, permissionId],
          );
          console.log(`  ✓ Assigned ${perm.key} to ADMIN`);
        }
      }
    }

    console.log("\n✅ Permissions seeded successfully!");
    console.log(
      "ℹ️  Note: SUPERADMIN automatically bypasses all permission checks",
    );
  } catch (error) {
    logger.error("Error seeding permissions:", error);
    throw error;
  } finally {
    await client.end();
  }
};
