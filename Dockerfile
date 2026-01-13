FROM node:20-alpine

WORKDIR /app/backend

# Copy backend package files from the repo root context
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy backend source code
COPY backend/ .

# Build the application
RUN npm run build

# Expose port
EXPOSE 9000

# Start command
CMD ["npm", "run", "start"]
