const { createPool } = require('./database');
const { ProductMysqlRepository } = require('../infrastructure/repositories/ProductMysqlRepository');
const { OrderMysqlRepository } = require('../infrastructure/repositories/OrderMysqlRepository');
const { IdempotencyRepository } = require('../infrastructure/repositories/IdempotencyRepository');
const { CustomersApiClient } = require('../infrastructure/http/CustomersApiClient');
const { ProductService } = require('../application/services/ProductService');
const { OrderService } = require('../application/services/OrderService');
const { ProductController } = require('../presentation/controllers/ProductController');
const { OrderController } = require('../presentation/controllers/OrderController');

function createContainer() {
  const pool = createPool();

  const productRepository = new ProductMysqlRepository(pool);
  const orderRepository = new OrderMysqlRepository(pool);
  const idempotencyRepository = new IdempotencyRepository(pool);
  const customersApiClient = new CustomersApiClient();

  const productService = new ProductService(productRepository);
  const orderService = new OrderService(
    orderRepository,
    productRepository,
    idempotencyRepository,
    customersApiClient
  );

  const productController = new ProductController(productService);
  const orderController = new OrderController(orderService);

  return {
    pool,
    repositories: {
      productRepository,
      orderRepository,
      idempotencyRepository
    },
    clients: {
      customersApiClient
    },
    services: {
      productService,
      orderService
    },
    controllers: {
      productController,
      orderController
    }
  };
}

module.exports = { createContainer };