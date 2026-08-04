# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# base — shared runtime layer.
# openssl is required by the Prisma query engine; libc6-compat by some
# prebuilt native modules; tini gives us a real PID 1 so SIGTERM reaches node.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat tini
WORKDIR /app


# ---------------------------------------------------------------------------
# deps — full dependency tree (incl. devDependencies) for building.
# python3/make/g++ are needed to compile bcrypt against musl.
# ---------------------------------------------------------------------------
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


# ---------------------------------------------------------------------------
# build — generate the Prisma client and compile TypeScript to dist/.
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . .
RUN yarn prisma generate && yarn build


# ---------------------------------------------------------------------------
# prod-deps — production-only node_modules, with bcrypt compiled and the
# Prisma client regenerated after the dev-dependency prune.
# ---------------------------------------------------------------------------
FROM base AS prod-deps
RUN apk add --no-cache python3 make g++
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY prisma ./prisma
RUN yarn prisma generate && yarn cache clean


# ---------------------------------------------------------------------------
# runner — final image: no compilers, no dev dependencies, non-root.
# ---------------------------------------------------------------------------
FROM base AS runner

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# schema + migrations, so `prisma migrate deploy` can run from this image
COPY prisma ./prisma
# resolved via process.cwd() at runtime — must live beside dist/
COPY templates ./templates
# RS256 signing keys are deliberately NOT copied — they are supplied at runtime:
#   compose     -> bind mount ./keys:/app/keys:ro
#   docker run  -> -v "$PWD/keys:/app/keys:ro"
#   kubernetes  -> Secret volume mounted at /app/keys
# token.module.ts resolves them from process.cwd(), so the app will not boot
# without one of the above.
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && chown -R node:node /app
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:3001/" > /dev/null || exit 1

# tini reaps zombies and forwards SIGTERM; the entrypoint script applies
# migrations (when RUN_MIGRATIONS=true) and then execs CMD, so node still
# ends up as the signal-receiving process.
ENTRYPOINT ["/sbin/tini", "--", "/app/docker-entrypoint.sh"]
CMD ["node", "dist/main"]
