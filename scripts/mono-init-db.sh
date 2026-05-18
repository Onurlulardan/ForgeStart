#!/bin/sh
set -e

: "${PGDATA:=/var/lib/postgresql/data}"
: "${POSTGRES_USER:=forgestart}"
: "${POSTGRES_PASSWORD:=forgestart}"
: "${POSTGRES_DB:=forgestart}"

export PGPASSWORD="$POSTGRES_PASSWORD"

echo "[init-db] Waiting for PostgreSQL to accept connections"
RETRIES=60
until pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "[init-db] PostgreSQL did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done
echo "[init-db] PostgreSQL is ready"

DB_EXISTS="$(psql -h 127.0.0.1 -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" || true)"
if [ "$DB_EXISTS" != "1" ]; then
  echo "[init-db] Creating database $POSTGRES_DB"
  createdb -h 127.0.0.1 -U "$POSTGRES_USER" "$POSTGRES_DB"
else
  echo "[init-db] Database $POSTGRES_DB already exists"
fi

export DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@127.0.0.1:5432/$POSTGRES_DB"

cd /app

echo "[init-db] Running migrations"
yarn db:migrate

echo "[init-db] Running seed"
yarn db:seed

echo "[init-db] Database initialization complete"
