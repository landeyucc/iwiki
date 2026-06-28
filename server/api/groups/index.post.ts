import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

// 系统保留路由黑名单
const RESERVED_ROUTES = [
  'admin', 'api', '_nuxt', '__nuxt', 
  'favicon.ico', 'favicon', 
  'assets', 'public', 'static',
  'login', '404', 'error'
]

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const body = await readBody(event)
  const { name, slug, is_pinned } = body

  if (!name || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: '名称和 Slug 不能为空'
    })
  }

  if (RESERVED_ROUTES.includes(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: `该 Slug (${slug}) 是系统保留路由，无法使用`
    })
  }

  try {
    const info = db.prepare('INSERT INTO groups (name, slug, is_pinned) VALUES (?, ?, ?)').run(name, slug, is_pinned ? 1 : 0)
    return { id: info.lastInsertRowid }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message.includes('UNIQUE') ? 'Slug 已存在' : '创建失败'
    })
  }
})
