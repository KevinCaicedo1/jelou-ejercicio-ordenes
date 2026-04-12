const { AppError } = require('../shared/errors/AppError');

class OrchestratorService {
  constructor({ customersClient, ordersClient } = {}) {
    if (customersClient) {
      this.customersClient = customersClient;
    } else {
      const { CustomersClient } = require('../clients/CustomersClient');
      this.customersClient = new CustomersClient();
    }

    if (ordersClient) {
      this.ordersClient = ordersClient;
    } else {
      const { OrdersClient } = require('../clients/OrdersClient');
      this.ordersClient = new OrdersClient();
    }
  }

  ensureStep(err, step) {
    if (err instanceof AppError && !err.step) {
      err.step = step;
    }

    return err;
  }

  async execute(payload) {
    const {
      customer_id,
      items,
      idempotency_key
    } = payload;

    let customer;
    try {
      customer = await this.customersClient.getCustomer(customer_id);
    } catch (err) {
      throw this.ensureStep(err, 'validate_customer');
    }

    let createdOrder;
    try {
      createdOrder = await this.ordersClient.createOrder(customer_id, items);
    } catch (err) {
      throw this.ensureStep(err, 'create_order');
    }

    let confirmedOrder;
    try {
      confirmedOrder = await this.ordersClient.confirmOrder(createdOrder.id, idempotency_key);
    } catch (err) {
      throw this.ensureStep(err, 'confirm_order');
    }

    return {
      customer,
      order: confirmedOrder
    };
  }
}

module.exports = { OrchestratorService };
