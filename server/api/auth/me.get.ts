import { checkAuth } from '../../utils/auth'

export default defineEventHandler((event) => {
  try {
    const user = checkAuth(event)
    return { authenticated: true, user }
  } catch (_err) {
    return { authenticated: false }
  }
})
