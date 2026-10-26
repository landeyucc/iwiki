# iWiki 系统

基于 Nuxt 3 构建的现代化 Wiki 系统，提供简洁美观的文档管理和浏览体验。

## 功能特性

- **Markdown 和 HTML 双支持**：支持 Markdown 和 HTML 两种内容格式
- **智能搜索**：支持全局搜索和文章内搜索，可切换搜索模式
- **响应式设计**：适配桌面和移动端，支持明暗主题切换
- **目录导航**：自动解析 Markdown 文章标题（H1-H4）生成目录，支持快速跳转
- **后台管理**：完整的后台管理系统，支持文章/分组/导航/备份全流程操作
- **身份认证**：JWT 认证保护后台管理功能
- **分组管理**：支持文章分组，灵活组织内容，可固定到导航栏
- **自定义导航**：后台"导航管理"支持固定分组和新增自定义外部链接
- **文章可见性**：可设置文章仅后台可见或前台公开，index 首页强制公开
- **分组折叠**：前端分组默认折叠，有可见文章时自动展开，空分组自动隐藏
- **预览模式**：URL 追加 `?onlyPreview=1` 可隐藏顶栏、侧边栏、页脚，仅渲染正文
- **备份与恢复**：一键导出/导入 `.vdata` 备份文件，使用 AES + JWT_SECRET 加密
- **系统设置**：可配置站点标题、favicon、ICP 备案、公安备案号
- **高性能**：基于 Nuxt 3 的 SSR 渲染，快速加载

## 预览模式

在任意文章页面 URL 后追加 `?onlyPreview=1` 进入全屏预览模式，页面将隐藏顶栏、侧边栏和页脚，仅渲染文章主体内容。

```
http://localhost:3000/分组slug/文章slug?onlyPreview=1
```

适用于：
- 嵌入第三方 iframe 展示
- 生成文章二维码分享
- 沉浸式阅读体验

## 技术栈

- **前端框架**：Nuxt 3 (Vue 3)
- **UI 组件**：Tailwind CSS + shadcn/ui
- **内容管理**：Nuxt Content
- **数据库**：SQLite (better-sqlite3)
- **认证**：JWT (jsonwebtoken)
- **图标**：Lucide Icons
- **样式**：Tailwind CSS + Typography 插件

## 快速开始

### 方式一：本地开发

#### 环境要求

- Node.js 18+
- npm 或 pnpm

#### 安装依赖

```bash
npm install
```

#### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

#### 生产构建

```bash
npm run build
npm run preview
```

### 方式二：Docker 部署（推荐）

#### 使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 使用 Dockerfile

```bash
# 构建镜像
docker build -t iwiki .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/wiki.db:/app/wiki.db \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=admin123 \
  -e JWT_SECRET=your_secret_key \
  --name iwiki \
  iwiki
```

## 配置说明

### 环境变量

在项目根目录创建 `.env` 文件：

```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your_very_long_random_secret_key
```

### 数据持久化

- 数据库文件：`wiki.db`
- 建议定期导出备份（后台管理 > 备份管理）

## 许可证

MIT License
