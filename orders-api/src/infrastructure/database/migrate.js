const { createPool } = require('../../config/database');

async function run() {
  const pool = createPool();
  try {
    await pool.query('SELECT 1');
    console.log('Database reachable. Schema migrations are managed externally.');
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    await run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();