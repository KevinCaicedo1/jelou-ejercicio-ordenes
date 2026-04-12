# Lambda Orchestrator

Lambda de orquestacion para crear y confirmar pedidos B2B en una sola operacion.

## Stack

- Node.js 22
- JavaScript CommonJS (`require` / `module.exports`)
- Serverless Framework v3
- serverless-offline (puertos configurables por `.env`)
- axios
- zod
- jest

## Estructura

```text
lambda-orchestrator/
├── src/
│   ├── config/
│   │   └── env.js
│   ├── clients/
│   │   ├── CustomersClient.js
│   │   └── OrdersClient.js
│   ├── handlers/
│   │   └── orchestrator.js
│   ├── services/
│   │   └── OrchestratorService.js
│   ├── dtos/
│   │   └── orchestrator.dto.js
│   └── shared/
│       ├── errors/
│       │   └── AppError.js
│       └── utils/
│           └── responseBuilder.js
├── tests/
│   └── unit/
│       └── OrchestratorService.test.js
├── serverless.yml
├── .env.example
├── package.json
└── README.md
```

## Endpoint

`POST /orchestrator/create-and-confirm-order`

Request:

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 2, "qty": 3 }
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

Response exitosa (`201`):

```json
{
  "success": true,
  "correlationId": "req-789",
  "data": {
    "customer": {
      "id": 1,
      "name": "ACME",
      "email": "ops@acme.com",
      "phone": "..."
    },
    "order": {
      "id": 101,
      "status": "CONFIRMED",
      "total_cents": 459900,
      "items": [
        {
          "product_id": 2,
          "qty": 3,
          "unit_price_cents": 153300,
          "subtotal_cents": 459900
        }
      ]
    }
  }
}
```

## Levantamiento local

```bash
# 1. Instalar dependencias
cd lambda-orchestrator
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con las URLs de las APIs levantadas con Docker
# Opcional: ajustar OFFLINE_HTTP_PORT y OFFLINE_LAMBDA_PORT

# 3. Levantar en modo local (serverless-offline)
npm run dev
# Endpoint disponible en: http://localhost:3004/orchestrator/create-and-confirm-order

# 4. Probar con cURL
curl -X POST http://localhost:3004/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{ "product_id": 1, "qty": 2 }],
    "idempotency_key": "test-key-001",
    "correlation_id": "req-001"
  }'

# 5. (Opcional) Exponer con ngrok para pruebas externas
ngrok http 3004
```

## Tests

```bash
npm test
```

Casos cubiertos en unit tests:

- Flujo exitoso completo.
- Cliente no encontrado.
- Stock insuficiente.
- Customers API no disponible.
- Conflicto de idempotencia al confirmar orden.
