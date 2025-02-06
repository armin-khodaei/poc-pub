# Build stage for Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ .
RUN yarn build

# Build stage for Backend
FROM node:20-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY backend/ .
RUN yarn build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package.json ./backend/
COPY --from=backend-builder /app/backend/yarn.lock ./backend/

# Create files directory and copy template files
RUN mkdir -p /app/backend/files
COPY backend/files/ /app/backend/files/

# Copy frontend build to nginx serve directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Install backend production dependencies
WORKDIR /app/backend
RUN yarn install --production --frozen-lockfile

# Create start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 3000
EXPOSE 5000

# Start both nginx and backend server
CMD ["/app/start.sh"] 