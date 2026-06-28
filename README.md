# iWiki 系统

基于 Nuxt 3 构建的现代化 Wiki 系统，提供简洁美观的文档管理和浏览体验。

## 功能特性

- **Markdown 和 HTML 双支持**：支持 Markdown 和 HTML 两种内容格式
- **智能搜索**：支持全局搜索和文章内搜索，可切换搜索模式
- **响应式设计**：适配桌面和移动端，支持明暗主题切换
- **目录导航**：自动解析文章标题生成目录，支持快速跳转
- **后台管理**：完整的后台管理系统，支持文章 CRUD 操作
- **身份认证**：JWT 认证保护后台管理功能
- **分组管理**：支持文章分组，灵活组织内容
- **高性能**：基于 Nuxt 3 的 SSR/SSG 渲染，快速加载

## 技术栈

- **前端框架**：Nuxt 3 (Vue 3)
- **UI 组件**：Tailwind CSS + shadcn/ui
- **内容管理**：Nuxt Content
- **数据库**：SQLite (better-sqlite3)
- **认证**：JWT (jsonwebtoken)
- **图标**：Lucide Icons
- **样式**：Tailwind CSS + Typography 插件

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 许可证

MIT License
