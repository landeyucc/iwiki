export const useAuth = () => {
  const user = useState('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const checkAuth = async () => {
    try {
      const data = await $fetch('/api/auth/me')
      if (data?.authenticated) {
        user.value = data.user
      } else {
        user.value = null
      }
    } catch (_err) {
      user.value = null
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (_err) {
      // ignore
    } finally {
      user.value = null
    }
  }

  if (import.meta.client && user.value === null) {
    checkAuth()
  }

  return {
    user,
    isAuthenticated,
    checkAuth,
    logout
  }
}
