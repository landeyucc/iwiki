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
  if (!article.value || isIndexArticle.value) return { links: [] }
  
  const links: Array<{ id: string, text: string, level: number, children?: Array<{ id: string, text: string, level: number }> }> = []
  
  if (article.value.content_type === 'md') {
    const lines = article.value.content.split('\n')
    let currentH2: { id: string, text: string, level: number } | null = null
    
    lines.forEach((line) => {
      const h1Match = line.match(/^#\s+(.+)$/m)
      const h2Match = line.match(/^##\s+(.+)$/m)
      
      if (h1Match) {
        const text = h1Match[1].trim()
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
        links.push({ id, text, level: 1 })
      }
      
      if (h2Match) {
        const text = h2Match[1].trim()
        const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
        
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push({ id, text, level: 2 })
        } else {
          links.push({ id, text, level: 2 })
        }
        currentH2 = { id, text, level: 2 }
      }
    })
  } else if (article.value.content_type === 'html') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(article.value.content, 'text/html')
    
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentH2: { id: string, text: string, level: number } | null = null
    
    headings.forEach((heading) => {
      const tagName = heading.tagName.toLowerCase()
      const level = parseInt(tagName.charAt(1))
      const text = heading.textContent?.trim() || ''
      
      if (!text) return
      
      let id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
      const existingIds = links.filter(l => l.id === id)
      if (existingIds.length > 0) {
        id += `-${existingIds.length}`
      }
      
      const existingId = heading.getAttribute('id')
      if (existingId) {
        id = existingId
      }
      
      const linkItem = { id, text, level }
      
      if (level === 1) {
        links.push(linkItem)
        currentH2 = null
      } else if (level === 2) {
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push(linkItem)
        } else {
          links.push(linkItem)
        }
        currentH2 = linkItem
      } else if (level === 3) {
        // H3 作为 H2 的子项
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push({ ...linkItem, level: 3 })
        } else {
          links.push(linkItem)
        }
      } else if (level === 4) {
        // H4 作为 H3 的子项
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push({ ...linkItem, level: 4 })
        } else {
          links.push(linkItem)
        }
      } else if (level === 5) {
        // H5 作为 H4 的子项
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push({ ...linkItem, level: 5 })
        } else {
          links.push(linkItem)
        }
      } else if (level === 6) {
        // H6 作为 H5 的子项
        if (currentH2) {
          currentH2.children = currentH2.children || []
          currentH2.children.push({ ...linkItem, level: 6 })
        } else {
          links.push(linkItem)
        }
      }
    })
  }
  
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
        <div v-else v-html="article.content"/>
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
