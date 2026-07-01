# 构建阶段
FROM node:20-alpine AS builder

# 安装编译依赖
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖并重新编译 better-sqlite3
RUN npm ci && npm rebuild better-sqlite3

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:20-alpine

# 安装运行时依赖
RUN apk add --no-cache sqlite-libs

WORKDIR /app

# 从构建阶段复制文件
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm rebuild better-sqlite3

# 创建数据目录
RUN mkdir -p /app/data

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", ".output/server/index.mjs"]
