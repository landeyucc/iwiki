import db from '../../utils/db'

export default defineEventHandler(async () => {
  const settings = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[]
  const result: Record<string, string> = {}
  settings.forEach(s => {
    result[s.key] = s.value
  })
  return result
})
