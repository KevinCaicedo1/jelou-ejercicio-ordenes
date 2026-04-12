const { createPool } = require('../../config/database');

async function run() {
  const pool = createPool();
  try {
    await pool.query('SELECT 1');
    console.log('Seed script placeholder. Add seed DML if needed.');
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