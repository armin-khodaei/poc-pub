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
FROM node:20-alpine

WORKDIR /app

# Copy build artifacts and package files
COPY --from=build /app/dist ./dist
COPY package.json yarn.lock ./

# Create files directory and copy template files
RUN mkdir -p /app/files
COPY files/ /app/files/

# Install production dependencies
RUN yarn install --production --frozen-lockfile

# Expose backend port
EXPOSE 5000

# Start the backend server
CMD ["node", "dist/index.js"] 