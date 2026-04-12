const { ConflictError, NotFoundError } = require('../../shared/errors/AppError');

class CustomerService {
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  async createCustomer(data) {
    const existing = await this.customerRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    return this.customerRepository.create(data);
  }

  async getCustomerById(id) {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  async searchCustomers(params) {
    return this.customerRepository.search(params);
  }

  async updateCustomer(id, data) {
    const current = await this.customerRepository.findById(id);
    if (!current) {
      throw new NotFoundError('Customer not found');
    }

    return this.customerRepository.update(id, data);
  }

  async deleteCustomer(id) {
    const deleted = await this.customerRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundError('Customer not found');
    }
  }
}

module.exports = { CustomerService };
