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
  const id = getRouterParam(event, 'id')
  
  // 先检查是不是系统分组
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as any
  if (group && group.slug === 'system') {
    throw createError({
      statusCode: 403,
      statusMessage: '系统分组不可编辑'
    })
  }

  const body = await readBody(event)
  const { name, slug, is_pinned } = body

  if (RESERVED_ROUTES.includes(slug)) {
    throw createError({
      statusCode: 400,
      statusMessage: `该 Slug (${slug}) 是系统保留路由，无法使用`
    })
  }

  try {
    db.prepare('UPDATE groups SET name = ?, slug = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, slug, is_pinned ? 1 : 0, id)
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message.includes('UNIQUE') ? 'Slug 已存在' : '更新失败'
    })
  }
})
