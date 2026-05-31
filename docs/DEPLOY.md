# Deploy

目标环境：

- Ubuntu 24.04 LTS
- Docker Compose
- Nginx
- PostgreSQL
- Redis
- Qdrant

## VPS 准备

创建非 root 部署用户，并安装 Docker 与 Docker Compose。不要将服务器 IP、密码、SSH 私钥或 API Key 写入代码仓库。

## 环境变量

在服务器上准备 `.env`，或将完整内容写入 GitHub Secret `APP_ENV`。Docker/生产环境可以从 `.env.docker.example` 或 `.env.example` 复制后改值：

```bash
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
QDRANT_URL=
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
CLAUDE_API_KEY=
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads
NEXT_PUBLIC_API_URL=/api
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
```

本地开发不要直接使用 Docker 服务名版本的 `DATABASE_URL`；请复制 `.env.local.example`，它使用 `localhost` 连接本机映射出来的 PostgreSQL、Redis 和 Qdrant。

## GitHub Secrets

需要预留：

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `APP_ENV`

## 自动部署

`.github/workflows/deploy.yml` 在 push 到 `main` 时触发：

1. 安装依赖
2. 生成 Prisma Client
3. 运行 lint
4. 构建项目
5. SSH 到 VPS
6. 拉取最新代码
7. 写入 `.env`
8. 执行 `docker compose up -d --build`

## 反向代理

Nginx 配置位于：

```bash
docker/nginx/default.conf
```

规则：

- `/` -> `web:3000`
- `/api/` -> `api:4000`
- `/uploads/` -> `api:4000/uploads/`
