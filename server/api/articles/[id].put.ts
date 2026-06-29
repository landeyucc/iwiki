import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  checkAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { title, slug, content, description, content_type, visibility } = body
  let { group_id } = body

  const systemGroup = db.prepare('SELECT id FROM groups WHERE slug = ?').get('system') as { id: number } | undefined
  
  const currentArticle = db.prepare(`
    SELECT a.*, g.slug as group_slug 
    FROM articles a 
    LEFT JOIN groups g ON a.group_id = g.id 
    WHERE a.id = ?
  `).get(id) as any

  // 如果是系统分组的 index 文章，禁止修改 slug
  if (currentArticle?.slug === 'index' && currentArticle?.group_slug === 'system') {
    if (slug !== 'index') {
      throw createError({
        statusCode: 400,
        statusMessage: '首页文章的 Slug 无法修改'
      })
    }
  }

  // 如果文章 slug 是 'index'，强制使用系统分组
  if (currentArticle?.slug === 'index' || slug === 'index') {
    if (systemGroup) {
      group_id = systemGroup.id
    }
  }

  try {
    db.prepare(`
      UPDATE articles 
      SET title = ?, slug = ?, content = ?, description = ?, content_type = ?, group_id = ?, visibility = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(title, slug, content, description, content_type, group_id, visibility ?? 1, id)
    return { success: true }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message.includes('UNIQUE') ? 'Slug 已存在' : '更新失败'
    })
  }
})
