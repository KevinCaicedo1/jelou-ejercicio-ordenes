const express = require('express');
const { authenticateServiceToken } = require('../middlewares/authenticateServiceToken');
const { validate } = require('../middlewares/validate');
const { CustomerIdParamSchema } = require('../dtos/customer.dto');

function buildInternalRoutes(customerController) {
  const router = express.Router();

  router.use(authenticateServiceToken);
  router.get(
    '/customers/:id',
    validate(CustomerIdParamSchema, 'params'),
    customerController.getCustomerById
  );

  return router;
}

module.exports = { buildInternalRoutes };
