# scripts/start-with-migrate.sh
#!/usr/bin/env bash
set -e

echo "► Running DB migrations..."
if [ -z "$NEXT_DATABASE_URL" ]; then
  echo "⚠️ NEXT_DATABASE_URL not set. Skipping migrations."
else
  npx drizzle-kit migrate --out='./drizzle' --dialect=postgresql --url="$NEXT_DATABASE_URL"
fi

echo "► Starting Next.js"
npm start
