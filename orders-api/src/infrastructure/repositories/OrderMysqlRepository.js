const { buildCursorQuery } = require('../../shared/utils/cursorPagination');
const { UnprocessableError } = require('../../shared/errors/AppError');

class OrderMysqlRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async createWithItems(orderData, items) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, ?, ?)',
        [orderData.customer_id, 'CREATED', orderData.total_cents]
      );
      const orderId = orderResult.insertId;

      const itemValues = items.map(item => [
        orderId,
        item.product_id,
        item.qty,
        item.unit_price_cents,
        item.subtotal_cents
      ]);
      await connection.query(
        `
          INSERT INTO order_items
          (order_id, product_id, qty, unit_price_cents, subtotal_cents)
          VALUES ?
        `,
        [itemValues]
      );

      for (const item of items) {
        const [stockResult] = await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ? AND is_active = 1',
          [item.qty, item.product_id, item.qty]
        );
        if (stockResult.affectedRows !== 1) {
          throw new UnprocessableError('Insufficient stock or inactive product', {
            product_id: item.product_id
          });
        }
      }

      await connection.commit();
      return this.findByIdWithItems(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(id) {
    const [rows] = await this.pool.execute(
      `
        SELECT id, customer_id, status, total_cents, created_at, updated_at, confirmed_at, canceled_at
        FROM orders
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );
    return rows[0] || null;
  }

  async findItemsByOrderId(orderId) {
    const [rows] = await this.pool.execute(
      `
        SELECT id, order_id, product_id, qty, unit_price_cents, subtotal_cents, created_at
        FROM order_items
        WHERE order_id = ?
        ORDER BY id ASC
      `,
      [orderId]
    );
    return rows;
  }

  async findByIdWithItems(id) {
    const order = await this.findById(id);
    if (!order) {
      return null;
    }
    const items = await this.findItemsByOrderId(id);
    return { ...order, items };
  }

  async findMany({ status, from, to, cursor, limit }) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 20;
    const { condition: cursorCondition, param: cursorParam } = buildCursorQuery(cursor);
    const whereParts = ['1 = 1'];
    const params = [];

    if (cursorCondition) {
      whereParts.push(cursorCondition.replace(/^AND\s+/i, ''));
      params.push(cursorParam);
    }

    if (status) {
      whereParts.push('status = ?');
      params.push(status);
    }
    if (from) {
      whereParts.push('created_at >= ?');
      params.push(from);
    }
    if (to) {
      whereParts.push('created_at <= ?');
      params.push(to);
    }

    params.push(safeLimit);

    const [rows] = await this.pool.query(
      `
        SELECT id, customer_id, status, total_cents, created_at, updated_at, confirmed_at, canceled_at
        FROM orders
        WHERE ${whereParts.join(' AND ')}
        ORDER BY id ASC
        LIMIT ?
      `,
      params
    );

    return rows;
  }

  async confirmOrderById(id) {
    const [result] = await this.pool.execute(
      `
        UPDATE orders
        SET status = 'CONFIRMED', confirmed_at = NOW()
        WHERE id = ? AND status = 'CREATED'
      `,
      [id]
    );
    return result.affectedRows;
  }

  async cancelAndRestoreStock(orderId, items) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const item of items) {
        await connection.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty, item.product_id]);
      }

      const [result] = await connection.execute(
        `
          UPDATE orders
          SET status = 'CANCELED', canceled_at = NOW()
          WHERE id = ? AND status IN ('CREATED', 'CONFIRMED')
        `,
        [orderId]
      );

      if (result.affectedRows !== 1) {
        throw new UnprocessableError('Unable to cancel order');
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = { OrderMysqlRepository };