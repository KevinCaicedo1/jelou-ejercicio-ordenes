FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3004 3005

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
