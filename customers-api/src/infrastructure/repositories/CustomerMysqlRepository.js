const { encodeCursor } = require('../../shared/utils/cursorPagination');

class CustomerMysqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  mapRow(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      created_at: row.created_at
    };
  }

  async create(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO customers (name, email, phone)
       VALUES (?, ?, ?)`,
      [data.name, data.email, data.phone]
    );

    return this.findById(result.insertId);
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      `SELECT id, name, email, phone, created_at
       FROM customers
       WHERE id = ? AND is_deleted = 0
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async findByEmail(email) {
    const [rows] = await this.pool.execute(
      `SELECT id, name, email, phone, created_at
       FROM customers
       WHERE email = ? AND is_deleted = 0
       LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async search(params) {
    const rawLimit = Number(params.limit);
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
    const search = typeof params.search === 'string' ? params.search.trim() : '';
    const rawCursor = Number(params.cursor);
    const cursor = Number.isInteger(rawCursor) && rawCursor > 0 ? rawCursor : null;

    const values = [];
    const where = ['is_deleted = 0'];

    if (search) {
      where.push('(name LIKE ? OR email LIKE ?)');
      values.push(`%${search}%`, `%${search}%`);
    }

    if (cursor) {
      where.push('id > ?');
      values.push(cursor);
    }

    values.push(limit);

    const [rows] = await this.pool.query(
      `SELECT id, name, email, phone, created_at
       FROM customers
       WHERE ${where.join(' AND ')}
       ORDER BY id ASC
       LIMIT ?`,
      values
    );

    const mapped = rows.map((row) => this.mapRow(row));
    const hasMore = mapped.length === limit;
    const nextCursor = hasMore ? encodeCursor(mapped[mapped.length - 1].id) : null;

    return {
      data: mapped,
      nextCursor,
      limit
    };
  }

  async update(id, data) {
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.phone !== undefined) {
      updates.push('phone = ?');
      values.push(data.phone);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    await this.pool.execute(
      `UPDATE customers
       SET ${updates.join(', ')}
       WHERE id = ? AND is_deleted = 0`,
      values
    );

    return this.findById(id);
  }

  async softDelete(id) {
    const [result] = await this.pool.execute(
      `UPDATE customers
       SET is_deleted = 1,
           deleted_at = CURRENT_TIMESTAMP
       WHERE id = ? AND is_deleted = 0`,
      [id]
    );

    return result.affectedRows > 0;
  }
}

module.exports = { CustomerMysqlRepository };
