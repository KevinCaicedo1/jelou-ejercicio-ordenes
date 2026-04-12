const { buildCursorQuery } = require('../../shared/utils/cursorPagination');

class ProductMysqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(data) {
    const sql = `
      INSERT INTO products (sku, name, price_cents, stock)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await this.pool.execute(sql, [data.sku, data.name, data.price_cents, data.stock || 0]);
    return this.findById(result.insertId);
  }

  async updateById(id, patch) {
    const fields = [];
    const values = [];

    if (patch.price_cents !== undefined) {
      fields.push('price_cents = ?');
      values.push(patch.price_cents);
    }
    if (patch.stock !== undefined) {
      fields.push('stock = ?');
      values.push(patch.stock);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await this.pool.execute(sql, values);

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  async findById(id) {
    const sql = `
      SELECT id, sku, name, price_cents, stock, is_active, created_at, updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await this.pool.execute(sql, [id]);
    return rows[0] || null;
  }

  async findActiveByIds(productIds) {
    if (!productIds.length) {
      return [];
    }
    const placeholders = productIds.map(() => '?').join(', ');
    const sql = `
      SELECT id, sku, name, price_cents, stock, is_active, created_at, updated_at
      FROM products
      WHERE id IN (${placeholders}) AND is_active = 1
    `;
    const [rows] = await this.pool.execute(sql, productIds);
    return rows;
  }

  async findManyActive({ search, cursor, limit }) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;
    const { condition: cursorCondition, param: cursorParam } = buildCursorQuery(cursor);
    const whereParts = ['is_active = 1'];
    const params = [];

    if (cursorCondition) {
      whereParts.push(cursorCondition.replace(/^AND\s+/i, ''));
      params.push(cursorParam);
    }

    if (search) {
      whereParts.push('(name LIKE ? OR sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    params.push(safeLimit);

    const sql = `
      SELECT id, sku, name, price_cents, stock, is_active, created_at, updated_at
      FROM products
      WHERE ${whereParts.join(' AND ')}
      ORDER BY id ASC
      LIMIT ?
    `;

    const [rows] = await this.pool.query(sql, params);
    return rows;
  }
}

module.exports = { ProductMysqlRepository };