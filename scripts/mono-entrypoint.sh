#!/bin/sh
set -e

: "${PGDATA:=/var/lib/postgresql/data}"
: "${POSTGRES_USER:=forgestart}"
: "${POSTGRES_PASSWORD:=forgestart}"
: "${POSTGRES_DB:=forgestart}"

mkdir -p "$PGDATA" /run/postgresql
chown -R postgres:postgres "$PGDATA" /run/postgresql
chmod 700 "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[mono] Initializing PostgreSQL data directory at $PGDATA"
  PWFILE="$(mktemp)"
  printf '%s' "$POSTGRES_PASSWORD" > "$PWFILE"
  chown postgres:postgres "$PWFILE"
  su-exec postgres initdb \
    --pgdata="$PGDATA" \
    --username="$POSTGRES_USER" \
    --pwfile="$PWFILE" \
    --auth-local=trust \
    --auth-host=scram-sha-256 \
    --encoding=UTF8
  rm -f "$PWFILE"
  {
    echo "listen_addresses = '127.0.0.1'"
    echo "unix_socket_directories = '/run/postgresql,/tmp'"
  } >> "$PGDATA/postgresql.conf"
fi

export PGDATA POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB

exec supervisord -c /etc/supervisord.conf -n
