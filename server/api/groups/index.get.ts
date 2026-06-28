import db from '../../utils/db'
import type { Group } from '~/types/article'

export default defineEventHandler(async () => {
  return db.prepare('SELECT * FROM groups ORDER BY updated_at DESC').all() as Group[]
})
