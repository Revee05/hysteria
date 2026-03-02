// Static seeder list approach:
// Edit the `seeds` array below and comment/uncomment `require()` lines
// to enable/disable specific seed files. This keeps the runner explicit
// and easy to review in PRs.

require("dotenv").config(); // load .env so DATABASE_URL is available to all seeders

const logger = require("../../lib/logger");

const seeds = [
  // require('./004-seed-roles.js'),
  // require('./005-seed-statuses.js'),
  // require('./006-create-admin-user.js'),
  // require("./008-seed-basic-permissions.js"),
  // require('./009-nav-category.js'),
  // require("./010-team.js"),
  // require("./011-platform-permissions.js"),
  // require("./012-platform-seed.js"),
  // require("./013-platform-categories-seed.js"),
  require("./014-event-seed.js"),
];

async function main() {
  for (const mod of seeds) {
    const fn = typeof mod === "function" ? mod : mod.default || mod.seed;
    const label = (mod && mod.name) || (fn && fn.name) || "anonymous-seeder";
    logger.info("Running seeder:", { seeder: label });
    if (typeof fn === "function") {
      await fn();
    } else {
      logger.warn("No runnable export found for seeder:", { seeder: label });
    }
  }
}

main().catch((e) => {
  logger.error("Seeder failed:", { error: e.message, stack: e.stack });
  process.exit(1);
});
