FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json ./
COPY package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci --include=dev

COPY . .

RUN npm run db:generate \
  && npm run build -w @worksphere/shared \
  && npm run build -w @worksphere/database \
  && npm run build -w @worksphere/api

ENV NODE_ENV=production

EXPOSE 4000

CMD ["sh", "docker/scripts/start-api.sh"]
