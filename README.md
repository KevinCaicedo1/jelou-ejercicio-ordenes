# Monorepo Jelou AI

Implementacion del ejercicio tecnico con arquitectura de microservicios + orquestador.

## Estado del despliegue

Todo funcionando perfectamente en AWS.

Sistema completo desplegado:

- EC2 (t3.small)
	- customers-api: http://ec2-98-81-164-242.compute-1.amazonaws.com:3001
	- orders-api: http://ec2-98-81-164-242.compute-1.amazonaws.com:3002
- AWS Lambda + API Gateway
	- POST https://0oiifhun64.execute-api.us-east-1.amazonaws.com/dev/orchestrator/create-and-confirm-order

## Levantar todo local con Docker

1. Construir y levantar todos los servicios:

```bash
docker compose up --build
```

2. Endpoints locales:

- customers-api: http://localhost:3001/health
- orders-api: http://localhost:3002/health
- lambda-orchestrator (offline): http://localhost:3000/orchestrator/create-and-confirm-order

3. Detener servicios:

```bash
docker compose down
```

4. Reinicializar base de datos (recrear esquema + seed):

```bash
docker compose down -v
docker compose up --build
```

Notas:

- Se crean y cargan automaticamente dos bases de datos: customers_db y orders_db.
- El seed de MySQL se ejecuta solo cuando el volumen de datos es nuevo.

## URLs base de cada servicio

Local (Docker):

- customers-api: http://localhost:3001
- orders-api: http://localhost:3002
- lambda-orchestrator: http://localhost:3000

AWS (desplegado):

- customers-api: http://ec2-98-81-164-242.compute-1.amazonaws.com:3001
- orders-api: http://ec2-98-81-164-242.compute-1.amazonaws.com:3002
- lambda-orchestrator (API Gateway): https://0oiifhun64.execute-api.us-east-1.amazonaws.com/dev

## Variables de entorno

customers-api:

- PORT=3001
- NODE_ENV=development
- DB_HOST=mysql
- DB_PORT=3306
- DB_NAME=customers_db
- DB_USER=root
- DB_PASSWORD=secret
- JWT_SECRET=supersecretkey
- JWT_EXPIRES_IN=1h
- SERVICE_TOKEN=internal-service-token-secret

orders-api:

- PORT=3002
- NODE_ENV=development
- DB_HOST=mysql
- DB_PORT=3306
- DB_NAME=orders_db
- DB_USER=root
- DB_PASSWORD=secret
- JWT_SECRET=supersecretkey
- JWT_EXPIRES_IN=1h
- SERVICE_TOKEN=internal-service-token-secret
- CUSTOMERS_API_BASE_URL=http://customers-api:3001
- CUSTOMERS_SERVICE_TOKEN=internal-service-token-secret

lambda-orchestrator:

- NODE_ENV=development
- CUSTOMERS_API_BASE_URL=http://customers-api:3001
- ORDERS_API_BASE_URL=http://orders-api:3002
- SERVICE_TOKEN=internal-service-token-secret
- JWT_SECRET=supersecretkey
- OFFLINE_HTTP_PORT=3000
- OFFLINE_LAMBDA_PORT=3003

## Pruebas de endpoints

Los ejemplos de consumo de endpoints ya no se documentan con cURL en este README.

Cada servicio incluye su propia Postman Collection dentro de su carpeta:

- customers-api: customers-api/postman-collection.json
- orders-api: orders-api/orders-api.postman_collection.json
- lambda-orchestrator: se encuentra dentro de una carpeta en la collection de orders-api, ya que depende de ambos servicios.

Tambien se creo la carpeta POSTMAN-APIS-AWS con collections listas para usar contra endpoints publicos de AWS:

- POSTMAN-APIS-AWS/Customers API.postman_collection.json
- POSTMAN-APIS-AWS/Orders API.postman_collection.json

En la collection de Orders API (AWS) tambien esta incluida la carpeta de Lambda para invocar el endpoint del orquestador en API Gateway.

Recomendacion:

- Importa las collections en Postman.
- Configura variables de entorno (base URLs, tokens y headers requeridos).
- Ejecuta los requests desde cada collection para validar el flujo completo.

## Como invocar Lambda local y en AWS

Local (opcion A: serverless-offline, endpoint HTTP):

```bash
cd lambda-orchestrator
npm install
npm run dev
```

Luego invocar por HTTP en:

- http://localhost:3004/orchestrator/create-and-confirm-order (si usas .env por defecto de lambda-orchestrator)
- http://localhost:3000/orchestrator/create-and-confirm-order (si lo corres dentro de docker-compose)

Local (opcion B: invocacion directa del handler):

```bash
cd lambda-orchestrator
npx serverless invoke local --function createAndConfirmOrder --data '{"customer_id":1,"items":[{"product_id":1,"qty":2}],"idempotency_key":"idem-local-cli-001","correlation_id":"req-local-cli-001"}'
```

AWS:

```bash
cd lambda-orchestrator
npm run deploy
```

Luego invocar usando API Gateway:

- POST https://0oiifhun64.execute-api.us-east-1.amazonaws.com/dev/orchestrator/create-and-confirm-order

## Carpetas

- customers-api
- orders-api
- lambda-orchestrator
- POSTMAN-APIS-AWS
- db
