class IdempotencyRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findValidByKey(idempotencyKey) {
    const [rows] = await this.pool.execute(
      `
        SELECT idempotency_key, target_type, target_id, status, response_body, expires_at
        FROM idempotency_keys
        WHERE idempotency_key = ?
          AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
      `,
      [idempotencyKey]
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    if (typeof row.response_body === 'string') {
      return JSON.parse(row.response_body);
    }

    return row.response_body;
  }

  async save({ idempotencyKey, targetType, targetId, status, responseBody }) {
    await this.pool.execute(
      `
        INSERT INTO idempotency_keys
        (idempotency_key, target_type, target_id, status, response_body, expires_at)
        VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))
      `,
      [idempotencyKey, targetType, targetId, status, JSON.stringify(responseBody)]
    );
  }
}

module.exports = { IdempotencyRepository };