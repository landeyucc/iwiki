import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  checkAuth(event)
  const id = getRouterParam(event, 'id')

  const article = db.prepare(`
    SELECT a.*, g.slug as group_slug 
    FROM articles a 
    LEFT JOIN groups g ON a.group_id = g.id 
    WHERE a.id = ?
  `).get(id) as any

  if (article?.slug === 'index' && article?.group_slug === 'system') {
    throw createError({
      statusCode: 400,
      statusMessage: '首页文章不能删除'
    })
  }

  db.prepare('DELETE FROM articles WHERE id = ?').run(id)
  return { success: true }
})
