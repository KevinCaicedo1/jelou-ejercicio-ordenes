const { z } = require('zod');

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  CUSTOMERS_API_BASE_URL: z.string().url(),
  ORDERS_API_BASE_URL: z.string().url(),
  SERVICE_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(1)
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment variables: ${details}`);
}

const env = {
  nodeEnv: parsed.data.NODE_ENV,
  customersApiBaseUrl: parsed.data.CUSTOMERS_API_BASE_URL,
  ordersApiBaseUrl: parsed.data.ORDERS_API_BASE_URL,
  serviceToken: parsed.data.SERVICE_TOKEN,
  jwtSecret: parsed.data.JWT_SECRET
};

module.exports = { env };
