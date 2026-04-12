const express = require('express');
const { env } = require('./config/env');
const { createContainer } = require('./config/container');
const { requestLogger } = require('./presentation/middlewares/requestLogger');
const { errorHandler } = require('./presentation/middlewares/errorHandler');
const { createProductRouter } = require('./presentation/routes/product.routes');
const { createOrderRouter } = require('./presentation/routes/order.routes');

const app = express();
const container = createContainer();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/products', createProductRouter(container.controllers.productController));
app.use('/orders', createOrderRouter(container.controllers.orderController));

app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`Orders API listening on port ${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    await container.pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app };