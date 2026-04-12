const axios = require('axios');
const { env } = require('../../config/env');
const { ServiceUnavailableError } = require('../../shared/errors/AppError');

class CustomersApiClient {
  constructor() {
    this.http = axios.create({
      baseURL: env.customersApi.baseUrl,
      timeout: 5000,
      headers: {
        Authorization: `Bearer ${env.customersApi.serviceToken}`
      }
    });
  }

  async getCustomerById(customerId) {
    try {
      const response = await this.http.get(`/internal/customers/${customerId}`);
      return response.data && response.data.data ? response.data.data : response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new ServiceUnavailableError('Customers API unavailable');
    }
  }
}

module.exports = { CustomersApiClient };