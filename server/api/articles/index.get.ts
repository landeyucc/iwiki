import type { Article } from '~/types/article'
import db from '../../utils/db'

export default defineEventHandler(async (event): Promise<Article | Article[]> => {
  const query = getQuery(event)
  const slug = query.slug as string
  const id = query.id as string
  const groupSlug = query.groupSlug as string

  if (id) {
    const article = db.prepare(`
      SELECT a.*, g.slug as group_slug 
      FROM articles a 
      LEFT JOIN groups g ON a.group_id = g.id 
      WHERE a.id = ?
    `).get(id) as Article | undefined
    
    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: '文章未找到'
      })
    }
    return article
  }

  if (slug && groupSlug) {
    const article = db.prepare(`
      SELECT a.*, g.slug as group_slug 
      FROM articles a 
      JOIN groups g ON a.group_id = g.id 
      WHERE a.slug = ? AND g.slug = ?
    `).get(slug, groupSlug) as Article | undefined
    
    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: '文章未找到'
      })
    }
    return article
  }

  return db.prepare(`
    SELECT a.*, g.slug as group_slug 
    FROM articles a 
    LEFT JOIN groups g ON a.group_id = g.id 
    ORDER BY a.updated_at DESC
  `).all() as Article[]
})
