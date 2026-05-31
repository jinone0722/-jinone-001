#!/bin/sh
set -e

npm run db:deploy
npm run start:prod -w @worksphere/api
