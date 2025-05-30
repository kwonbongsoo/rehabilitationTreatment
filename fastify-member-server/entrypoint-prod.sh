#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
sleep 5

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
exec "$@"