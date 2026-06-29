import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'
import CryptoJS from 'crypto-js'

export default defineEventHandler(async (event) => {
  checkAuth(event)

  const settings = db.prepare('SELECT * FROM settings').all()
  const groups = db.prepare('SELECT * FROM groups').all()
  const articles = db.prepare('SELECT * FROM articles').all()

  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      settings,
      groups,
      articles
    }
  }

  const jsonStr = JSON.stringify(backup)
  const secret = process.env.JWT_SECRET || ''
  const encrypted = CryptoJS.AES.encrypt(jsonStr, secret).toString()
  const buffer = Buffer.from(encrypted, 'utf-8')

  setResponseHeader(event, 'Content-Type', 'application/octet-stream')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="iwiki-backup-${Date.now()}.vdata"`)

  return buffer
})
