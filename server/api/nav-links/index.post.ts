import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const body = await readBody(event)
  const { name, url } = body

  if (!name || !url) {
    throw createError({
      statusCode: 400,
      statusMessage: '链接名称和URL不能为空'
    })
  }

  try {
    const result = db.prepare('INSERT INTO nav_links (name, url, order_num) VALUES (?, ?, 0)').run(name, url)
    return { success: true, id: result.lastInsertRowid }
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: '添加链接失败: ' + error.message
    })
  }
})
