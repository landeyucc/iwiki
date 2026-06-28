# iWiki 系统

基于 Nuxt 3 构建的现代化 Wiki 系统，提供简洁美观的文档管理和浏览体验。

## 功能特性

- 📝 **Markdown 和 HTML 双支持**：支持 Markdown 和 HTML 两种内容格式
- 🔍 **智能搜索**：支持全局搜索和文章内搜索，可切换搜索模式
- 🎨 **响应式设计**：适配桌面和移动端，支持明暗主题切换
- 📑 **目录导航**：自动解析文章标题生成目录，支持快速跳转
- 🛡️ **后台管理**：完整的后台管理系统，支持文章 CRUD 操作
- 🔐 **身份认证**：JWT 认证保护后台管理功能
- 📊 **分组管理**：支持文章分组，灵活组织内容
- ⚡ **高性能**：基于 Nuxt 3 的 SSR/SSG 渲染，快速加载

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

## 项目结构

```
├── app/                    # 前端应用
│   ├── components/         # Vue 组件
│   │   ├── AppHeader.vue   # 顶部导航栏
│   │   ├── Sidebar.vue     # 左侧边栏
│   │   └── TableOfContents.vue  # 文章目录
│   ├── composables/        # 组合式函数
│   │   ├── useAuth.ts      # 认证逻辑
│   │   └── useSettings.ts  # 系统设置
│   ├── layouts/            # 布局组件
│   │   ├── default.vue     # 默认布局
│   │   ├── docs.vue        # 文档布局
│   │   └── admin.vue       # 后台布局
│   ├── pages/              # 页面路由
│   │   ├── index.vue       # 首页
│   │   ├── [...slug].vue   # 动态文章页面
│   │   └── admin/          # 后台管理页面
│   └── types/              # TypeScript 类型定义
├── server/                 # 服务端代码
│   ├── api/                # API 路由
│   │   ├── articles/       # 文章相关 API
│   │   ├── auth/           # 认证 API
│   │   ├── groups/         # 分组 API
│   │   ├── search.get.ts   # 搜索 API
│   │   └── settings/       # 设置 API
│   └── utils/              # 工具函数
│       ├── auth.ts         # 认证工具
│       └── db.ts           # 数据库工具
└── public/                 # 静态资源
```

## 使用说明

### 前台功能

- **首页**：展示系统分组中的 index 文章内容
- **文章页面**：显示文章内容和目录导航
- **搜索**：支持全局搜索和文章内搜索两种模式
- **主题切换**：点击右上角切换明暗主题

### 后台管理

1. 访问 `/admin/login` 登录后台
2. 默认管理员账号需要在 `nuxt.config.ts` 中配置
3. 功能包括：
   - 文章管理：创建、编辑、删除文章
   - 分组管理：管理文章分组
   - 系统设置：配置网站标题、图标等

### 特殊文章

- **首页文章 (index)**：slug 为 `index` 且属于系统分组的文章，会显示在首页
  - 禁止修改 slug
  - 禁止删除
  - 固定在系统分组下

## 配置说明

### 管理员账号配置

在 `nuxt.config.ts` 中配置：

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    adminUser: 'admin',      // 管理员用户名
    adminPass: 'password',   // 管理员密码
    jwtSecret: 'your-secret-key'  // JWT 密钥
  }
})
```

### 数据库

数据库文件会自动创建在项目根目录的 `wiki.db`，使用 SQLite 存储所有数据。

## 开发指南

### 代码规范

项目使用 ESLint 进行代码规范检查：

```bash
npm run lint          # 检查代码
npm run lint --fix    # 自动修复问题
```

### 构建优化

- 使用 Tree-shaking 减少打包体积
- 组件懒加载提升性能
- 数据库使用 WAL 模式优化读写性能

## 许可证

MIT License
