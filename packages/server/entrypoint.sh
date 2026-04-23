#!/bin/sh
set -e

# Run database migrations when RUN_MIGRATIONS is set to "true".
# This is used in Cloud Run deployments where the Cloud SQL connection
# is available via a Unix socket provided by the Cloud SQL Auth Proxy.
# In local development (docker-compose), migrations are handled by
# the command override instead, so this step is skipped.
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Migrations complete."
fi

# Execute the CMD passed to the container (default: npm start)
exec "$@"