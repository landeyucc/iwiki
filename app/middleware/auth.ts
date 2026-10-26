export default defineNuxtRouteMiddleware(async (to) => {
  // 只在后台路由下进行认证检查
  if (!to.path.startsWith('/admin')) {
    return
  }
  
  // 登录页不需要验证
  if (to.path === '/admin/login') {
    return
  }
  
  // 在服务端和客户端都进行认证检查
  try {
    const data = await $fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!data?.authenticated) {
      return navigateTo('/admin/login')
    }
  } catch (_err) {
    // Token 过期或无效，跳转到登录页
    return navigateTo('/admin/login')
  }
})
