const express = require('express');
const { authenticate } = require('../middlewares/authenticate');
const { validate } = require('../middlewares/validate');
const {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  SearchCustomersSchema,
  CustomerIdParamSchema
} = require('../dtos/customer.dto');

function buildCustomerRoutes(customerController) {
  const router = express.Router();

  router.use(authenticate);

  router.post('/', validate(CreateCustomerSchema, 'body'), customerController.createCustomer);
  router.get('/', validate(SearchCustomersSchema, 'query'), customerController.searchCustomers);
  router.get('/:id', validate(CustomerIdParamSchema, 'params'), customerController.getCustomerById);
  router.put(
    '/:id',
    validate(CustomerIdParamSchema, 'params'),
    validate(UpdateCustomerSchema, 'body'),
    customerController.updateCustomer
  );
  router.delete('/:id', validate(CustomerIdParamSchema, 'params'), customerController.deleteCustomer);

  return router;
}

module.exports = { buildCustomerRoutes };
