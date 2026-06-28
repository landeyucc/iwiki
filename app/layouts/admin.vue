<script setup lang="ts">
import { 
  FileText, 
  FolderTree, 
  Settings, 
  LogOut, 
  Home
} from '@lucide/vue'

const route = useRoute()
const { logout } = useAuth()

const menuItems = [
  { name: '文章管理', path: '/admin', icon: FileText },
  { name: '分组管理', path: '/admin/groups', icon: FolderTree },
  { name: '系统管理', path: '/admin/settings', icon: Settings },
]

const handleLogout = () => {
  logout()
  navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-layout">
    <div class="admin-container">
      <aside class="admin-sidebar">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Settings class="h-6 w-6 text-primary" />
            Wiki 后台管理
          </h2>
        </div>

        <nav class="admin-nav">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            :class="[
              route.path === item.path 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            ]"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.name }}
          </NuxtLink>
        </nav>

        <div class="admin-bottom-actions">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Home class="h-5 w-5" />
            返回前端
          </NuxtLink>
          <button
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
            @click="handleLogout"
          >
            <LogOut class="h-5 w-5" />
            退出登录
          </button>
        </div>
      </aside>

      <main class="admin-main">
        <div class="p-8">
          <div class="max-w-6xl mx-auto">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.admin-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.admin-sidebar {
  width: 256px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  position: relative;
  height: 100vh;
}

.admin-main {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.admin-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding-bottom: 140px !important;
  min-height: 0;
}

.admin-bottom-actions {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  padding: 1rem;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}
</style>
