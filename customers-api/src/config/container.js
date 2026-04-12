const { pool } = require('./database');
const { CustomerMysqlRepository } = require('../infrastructure/repositories/CustomerMysqlRepository');
const { CustomerService } = require('../application/services/CustomerService');
const { CustomerController } = require('../presentation/controllers/CustomerController');

function buildContainer() {
  const customerRepository = new CustomerMysqlRepository(pool);
  const customerService = new CustomerService(customerRepository);
  const customerController = new CustomerController(customerService);

  return {
    customerRepository,
    customerService,
    customerController
  };
}

module.exports = { buildContainer };
