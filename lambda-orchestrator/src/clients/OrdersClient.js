const axios = require('axios');
const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const {
  ConflictError,
  ServiceUnavailableError,
  UnprocessableError
} = require('../shared/errors/AppError');

class OrdersClient {
  constructor() {
    this.client = axios.create({
      baseURL: env.ordersApiBaseUrl,
      timeout: 5000
    });
  }

  buildAuthHeader() {
    const token = jwt.sign(
      { service: 'orchestrator' },
      env.jwtSecret,
      { expiresIn: '5m' }
    );

    return {
      Authorization: `Bearer ${token}`
    };
  }

  async createOrder(customer_id, items) {
    try {
      const response = await this.client.post(
        '/orders',
        { customer_id, items },
        { headers: this.buildAuthHeader() }
      );

      return response.data;
    } catch (err) {
      if (err.response?.status === 422) {
        const message = err.response.data?.message || 'Insufficient stock';
        throw new UnprocessableError(message, 'create_order');
      }

      if (!err.response) {
        throw new ServiceUnavailableError('Orders API unavailable', 'create_order');
      }

      throw new ServiceUnavailableError('Orders API unavailable', 'create_order');
    }
  }

  async confirmOrder(orderId, idempotencyKey) {
    try {
      const response = await this.client.post(
        `/orders/${orderId}/confirm`,
        {},
        {
          headers: {
            ...this.buildAuthHeader(),
            'X-Idempotency-Key': idempotencyKey
          }
        }
      );

      return response.data;
    } catch (err) {
      if (err.response?.status === 409) {
        const message = err.response.data?.message || `Order ${orderId} already confirmed`;
        throw new ConflictError(message, 'confirm_order');
      }

      if (!err.response) {
        throw new ServiceUnavailableError('Orders API unavailable', 'confirm_order');
      }

      throw new ServiceUnavailableError('Orders API unavailable', 'confirm_order');
    }
  }
}

module.exports = { OrdersClient };
