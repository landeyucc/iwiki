<script setup lang="ts">
import { Plus, Edit, Trash2, ExternalLink, Search, X } from '@lucide/vue'
import type { Article } from '~/types/article'

const { data: articlesData, refresh } = await useFetch<Article[]>('/api/articles')
const articles = computed(() => (Array.isArray(articlesData.value) ? articlesData.value : []))

const searchQuery = ref('')
const searchTerm = ref('')

const deleteArticle = async (articleId: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return
  try {
    await $fetch(`/api/articles/${articleId}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    alert('删除失败: ' + (err.data?.statusMessage || err.message))
  }
}

const filteredArticles = computed(() => {
  if (!searchTerm.value) return articles.value
  
  const term = searchTerm.value.toLowerCase()
  return articles.value.filter(article => 
    article.title.toLowerCase().includes(term) ||
    article.description?.toLowerCase().includes(term) ||
    article.slug.toLowerCase().includes(term)
  )
})

const highlightText = (text: string, term: string) => {
  if (!term) return text
  
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 text-inherit px-0.5 rounded">$1</mark>')
}

const performSearch = () => {
  searchTerm.value = searchQuery.value.trim()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchTerm.value = ''
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
        <h1 class="text-3xl font-bold tracking-tight">文章管理</h1>
        <p class="text-muted-foreground">创建和编辑您的 Wiki 内容。</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索标题..."
            class="w-64 h-9 pl-9 pr-10 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            @input="performSearch"
            @keydown.enter.prevent="performSearch"
          >
          <button
            v-if="searchQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-foreground"
            @click="clearSearch"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        
        <NuxtLink 
          to="/admin/edit/new"
          class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus class="mr-2 h-4 w-4" />
          新建文章
        </NuxtLink>
      </div>
    </div>

    <div class="rounded-md border bg-card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50 text-left">
            <th class="h-12 px-4 font-medium text-muted-foreground">标题</th>
            <th class="h-12 px-4 font-medium text-muted-foreground">路径</th>
            <th class="h-12 px-4 font-medium text-muted-foreground">更新时间</th>
            <th class="h-12 px-4 text-right font-medium text-muted-foreground">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in filteredArticles" :key="article.id" class="border-b transition-colors hover:bg-muted/50">
            <td class="p-4 align-middle font-medium">
              <span v-if="article.visibility !== 1" class="text-muted-foreground mr-2">[不可见]</span>
              <span v-html="highlightText(article.title, searchTerm)"/>
            </td>
            <td class="p-4 align-middle text-muted-foreground font-mono">
              /{{ article.group_slug ? article.group_slug + '/' : 'system/' }}{{ article.slug }}
            </td>
            <td class="p-4 align-middle text-muted-foreground">
              {{ new Date(article.updated_at).toLocaleString() }}
            </td>
            <td class="p-4 align-middle text-right space-x-2">
              <NuxtLink 
                :to="article.group_slug ? `/${article.group_slug}/${article.slug}` : `/system/${article.slug}`"
                target="_blank"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
              >
                <ExternalLink class="h-4 w-4" />
              </NuxtLink>
              <NuxtLink 
                :to="`/admin/edit/${article.id}`"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent"
              >
                <Edit class="h-4 w-4" />
              </NuxtLink>
              <button 
                v-if="!(article.slug === 'index' && article.group_slug === 'system')"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                @click="deleteArticle(article.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
              <span 
                v-else
                class="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground opacity-50"
                title="首页文章不能删除"
              >
                <Trash2 class="h-4 w-4" />
              </span>
            </td>
          </tr>
          <tr v-if="filteredArticles.length === 0">
            <td colspan="4" class="p-8 text-center text-muted-foreground">
              {{ searchTerm ? '未找到相关文章' : '暂无文章，点击"新建文章"开始编写。' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
