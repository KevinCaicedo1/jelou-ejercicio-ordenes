FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY openapi.yaml ./openapi.yaml
COPY .env.example ./.env.example
EXPOSE 3002
CMD ["node", "src/index.js"]