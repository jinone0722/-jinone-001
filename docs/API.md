# API

API 默认运行在 `http://localhost:4000`。生产环境通过 Nginx 暴露为 `/api/*`。

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Notes

- `GET /notes?search=&tag=&favorite=`
- `POST /notes`
- `GET /notes/:id`
- `PATCH /notes/:id`
- `DELETE /notes/:id`

## Images

- `GET /images?search=`
- `POST /images/upload`
- `POST /images/upload/batch`
- `POST /images/:id/ocr`
- `DELETE /images/:id`

## Files

- `GET /files?search=`
- `POST /files/upload`
- `DELETE /files/:id`

## Links

- `GET /links`
- `POST /links`
- `DELETE /links/:id`

## Reminders

- `GET /reminders?today=true`
- `POST /reminders`
- `PATCH /reminders/:id`
- `DELETE /reminders/:id`

## Search

- `GET /search?q=`

## AI

- `POST /ai/chat`
- `POST /ai/summarize`
- `POST /ai/extract-reminder`
- `POST /ai/extract-image-data`

当前 AI 接口为 mock/provider-ready 结构；当 `.env` 中存在 `OPENAI_API_KEY`、`DEEPSEEK_API_KEY` 或 `CLAUDE_API_KEY` 时，会标记对应 provider 可用。

## Workflows

- `GET /workflows`
- `POST /workflows`
- `GET /workflows/:id`
- `PATCH /workflows/:id`
- `DELETE /workflows/:id`
- `POST /workflows/:id/run`
- `GET /workflows/:id/runs`
- `GET /workflows/runs/:runId/export-csv`

## Tools

- `GET /tools`
- `POST /tools/:toolKey/run`
