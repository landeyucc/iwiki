import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const id = getRouterParam(event, 'id')

  // 先检查是不是系统分组
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id) as any
  if (group && group.slug === 'system') {
    throw createError({
      statusCode: 403,
      statusMessage: '系统分组不可删除'
    })
  }

  // 检查是否有文章属于该分组
  const count = db.prepare('SELECT COUNT(*) as total FROM articles WHERE group_id = ?').get(id) as { total: number }
  if (count.total > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '该分组下尚有文章，无法删除'
    })
  }

  db.prepare('DELETE FROM groups WHERE id = ?').run(id)
  return { success: true }
})
