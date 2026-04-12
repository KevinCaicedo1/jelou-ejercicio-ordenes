const express = require('express');
const { env } = require('./config/env');
const { buildContainer } = require('./config/container');
const { requestLogger } = require('./presentation/middlewares/requestLogger');
const { errorHandler } = require('./presentation/middlewares/errorHandler');
const { buildCustomerRoutes } = require('./presentation/routes/customer.routes');
const { buildInternalRoutes } = require('./presentation/routes/internal.routes');

const app = express();
const container = buildContainer();

app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }),
    service: 'customers-api'
  });
});

app.use('/customers', buildCustomerRoutes(container.customerController));
app.use('/internal', buildInternalRoutes(container.customerController));

app.use(errorHandler);

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`customers-api listening on port ${env.port}`);
  });
}

module.exports = { app };
