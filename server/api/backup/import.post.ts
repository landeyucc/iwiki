import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'
import CryptoJS from 'crypto-js'

export default defineEventHandler(async (event) => {
  checkAuth(event)

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '未上传文件' })
  }

  const file = formData[0]
  const buffer = file.data
  const encryptedStr = buffer.toString('utf-8')
  
  const secret = process.env.JWT_SECRET || ''
  let jsonStr: string
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedStr, secret)
    jsonStr = decrypted.toString(CryptoJS.enc.Utf8)
    if (!jsonStr) {
      throw new Error('解密失败')
    }
  } catch {
    throw createError({ statusCode: 400, statusMessage: '解密失败，密钥不匹配' })
  }
  
  let backup: any
  try {
    backup = JSON.parse(jsonStr)
  } catch {
    throw createError({ statusCode: 400, statusMessage: '文件格式错误' })
  }

  if (!backup.data || !backup.data.settings || !backup.data.groups || !backup.data.articles) {
    throw createError({ statusCode: 400, statusMessage: '备份数据不完整' })
  }

  db.prepare('DELETE FROM articles').run()
  db.prepare('DELETE FROM groups').run()
  db.prepare('DELETE FROM settings').run()

  backup.data.settings.forEach((row: any) => {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(row.key, row.value)
  })

  backup.data.groups.forEach((row: any) => {
    db.prepare('INSERT INTO groups (id, name, slug, is_pinned) VALUES (?, ?, ?, ?)').run(
      row.id, row.name, row.slug, row.is_pinned || 0
    )
  })

  backup.data.articles.forEach((row: any) => {
    db.prepare('INSERT INTO articles (id, group_id, title, slug, content, content_type, description, visibility, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      row.id, row.group_id, row.title, row.slug, row.content, row.content_type, row.description, row.visibility || 1, row.updated_at
    )
  })

  return { success: true, message: '备份恢复成功' }
})
