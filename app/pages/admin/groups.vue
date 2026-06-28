<script setup lang="ts">
import { Plus, Edit, Trash2 } from '@lucide/vue'
import type { Group } from '~/types/article'

const { data: groupsData, refresh } = await useFetch<Group[]>('/api/groups')
const groups = computed(() => (Array.isArray(groupsData.value) ? groupsData.value : []))

const showModal = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null as number | null,
  name: '',
  slug: '',
  is_pinned: false
})

const openAddModal = () => {
  isEditing.value = false
  form.value = { id: null, name: '', slug: '', is_pinned: false }
  showModal.value = true
}

const isSystemGroup = (group: Group) => group.slug === 'system'

const openEditModal = (group: Group) => {
  if (isSystemGroup(group)) {
    alert('系统分组不可编辑')
    return
  }
  isEditing.value = true
  form.value = { ...group, is_pinned: !!group.is_pinned }
  showModal.value = true
}

const togglePin = async (group: Group) => {
  if (isSystemGroup(group)) {
    return
  }
  try {
    await $fetch(`/api/groups/${group.id}`, {
      method: 'PUT',
      body: { ...group, is_pinned: !group.is_pinned }
    })
    await refresh()
  } catch (err: any) {
    alert(err.data?.statusMessage || '更新失败')
  }
}

const saveGroup = async () => {
  try {
    if (isEditing.value) {
      await $fetch(`/api/groups/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await $fetch('/api/groups', {
        method: 'POST',
        body: form.value
      })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    alert(err.data?.statusMessage || '保存失败')
  }
}

const deleteGroup = async (id: number, group: Group) => {
  if (isSystemGroup(group)) {
    alert('系统分组不可删除')
    return
  }
  if (!confirm('确定要删除该分组吗？如果分组下有文章将无法删除。')) return
  try {
    await $fetch(`/api/groups/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert(err.data?.statusMessage || '删除失败')
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
        <h1 class="text-3xl font-bold tracking-tight">分组管理</h1>
        <p class="text-muted-foreground">定义文章的分组前缀，优化文档结构。</p>
      </div>
      <button 
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        @click="openAddModal"
      >
        <Plus class="mr-2 h-4 w-4" />
        新建分组
      </button>
    </div>

    <div class="rounded-md border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50 text-left">
            <th class="h-12 px-4 font-medium text-muted-foreground">名称</th>
            <th class="h-12 px-4 font-medium text-muted-foreground">Slug</th>
            <th class="h-12 px-4 font-medium text-muted-foreground w-20 whitespace-nowrap">置顶</th>
            <th class="h-12 px-4 font-medium text-muted-foreground">更新时间</th>
            <th class="h-12 px-4 text-right font-medium text-muted-foreground">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
v-for="group in groups" :key="group.id" :class="[
              'border-b transition-colors', 
              isSystemGroup(group) ? 'bg-blue-50/50 dark:bg-blue-950/10' : 'hover:bg-muted/50'
            ]">
            <td class="p-4 align-middle font-medium">
              {{ group.name }}
              <span v-if="isSystemGroup(group)" class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">系统</span>
            </td>
            <td class="p-4 align-middle text-muted-foreground font-mono">/{{ group.slug }}/*</td>
            <td class="p-4 align-middle whitespace-nowrap">
              <input 
                type="checkbox"
                :checked="!!group.is_pinned"
                :disabled="isSystemGroup(group)"
                class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                @change="togglePin(group)"
              >
            </td>
            <td class="p-4 align-middle text-muted-foreground">
              {{ new Date(group.updated_at).toLocaleString() }}
            </td>
            <td class="p-4 align-middle text-right space-x-2">
              <button 
                :disabled="isSystemGroup(group)"
                :class="[
                  'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                  isSystemGroup(group) 
                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' 
                    : 'hover:bg-accent'
                ]"
                @click="openEditModal(group)"
              >
                <Edit class="h-4 w-4" />
              </button>
              <button 
                :disabled="isSystemGroup(group)"
                :class="[
                  'inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
                  isSystemGroup(group) 
                    ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400' 
                    : 'border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground'
                ]"
                @click="deleteGroup(group.id, group)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </td>
          </tr>
          <tr v-if="groups.length === 0">
            <td colspan="5" class="p-8 text-center text-muted-foreground">
              暂无分组，点击“新建分组”开始创建。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-card border rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">{{ isEditing ? '编辑分组' : '新建分组' }}</h2>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">分组名称</label>
            <input 
              v-model="form.name"
              type="text"
              placeholder="例如：技术文档"
              class="w-full px-3 py-2 border rounded-md bg-background"
            >
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">分组 Slug</label>
            <input 
              v-model="form.slug"
              type="text"
              placeholder="例如：tech"
              class="w-full px-3 py-2 border rounded-md bg-background font-mono"
            >
            <p class="text-xs text-muted-foreground">将作为路径前缀：/{{ form.slug || '...' }}/*</p>
          </div>
          <div class="flex items-center space-x-2">
            <input 
              id="is_pinned"
              v-model="form.is_pinned"
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            >
            <label for="is_pinned" class="text-sm font-medium">显示在顶部导航栏</label>
          </div>
        </div>
        <div class="p-6 border-t bg-muted/50 flex justify-end gap-3">
          <button 
            class="px-4 py-2 rounded-md border bg-background hover:bg-accent"
            @click="showModal = false"
          >
            取消
          </button>
          <button 
            class="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            @click="saveGroup"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
