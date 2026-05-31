#!/bin/sh
set -e

if ! npm run db:deploy; then
  echo "Prisma migrate deploy failed; syncing schema for initial MVP recovery."
  npm run db:push
  npm run db:resolve:init || true
fi

npm run start:prod -w @worksphere/api
