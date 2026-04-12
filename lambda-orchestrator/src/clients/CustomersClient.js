const axios = require('axios');
const { env } = require('../config/env');
const {
  NotFoundError,
  ServiceUnavailableError
} = require('../shared/errors/AppError');

class CustomersClient {
  constructor() {
    this.client = axios.create({
      baseURL: env.customersApiBaseUrl,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${env.serviceToken}`
      }
    });
  }

  async getCustomer(customerId) {
    try {
      const response = await this.client.get(`/internal/customers/${customerId}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        throw new NotFoundError(`Customer with id ${customerId} not found`, 'validate_customer');
      }

      if (!err.response) {
        throw new ServiceUnavailableError('Customers API unavailable', 'validate_customer');
      }

      throw new ServiceUnavailableError('Customers API unavailable', 'validate_customer');
    }
  }
}

module.exports = { CustomersClient };
