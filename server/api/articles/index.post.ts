import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  checkAuth(event)
  const body = await readBody(event)
  const { title, slug, content, description, content_type } = body
  let { group_id } = body

  if (!title || !slug || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: '标题、Slug 和内容不能为空'
    })
  }

  const systemGroup = db.prepare('SELECT id FROM groups WHERE slug = ?').get('system') as { id: number } | undefined
  
  // 检查是否尝试创建系统分组的 index 文章
  const isCreatingSystemIndex = slug === 'index' && (
    (systemGroup && group_id === systemGroup.id) || 
    !group_id // 或者没有指定分组但 slug 是 index
  )
  
  // 检查系统分组中是否已存在 index 文章
  if (isCreatingSystemIndex && systemGroup) {
    const existingIndex = db.prepare(`
      SELECT a.id FROM articles a 
      JOIN groups g ON a.group_id = g.id 
      WHERE a.slug = 'index' AND g.slug = 'system'
    `).get()
    if (existingIndex) {
      throw createError({
        statusCode: 400,
        statusMessage: '系统分组中已存在 index 文章'
      })
    }
  }
  
  // 如果文章 slug 是 'index'，强制使用系统分组
  if (slug === 'index' && systemGroup) {
    group_id = systemGroup.id
  }

  try {
    const info = db.prepare(`
      INSERT INTO articles (title, slug, content, description, content_type, group_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, slug, content, description, content_type || 'md', group_id)
    return { id: info.lastInsertRowid }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message.includes('UNIQUE') ? 'Slug 已存在' : '创建失败'
    })
  }
})
