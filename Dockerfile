# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for API URL and Metrika
ARG VITE_API_URL=/api
ARG VITE_YANDEX_METRIKA_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_YANDEX_METRIKA_ID=$VITE_YANDEX_METRIKA_ID

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
