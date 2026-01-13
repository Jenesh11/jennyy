FROM node:20-alpine

WORKDIR /app/backend

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
# Using --legacy-peer-deps to avoid potential conflicts with patched plugins
RUN npm install --legacy-peer-deps

# Copy backend source
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 9000

# Start command (migrations should ideally be run in a separate step or start script)
CMD ["npm", "run", "start"]
