# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ../nginx.conf /etc/nginx/nginx.conf

# Expose port 3000 (matches the port in nginx.conf)
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"] 