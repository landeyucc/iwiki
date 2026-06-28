<script setup lang="ts">
import { Save, ArrowLeft, Dices, AlertTriangle } from '@lucide/vue'
import { computed, ref } from 'vue'
import type { Article, Group } from '~/types/article'

const route = useRoute()
const id = route.params.id as string
const isNew = id === 'new'

const originalArticle = ref<Article | null>(null)

const form = ref({
  title: '',
  slug: '',
  description: '',
  content: '',
  content_type: 'md' as 'md' | 'html',
  group_id: null as number | null
})

const { data: groupsData } = await useFetch<Group[]>('/api/groups')
const allGroups = computed(() => (Array.isArray(groupsData.value) ? groupsData.value : []))

const isSystemIndexArticle = computed(() => {
  if (isNew) return false
  return originalArticle.value?.slug === 'index' && originalArticle.value?.group_slug === 'system'
})

const groups = computed(() => {
  if (isIndexArticle.value) {
    return allGroups.value.filter((g: { slug: string }) => g.slug === 'system')
  }
  return allGroups.value.filter((g: { slug: string }) => g.slug !== 'system')
})

const isIndexArticle = computed(() => form.value.slug === 'index')

const loading = ref(false)
const saving = ref(false)

const generateRandomSlug = () => {
  if (isSystemIndexArticle.value) return
  form.value.slug = crypto.randomUUID()
}

watch(() => form.value.slug, (newSlug) => {
  if (isSystemIndexArticle.value) return
  if (newSlug === 'index') {
    const systemGroup = allGroups.value.find(g => g.slug === 'system')
    if (systemGroup) {
      form.value.group_id = systemGroup.id
    }
  } else if (isIndexArticle.value && newSlug !== 'index') {
    const firstGroup = groups.value[0]
    if (firstGroup) {
      form.value.group_id = firstGroup.id
    }
  }
}, { immediate: true })

if (!isNew) {
  loading.value = true
  try {
    const article = await $fetch<Article>(`/api/articles`, {
      query: { id }
    })
    if (article) {
      originalArticle.value = article
      form.value = {
        title: article.title,
        slug: article.slug,
        description: article.description || '',
        content: article.content,
        content_type: article.content_type,
        group_id: article.group_id
      }
    }
  } catch (err) {
    console.error('Failed to fetch article:', err)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const url = isNew ? '/api/articles' : `/api/articles/${id}`
    const method = isNew ? 'POST' : 'PUT'
    
    await $fetch(url, {
      method,
      body: form.value
    })
    
    navigateTo('/admin')
  } catch (err: any) {
    alert('保存失败: ' + (err.data?.statusMessage || err.message))
  } finally {
    saving.value = false
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
      <div class="flex items-center gap-4">
        <NuxtLink 
          to="/admin"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
        >
          <ArrowLeft class="h-4 w-4" />
        </NuxtLink>
        <h1 class="text-3xl font-bold tracking-tight">
          {{ isNew ? '新建文章' : '编辑文章' }}
        </h1>
      </div>
      <button 
        :disabled="saving"
        class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        @click="save"
      >
        <Save class="mr-2 h-4 w-4" />
        {{ saving ? '保存中...' : '保存文章' }}
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium">标题</label>
          <input 
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="文章标题"
          >
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">所属分组</label>
            <select 
              v-model="form.group_id"
              :disabled="isIndexArticle"
              class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }} (/{{ group.slug }}/*)
              </option>
            </select>
            <div v-if="isIndexArticle" class="flex items-center gap-2 text-amber-500 text-sm">
              <AlertTriangle class="h-4 w-4" />
              <span>index文章禁止修改所属分组</span>
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium">Slug (URL 路径)</label>
            <div class="relative">
              <input 
                v-model="form.slug"
                type="text"
                :disabled="isSystemIndexArticle"
                class="w-full px-3 py-2 pr-10 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="getting-started"
              >
              <button 
                v-if="!isSystemIndexArticle"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
                title="随机生成 UUID"
                @click="generateRandomSlug"
              >
                <Dices class="h-5 w-5" />
              </button>
            </div>
            <div v-if="isSystemIndexArticle" class="flex items-center gap-2 text-amber-500 text-sm">
              <AlertTriangle class="h-4 w-4" />
              <span>index文章禁止修改Slug</span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">描述</label>
          <textarea 
            v-model="form.description"
            rows="2"
            class="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
            placeholder="简短的描述..."
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">内容类型</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.content_type" type="radio" value="md" class="accent-primary" >
              <span class="text-sm">Markdown</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.content_type" type="radio" value="html" class="accent-primary" >
              <span class="text-sm">HTML</span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">内容 ({{ form.content_type === 'md' ? 'Markdown' : 'HTML' }})</label>
          <textarea 
            v-model="form.content"
            rows="15"
            class="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
            :placeholder="form.content_type === 'md' ? '# 在这里编写 Markdown 内容...' : '<div class=\'p-4\'>在这里编写 HTML 内容...</div>'"
          />
        </div>
      </div>

      <div class="space-y-4">
        <label class="text-sm font-medium text-muted-foreground uppercase tracking-wider">实时预览 ({{ form.content_type.toUpperCase() }})</label>
        <div class="rounded-md border bg-card p-8 min-h-[500px]">
          <div class="prose prose-zinc dark:prose-invert max-w-none">
            <h1>{{ form.title || '标题预览' }}</h1>
            <p v-if="form.description" class="lead text-muted-foreground">{{ form.description }}</p>
            
            <div class="mt-8 border-t pt-8">
              <MDC v-if="form.content_type === 'md'" :value="form.content || '内容预览...'" />
              <div v-else v-html="form.content || '内容预览...'"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
