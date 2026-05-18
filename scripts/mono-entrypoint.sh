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

# Build DATABASE_URL from POSTGRES_* at runtime so it stays in sync with
# whatever password initdb used. The Dockerfile-level ENV is just a default
# for local builds; overriding it here lets supervisord pass the correct
# URL to next + realtime + migrate + seed via inherited environment.
export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}"

# --- NEXT_PUBLIC_* runtime injection ---------------------------------------
# Next.js bakes NEXT_PUBLIC_* into client bundles at build time. To allow the
# mono image to be reused with different domains, the build stamps placeholder
# URLs that we replace with the user's runtime values here.
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
REALTIME_URL_PUBLIC="${NEXT_PUBLIC_REALTIME_URL:-http://localhost:4000}"

if [ -d /app/.next.original ]; then
  echo "[mono] Restoring pristine .next from /app/.next.original"
  rm -rf /app/.next
  cp -al /app/.next.original /app/.next
fi

echo "[mono] Injecting NEXT_PUBLIC_APP_URL=$APP_URL"
echo "[mono] Injecting NEXT_PUBLIC_REALTIME_URL=$REALTIME_URL_PUBLIC"
find /app/.next/static /app/.next/server -type f \( -name '*.js' -o -name '*.json' -o -name '*.html' -o -name '*.css' \) \
  -exec sed -i \
    -e "s|http://forgestart-app.invalid|$APP_URL|g" \
    -e "s|http://forgestart-realtime.invalid|$REALTIME_URL_PUBLIC|g" \
    {} +

export NEXT_PUBLIC_APP_URL="$APP_URL"
export NEXT_PUBLIC_REALTIME_URL="$REALTIME_URL_PUBLIC"
# --- end NEXT_PUBLIC_* runtime injection -----------------------------------

exec supervisord -c /etc/supervisord.conf -n
