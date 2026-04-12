# Monorepo Jelou AI

Estructura inicial del ejercicio tecnico.

## Levantar todo con Docker Compose

Este repositorio esta preparado para levantar todos los servicios con un solo comando:

1. Construir y levantar:

	docker compose up --build

2. Endpoints disponibles:

- customers-api: http://localhost:3001/health
- orders-api: http://localhost:3002/health
- lambda-orchestrator: http://localhost:3004/orchestrator/create-and-confirm-order

3. Detener servicios:

	docker compose down

4. Reinicializar base de datos (recrear esquema + seed):

	docker compose down -v
	docker compose up --build

Notas:
- Se crean y cargan automaticamente dos bases de datos: customers_db y orders_db.
- El seed de MySQL se ejecuta solo cuando el volumen de datos es nuevo.

## Carpetas

- customers-api
- orders-api
- lambda-orchestrator
- db
