#!/bin/sh

redis-server \
  --appendonly yes \
  --requirepass "${REDIS_PASSWORD}" \
  --maxmemory 24mb \
  --maxmemory-policy allkeys-lru \
  --save ""
