const {
  ConflictError,
  NotFoundError,
  UnprocessableError,
  ValidationError
} = require('../../shared/errors/AppError');
const { encodeCursor } = require('../../shared/utils/cursorPagination');

class OrderService {
  constructor(orderRepository, productRepository, idempotencyRepository, customersApiClient) {
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.idempotencyRepository = idempotencyRepository;
    this.customersApiClient = customersApiClient;
  }

  async createOrder(payload) {
    const customer = await this.customersApiClient.getCustomerById(payload.customer_id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const itemMap = new Map();
    for (const item of payload.items) {
      const current = itemMap.get(item.product_id) || 0;
      itemMap.set(item.product_id, current + item.qty);
    }

    const normalizedItems = Array.from(itemMap.entries()).map(([product_id, qty]) => ({
      product_id,
      qty
    }));

    const productIds = normalizedItems.map(item => item.product_id);
    const products = await this.productRepository.findActiveByIds(productIds);
    const productById = new Map(products.map(product => [product.id, product]));

    const itemsForOrder = normalizedItems.map(item => {
      const product = productById.get(item.product_id);
      if (!product) {
        throw new UnprocessableError('Product not found or inactive', {
          product_id: item.product_id
        });
      }
      if (product.stock < item.qty) {
        throw new UnprocessableError('Insufficient stock', {
          product_id: item.product_id,
          available_stock: product.stock,
          requested_qty: item.qty
        });
      }

      const subtotal_cents = product.price_cents * item.qty;
      return {
        product_id: item.product_id,
        qty: item.qty,
        unit_price_cents: product.price_cents,
        subtotal_cents
      };
    });

    const total_cents = itemsForOrder.reduce((sum, item) => sum + item.subtotal_cents, 0);

    return this.orderRepository.createWithItems(
      {
        customer_id: payload.customer_id,
        total_cents
      },
      itemsForOrder
    );
  }

  async getOrderById(orderId) {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    return order;
  }

  async searchOrders(filters) {
    const orders = await this.orderRepository.findMany(filters);
    const nextCursor = orders.length === filters.limit ? encodeCursor(orders[orders.length - 1].id) : null;
    return {
      data: orders,
      nextCursor,
      limit: filters.limit
    };
  }

  async confirmOrder(orderId, idempotencyKey) {
    if (!idempotencyKey) {
      throw new ValidationError('X-Idempotency-Key header is required');
    }

    const cached = await this.idempotencyRepository.findValidByKey(idempotencyKey);
    if (cached) {
      return cached;
    }

    const affectedRows = await this.orderRepository.confirmOrderById(orderId);
    if (affectedRows !== 1) {
      const existingOrder = await this.orderRepository.findById(orderId);
      if (!existingOrder) {
        throw new NotFoundError('Order not found');
      }
      throw new ConflictError('Order is not in CREATED status');
    }

    const confirmedOrder = await this.orderRepository.findByIdWithItems(orderId);

    await this.idempotencyRepository.save({
      idempotencyKey,
      targetType: 'order_confirm',
      targetId: orderId,
      status: 'COMPLETED',
      responseBody: confirmedOrder
    });

    return confirmedOrder;
  }

  async cancelOrder(orderId) {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'CANCELED') {
      throw new ConflictError('Order already canceled');
    }

    if (order.status === 'CONFIRMED') {
      const confirmedAt = new Date(order.confirmed_at).getTime();
      const tenMinutesMs = 10 * 60 * 1000;
      if (Date.now() - confirmedAt > tenMinutesMs) {
        throw new ConflictError('Confirmed order can only be canceled within 10 minutes');
      }
    }

    await this.orderRepository.cancelAndRestoreStock(order.id, order.items || []);
    return this.orderRepository.findByIdWithItems(order.id);
  }
}

module.exports = { OrderService };