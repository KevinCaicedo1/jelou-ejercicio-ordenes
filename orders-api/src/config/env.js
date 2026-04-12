const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 3002),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'orders_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secret'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecretkey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  },
  serviceToken: process.env.SERVICE_TOKEN || 'internal-service-token-secret',
  customersApi: {
    baseUrl: process.env.CUSTOMERS_API_BASE_URL || 'http://localhost:3001',
    serviceToken: process.env.CUSTOMERS_SERVICE_TOKEN || 'internal-service-token-secret'
  }
};

module.exports = { env };