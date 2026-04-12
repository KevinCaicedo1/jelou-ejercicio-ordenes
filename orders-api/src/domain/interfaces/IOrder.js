/**
 * @typedef {Object} IOrderItem
 * @property {number} id
 * @property {number} order_id
 * @property {number} product_id
 * @property {number} qty
 * @property {number} unit_price_cents
 * @property {number} subtotal_cents
 */

/**
 * @typedef {Object} IOrder
 * @property {number} id
 * @property {number} customer_id
 * @property {'CREATED'|'CONFIRMED'|'CANCELED'} status
 * @property {number} total_cents
 * @property {Date} created_at
 * @property {Date} updated_at
 * @property {Date|null} confirmed_at
 * @property {Date|null} canceled_at
 * @property {IOrderItem[]} [items]
 */

module.exports = {};