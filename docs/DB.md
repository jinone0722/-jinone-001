# Database

Prisma schema 位于：

```bash
packages/database/prisma/schema.prisma
```

当前模型：

- `User`
- `Workspace`
- `Note`
- `ImageAsset`
- `FileAsset`
- `Link`
- `Reminder`
- `Workflow`
- `WorkflowRun`

## 迁移

MVP 已包含初始 migration：

```bash
packages/database/prisma/migrations/20260531000000_init/migration.sql
```

常用命令：

```bash
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

## 数据隔离

所有用户内容表均带有 `userId`。API 在读取、更新、删除资源时使用当前 JWT 中的用户 ID 过滤，避免跨用户访问。
