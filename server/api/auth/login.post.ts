import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { username, password } = body

  if (username === config.adminUser && password === config.adminPass) {
    const token = jwt.sign({ user: username }, config.jwtSecret, { expiresIn: '24h' })
    
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    })

    return { success: true }
  }

  throw createError({
    statusCode: 401,
    statusMessage: '账号或密码错误'
  })
})
