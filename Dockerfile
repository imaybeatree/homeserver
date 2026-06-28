FROM --platform=$BUILDPLATFORM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY homeapp/package*.json ./homeapp/

RUN npm ci && npm ci --prefix backend && npm ci --prefix homeapp

FROM deps AS build

COPY . .

RUN npm run build --prefix homeapp \
  && npm run build --prefix backend

FROM --platform=$BUILDPLATFORM node:22-alpine AS backend-prod-deps

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --prefix backend && npm cache clean --force

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY backend/package*.json ./backend/
COPY --from=backend-prod-deps /app/backend/node_modules ./backend/node_modules

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/homeapp/dist ./homeapp/dist

RUN addgroup -S app && adduser -S app -G app \
  && mkdir -p /app/data && chown -R app:app /app/data
USER app

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]
