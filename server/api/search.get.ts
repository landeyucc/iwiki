import type { Article } from '~/types/article'
import db from '../utils/db'

export default defineEventHandler(async (event): Promise<any> => {
  const query = getQuery(event)
  const keyword = (query.q as string)?.trim()
  const mode = (query.mode as string) || 'global' // 'global' 或 'inpage'
  const pageSlug = (query.pageSlug as string) || ''

  if (!keyword || keyword.length < 1) {
    return mode === 'inpage' ? { matches: [] } : []
  }

  if (mode === 'inpage' && pageSlug) {
    // 文章内搜索
    const article = db.prepare(`
      SELECT a.*, g.slug as group_slug 
      FROM articles a 
      LEFT JOIN groups g ON a.group_id = g.id 
      WHERE a.slug = ?
    `).get(pageSlug) as Article | undefined

    if (!article) {
      return { matches: [] }
    }

    // 在文章内容中搜索关键词
    const content = article.content
    const matches: Array<{ text: string, start: number, end: number, snippet: string }> = []
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    let match

    while ((match = regex.exec(content)) !== null) {
      const start = Math.max(0, match.index - 50)
      const end = Math.min(content.length, match.index + keyword.length + 50)
      const snippet = (start > 0 ? '...' : '') + 
                      content.slice(start, end) + 
                      (end < content.length ? '...' : '')
      
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        snippet
      })
    }

    return { matches }
  }

  // 全局搜索
  const articles = db.prepare(`
    SELECT a.*, g.slug as group_slug 
    FROM articles a 
    LEFT JOIN groups g ON a.group_id = g.id 
    WHERE a.title LIKE ? OR a.description LIKE ? OR a.content LIKE ?
    ORDER BY a.updated_at DESC
  `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`) as Article[]

  return articles.slice(0, 10)
})
