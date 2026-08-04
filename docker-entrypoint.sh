#!/bin/sh
set -e

# Applies pending Prisma migrations before handing off to the app.
#
# Gated on RUN_MIGRATIONS so the same image can be used two ways:
#   compose / single container -> RUN_MIGRATIONS=true, migrate then serve
#   kubernetes                 -> leave unset on the Deployment, and run
#                                 `prisma migrate deploy` from an initContainer
#                                 or Job so N replicas don't all race on rollout
#
# Uses the local binary rather than `npx` — prisma is a production dependency,
# so this resolves offline and skips npx's registry lookup.
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy
  echo "[entrypoint] migrations up to date"
fi

exec "$@"
