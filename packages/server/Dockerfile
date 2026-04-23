FROM node:22-alpine

WORKDIR /app

# Copy root configuration
COPY package.json package-lock.json ./

# Copy package definitions to satisfy workspace requirements
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install dependencies (including devDependencies for building)
RUN npm ci

# Copy server source code
COPY packages/server ./packages/server

# Set working directory to server package
WORKDIR /app/packages/server

# environment variables
ARG DATABASE_URL
ARG PORT=3001
ENV PORT=$PORT
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Copy and prepare the entrypoint script
COPY packages/server/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Expose the application port
EXPOSE $PORT

# Use entrypoint for optional migration support (set RUN_MIGRATIONS=true to enable)
ENTRYPOINT ["./entrypoint.sh"]

# Start the application
CMD ["npm", "start"]