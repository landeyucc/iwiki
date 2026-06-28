import db from '../../utils/db'
import { checkAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const body = await readBody(event)

  const updateSetting = db.prepare('UPDATE settings SET value = ? WHERE key = ?')
  
  const transaction = db.transaction((settings: Record<string, string>) => {
    for (const [key, value] of Object.entries(settings)) {
      updateSetting.run(value, key)
    }
  })

  transaction(body)
  return { success: true }
})
