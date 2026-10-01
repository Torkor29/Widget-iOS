# Morni website — Next.js standalone build served behind Caddy (see docker-compose.yml).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Values baked into the static pages (landing, legal).
ARG SITE_URL
ARG NEXT_PUBLIC_APP_STORE_URL
ARG CONTACT_EMAIL
ARG LEGAL_NAME
ARG LEGAL_ADDRESS
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_URL=$SITE_URL \
    NEXT_PUBLIC_APP_STORE_URL=$NEXT_PUBLIC_APP_STORE_URL \
    CONTACT_EMAIL=$CONTACT_EMAIL \
    LEGAL_NAME=$LEGAL_NAME \
    LEGAL_ADDRESS=$LEGAL_ADDRESS
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
CMD ["node", "server.js"]
