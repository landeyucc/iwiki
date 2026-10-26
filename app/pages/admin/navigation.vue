<script setup lang="ts">
import { Pin, PinOff, Plus, Save, Trash2, Globe } from '@lucide/vue'
import type { Group, NavLink } from '~/types/article'

const { data: groupsData, refresh } = await useFetch<Group[]>('/api/groups')
const groups = computed(() => (Array.isArray(groupsData.value) ? groupsData.value : []))

const { data: navLinksData, refresh: refreshLinks } = await useFetch<NavLink[]>('/api/nav-links')
const navLinks = computed(() => (Array.isArray(navLinksData.value) ? navLinksData.value : []))

const showAddDialog = ref(false)
const newLink = ref({
  name: '',
  url: ''
})

const togglePin = async (groupId: number, isPinned: boolean) => {
  try {
    const group = groups.value.find(g => g.id === groupId)
    if (!group) return
    
    await $fetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: { 
        name: group.name,
        slug: group.slug,
        is_pinned: !isPinned 
      }
    })
    await refresh()
  } catch (err: any) {
    alert('操作失败: ' + (err.data?.statusMessage || err.message))
  }
}

const saveNewLink = async () => {
  if (!newLink.value.name || !newLink.value.url) {
    alert('请填写完整的链接信息')
    return
  }
  
  try {
    await $fetch('/api/nav-links', {
      method: 'POST',
      body: {
        name: newLink.value.name,
        url: newLink.value.url
      }
    })
    await refreshLinks()
    showAddDialog.value = false
    newLink.value = { name: '', url: '' }
    alert('添加成功')
  } catch (err: any) {
    alert('添加失败: ' + (err.data?.statusMessage || err.message))
  }
}

const deleteLink = async (linkId: number) => {
  if (!confirm('确定要删除这个链接吗？')) return
  
  try {
    await $fetch(`/api/nav-links/${linkId}`, {
      method: 'DELETE'
    })
    await refreshLinks()
    alert('删除成功')
  } catch (err: any) {
    alert('删除失败: ' + (err.data?.statusMessage || err.message))
  }
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">
          导航管理
        </h1>
        <p class="text-muted-foreground">
          管理顶部导航栏显示的分组和链接。
        </p>
      </div>
      <button 
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        @click="showAddDialog = true"
      >
        <Plus class="mr-2 h-4 w-4" />
        添加自定义链接
      </button>
    </div>

    <div class="space-y-6">
      <div class="rounded-md border bg-card overflow-hidden">
        <div class="p-4 border-b bg-muted/50">
          <h2 class="text-lg font-semibold">
            分组固定到导航栏
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            固定的分组会显示在顶部导航栏中
          </p>
        </div>
        <div class="p-4">
          <div class="space-y-2">
            <div
              v-for="group in groups.filter(g => g.slug !== 'system')"
              :key="group.id"
              class="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <component 
                  :is="group.is_pinned ? Pin : PinOff" 
                  class="h-5 w-5"
                  :class="group.is_pinned ? 'text-primary' : 'text-muted-foreground'"
                />
                <div>
                  <div class="font-medium">
                    {{ group.name }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    /{{ group.slug }}
                  </div>
                </div>
              </div>
              <button
                class="inline-flex h-9 px-4 items-center justify-center rounded-md border transition-colors"
                :class="group.is_pinned ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'"
                @click="togglePin(group.id, group.is_pinned)"
              >
                {{ group.is_pinned ? '取消固定' : '固定到导航栏' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-md border bg-card overflow-hidden">
        <div class="p-4 border-b bg-muted/50">
          <h2 class="text-lg font-semibold">
            自定义链接
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            添加外部链接到导航栏
          </p>
        </div>
        <div class="p-4">
          <div v-if="navLinks.length === 0" class="text-sm text-muted-foreground text-center py-8">
            暂无自定义链接，点击右上角按钮添加
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="link in navLinks"
              :key="link.id"
              class="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <Globe class="h-5 w-5 text-muted-foreground" />
                <div>
                  <div class="font-medium">
                    {{ link.name }}
                  </div>
                  <div class="text-sm text-muted-foreground">
                    {{ link.url }}
                  </div>
                </div>
              </div>
              <button
                class="inline-flex h-9 px-4 items-center justify-center rounded-md border text-destructive hover:bg-destructive/10 transition-colors"
                @click="deleteLink(link.id)"
              >
                <Trash2 class="h-4 w-4 mr-2" />
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAddDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      @click.self="showAddDialog = false"
    >
      <div class="bg-card border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          添加自定义链接
        </h3>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">链接名称</label>
          <input
            v-model="newLink.name"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="例如：官方文档"
          >
        </div>
        
        <div class="space-y-2">
          <label class="text-sm font-medium">链接地址</label>
          <input
            v-model="newLink.url"
            type="url"
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="https://example.com"
          >
        </div>
        
        <div class="flex justify-end gap-3 pt-4">
          <button
            class="px-4 py-2 rounded-md border hover:bg-accent transition-colors"
            @click="showAddDialog = false"
          >
            取消
          </button>
          <button
            class="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            @click="saveNewLink"
          >
            <Save class="mr-2 h-4 w-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
