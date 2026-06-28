export default defineNuxtRouteMiddleware(async (to, _from) => {
  try {
    const data = await $fetch('/api/auth/me')
    
    if (!data?.authenticated) {
      if (to.path !== '/admin/login') {
        return navigateTo('/admin/login')
      }
    } else if (to.path === '/admin/login') {
      return navigateTo('/admin')
    }
  } catch (_err) {
    if (to.path !== '/admin/login') {
      return navigateTo('/admin/login')
    }
  }
})
