const { pool } = require('../../config/database');

const seedCustomers = [
  ['Acme Corp', 'contact@acme.com', '+1-111-111-1111'],
  ['Globex', 'sales@globex.com', '+1-222-222-2222']
];

async function runSeed() {
  for (const customer of seedCustomers) {
    await pool.execute(
      `INSERT INTO customers (name, email, phone)
       SELECT ?, ?, ?
       WHERE NOT EXISTS (
         SELECT 1 FROM customers WHERE email = ?
       )`,
      [customer[0], customer[1], customer[2], customer[1]]
    );
  }
}

runSeed()
  .then(() => {
    console.log('Seed completed.');
    return pool.end();
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    pool.end().finally(() => process.exit(1));
  });
