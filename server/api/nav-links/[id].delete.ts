import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const id = getRouterParam(event, 'id')

  try {
    db.prepare('DELETE FROM nav_links WHERE id = ?').run(id)
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: '删除链接失败: ' + error.message
    })
  }
})
