#!/bin/sh
exec redis-server --appendonly yes --requirepass "$REDIS_PASSWORD"
