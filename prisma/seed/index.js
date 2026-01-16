// Static seeder list approach:
// Edit the `seeds` array below and comment/uncomment `require()` lines
// to enable/disable specific seed files. This keeps the runner explicit
// and easy to review in PRs.

const seeds = [
  require('./001-create-test-pg.js'),
  require('./002-test-pg.js'),
  require('./003-create-more-test-pg.js'),
];

async function main() {
  for (const mod of seeds) {
    const fn = typeof mod === 'function' ? mod : mod.default || mod.seed;
    const label = (mod && mod.name) || (fn && fn.name) || 'anonymous-seeder';
    console.log('Running seeder:', label);
    if (typeof fn === 'function') {
      await fn();
    } else {
      console.warn('No runnable export found for seeder:', label);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
