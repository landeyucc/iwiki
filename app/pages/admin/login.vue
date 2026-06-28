<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const login = async () => {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    // 强制跳转到后台并刷新页面状态
    window.location.href = '/admin'
  } catch (err: any) {
    error.value = err.data?.statusMessage || '登录失败'
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-10rem)]">
    <div class="w-full max-w-md p-8 space-y-6 bg-card border rounded-lg shadow-lg">
      <div class="text-center">
        <h1 class="text-3xl font-bold">后台登录</h1>
        <p class="text-muted-foreground mt-2">请输入管理员凭据以继续</p>
      </div>

      <form class="space-y-4" @submit.prevent="login">
        <div class="space-y-2">
          <label for="username" class="text-sm font-medium">账号</label>
          <input 
            id="username"
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="admin"
          >
        </div>
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium">密码</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
          >
        </div>

        <div v-if="error" class="text-sm text-destructive font-medium">
          {{ error }}
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>
