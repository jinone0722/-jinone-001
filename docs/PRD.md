# WorkSphere AI PRD

## 产品定位

WorkSphere AI 是面向办公人员的 AI 工作台，聚合记录、图片文字识别、资料搜索、提醒、AI 对话和批量工作流。

## MVP 范围

P0：

- 邮箱注册、邮箱登录、JWT 鉴权
- 每个用户自动拥有独立 workspace
- Dashboard 首页
- 快速记录与自动保存
- 图片上传、批量上传、OCR mock、AI 摘要字段
- AI Chat Panel
- 全局搜索
- 定时提醒
- DIY 工作流模板、批量运行、表格结果、CSV 导出
- 办公工具中心 UI 与接口占位

## 关键页面

- `/login`
- `/register`
- `/dashboard`
- `/notes`
- `/images`
- `/reminders`
- `/workflows`
- `/search`
- `/tools`

## 验收标准

- 用户可以注册登录并进入自己的 Dashboard。
- 用户可以创建记录，记录会自动保存。
- 用户可以批量上传图片，并对图片生成 OCR mock 文本。
- 用户可以创建提醒，Dashboard 显示今日提醒。
- 用户可以搜索自己的记录、图片 OCR、文件、网址和提醒。
- 用户可以打开右侧 AI 聊天窗口。
- 用户可以创建工作流模板，运行 mock 提取，并导出 CSV。
- 项目可以通过 Docker Compose 启动。
