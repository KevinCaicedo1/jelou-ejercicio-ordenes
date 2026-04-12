const express = require('express');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const { ValidationError } = require('../../shared/errors/AppError');
const { CreateOrderSchema, SearchOrdersSchema } = require('../dtos/order.dto');

function validateIdempotencyKey(req, _res, next) {
  const idempotencyKey = req.headers['x-idempotency-key'];
  if (!idempotencyKey) {
    return next(new ValidationError('X-Idempotency-Key header is required'));
  }
  return next();
}

function createOrderRouter(orderController) {
  const router = express.Router();

  router.use(authenticate);

  router.post('/', validate(CreateOrderSchema, 'body'), orderController.create);
  router.get('/:id', orderController.getById);
  router.get('/', validate(SearchOrdersSchema, 'query'), orderController.list);
  router.post('/:id/confirm', validateIdempotencyKey, orderController.confirm);
  router.post('/:id/cancel', orderController.cancel);

  return router;
}

module.exports = { createOrderRouter };