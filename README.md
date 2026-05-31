# WorkSphere AI

WorkSphere AI 是一个 Web 版 AI 办公工作台 MVP，包含资料记录、自动保存、AI 对话、图片 OCR mock、文件/网址/提醒管理、全局搜索、DIY 工作流、批量图片处理和 CSV 导出。

## 技术栈

- Monorepo: npm workspaces
- Web: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui 风格组件
- API: NestJS, TypeScript, Prisma
- Data: PostgreSQL, Redis, Qdrant
- Deploy: Docker Compose, Nginx, GitHub Actions

## 本地启动

```bash
cp .env.example .env
npm install
npm run db:generate
docker compose up -d postgres redis qdrant
npm run db:migrate
npm run dev
```

默认端口：

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Docker 启动

```bash
cp .env.example .env
docker compose up -d --build
```

Nginx 会将 `/api/*` 反向代理到 NestJS，将 `/uploads/*` 代理到本地上传目录。

## 安全说明

- 不要提交 `.env`、服务器 IP、密码、SSH 私钥或 API Key。
- 生产环境将 `APP_ENV` 放在 GitHub Secrets，并由 workflow 写入 VPS 的 `.env`。
- JWT 密钥、数据库连接、AI API Key 均从环境变量读取。
- API 通过 JWT guard 注入当前用户，业务查询都按 `userId` 过滤。
- 上传接口限制文件类型和大小，并只写入受控上传目录。

## GitHub 远程仓库

目标仓库：

```bash
git remote add origin https://github.com/jinone0722/-jinone-001.git
git push -u origin main
```
