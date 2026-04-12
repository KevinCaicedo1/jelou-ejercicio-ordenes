const { pool } = require('../../config/database');

async function runMigrations() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255)  NOT NULL,
      email       VARCHAR(255)  NOT NULL UNIQUE,
      phone       VARCHAR(50)   NOT NULL,
      created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      is_deleted  TINYINT(1)    NOT NULL DEFAULT 0,
      deleted_at  DATETIME      NULL DEFAULT NULL
    )
  `);

  await pool.execute(`
    ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) NOT NULL DEFAULT 0
  `);

  await pool.execute(`
    ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL DEFAULT NULL
  `);
}

runMigrations()
  .then(() => {
    console.log('Migrations completed.');
    return pool.end();
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    pool.end().finally(() => process.exit(1));
  });
