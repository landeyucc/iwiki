<script setup lang="ts">
import type { Article } from '~/types/article'

const route = useRoute()
const { isAuthenticated } = useAuth()
const slugParts = (route.params.slug || []) as string[]
let groupSlug = ''
let slug = ''

if (slugParts.length > 1) {
  groupSlug = slugParts[0] || ''
  slug = slugParts.slice(1).join('/')
} else {
  groupSlug = 'system'
  slug = slugParts[0] || ''
}

const { data: article, error } = await useAsyncData(`article-${groupSlug}-${slug}`, async () => {
  try {
    const res = await $fetch<Article>('/api/articles', {
      query: { slug, groupSlug }
    })
    return res
  } catch (e) {
    if (groupSlug) {
      const res = await $fetch<Article>('/api/articles', {
        query: { slug }
      })
      return res
    }
    throw e
  }
})

const isIndexArticle = computed(() => article.value?.slug === 'index' && article.value?.group_slug === 'system')

if (error.value || !article.value) {
  const { data: allArticles } = await useAsyncData('all-articles', () => $fetch<Article[]>('/api/articles'))
  if (allArticles.value && allArticles.value.length > 0) {
    const first = allArticles.value[0]
    if (first) {
      const path = first.group_slug ? `/${first.group_slug}/${first.slug}` : `/system/${first.slug}`
      navigateTo(path)
    }
  } else {
    console.error(`Article not found for path: ${slugParts.join('/')}`, error.value)
    throw createError({ statusCode: 404, statusMessage: '文章未找到', fatal: true })
  }
}

const toc = computed(() => {
  if (!article.value || isIndexArticle.value || article.value.content_type !== 'md') return { links: [] }
  
  const links: Array<{ id: string, text: string, level: number, children?: Array<{ id: string, text: string, level: number }> }> = []
  
  const lines = article.value.content.split('\n')
  
  lines.forEach((line) => {
    const h1Match = line.match(/^#\s+(.+)$/m)
    const h2Match = line.match(/^##\s+(.+)$/m)
    const h3Match = line.match(/^###\s+(.+)$/m)
    const h4Match = line.match(/^####\s+(.+)$/m)
    
    let text = ''
    let level = 0
    
    if (h4Match) {
      text = h4Match[1].trim()
      level = 4
    } else if (h3Match) {
      text = h3Match[1].trim()
      level = 3
    } else if (h2Match) {
      text = h2Match[1].trim()
      level = 2
    } else if (h1Match) {
      text = h1Match[1].trim()
      level = 1
    }
    
    if (level > 0) {
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
      links.push({ id, text, level })
    }
  })
  
  return { links }
})

definePageMeta({
  layout: 'docs'
})

useSeoMeta({
  title: () => article.value?.title,
  description: () => article.value?.description
})
</script>

<template>
  <div v-if="article" class="flex flex-col lg:flex-row gap-10">
    <div class="flex-1 min-w-0">
      <div class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight mb-4">{{ article.title }}</h1>
        <p v-if="article.description" class="text-lg text-muted-foreground">{{ article.description }}</p>
      </div>

      <div class="prose prose-zinc dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <MDC v-if="article.content_type === 'md'" :value="article.content" />
        <HtmlRenderer v-else :content="article.content" />
      </div>

      <div class="mt-12 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
        <span>最后更新于: {{ new Date(article.updated_at).toLocaleDateString() }}</span>
        <NuxtLink v-if="isAuthenticated" :to="`/admin/edit/${article.id}`" class="hover:text-foreground underline underline-offset-4">编辑此页</NuxtLink>
      </div>
    </div>
    
    <!-- 目录 -->
    <TableOfContents v-if="!isIndexArticle" :toc="toc" />
  </div>
</template>

<style>
.prose h2 {
  @apply border-b pb-2 mb-4 mt-8;
}
.prose code:not(pre code) {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}
.prose pre {
  @apply rounded-lg border bg-zinc-950 p-4 overflow-x-auto;
}
.prose blockquote {
  @apply border-l-4 border-primary/50 pl-4 italic text-muted-foreground;
}
</style>
