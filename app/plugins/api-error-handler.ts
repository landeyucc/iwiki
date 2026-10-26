export default defineNuxtPlugin(() => {
  const router = useRouter()

  // 全局错误处理
  const handleApiError = (error: any) => {
    // 401 未授权错误，token 可能过期
    if (error?.response?.status === 401 || error?.statusCode === 401) {
      // 如果当前不在登录页，跳转到登录页
      const currentPath = router.currentRoute.value.path
      if (!currentPath.includes('/admin/login')) {
        router.push('/admin/login')
      }
    }
  }

  // 提供全局可用的错误处理方法
  return {
    provide: {
      handleApiError
    }
  }
})
