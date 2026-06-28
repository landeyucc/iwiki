import type { H3Event } from 'h3'
import jwt from 'jsonwebtoken'

export const checkAuth = (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  const config = useRuntimeConfig()

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: '未登录'
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // CSRF Protection for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.method)) {
      const origin = getRequestHeader(event, 'origin')
      const host = getRequestHeader(event, 'host')
      const referer = getRequestHeader(event, 'referer')
      
      // Simple origin check: Origin must match Host
      if (origin) {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          throw createError({
            statusCode: 403,
            statusMessage: '潜在的 CSRF 攻击已拦截'
          })
        }
      } else if (!referer) {
        // If neither origin nor referer is present, it might be a cross-site request from an old browser
        throw createError({
          statusCode: 403,
          statusMessage: '请求缺少必要的来源信息'
        })
      }
    }

    return decoded
  } catch (err: any) {
    if (err.statusCode === 403) throw err
    throw createError({
      statusCode: 401,
      statusMessage: '登录已过期'
    })
  }
}
