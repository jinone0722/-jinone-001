FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

COPY package.json ./
COPY package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm ci

COPY . .

RUN npm run build -w @worksphere/shared \
  && npm run build -w @worksphere/ui \
  && npm run build -w @worksphere/web

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@worksphere/web"]
