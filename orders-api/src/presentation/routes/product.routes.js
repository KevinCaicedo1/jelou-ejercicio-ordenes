const express = require('express');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/authenticate');
const {
  CreateProductSchema,
  UpdateProductSchema,
  SearchProductsSchema
} = require('../dtos/product.dto');

function createProductRouter(productController) {
  const router = express.Router();

  router.use(authenticate);

  router.post('/', validate(CreateProductSchema, 'body'), productController.create);
  router.patch('/:id', validate(UpdateProductSchema, 'body'), productController.update);
  router.get('/:id', productController.getById);
  router.get('/', validate(SearchProductsSchema, 'query'), productController.list);

  return router;
}

module.exports = { createProductRouter };