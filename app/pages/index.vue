<script setup lang="ts">
import type { Article } from '~/types/article'

const { isAuthenticated } = useAuth()
const { data: article } = await useAsyncData('index-article', async () => {
  try {
    const res = await $fetch<Article>('/api/articles', {
      query: { slug: 'index', groupSlug: 'system' }
    })
    return res
  } catch (_e) {
    return null
  }
})

definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: () => article.value?.title || 'Wiki 系统',
  description: () => article.value?.description
})
</script>

<template>
  <div v-if="article" class="py-12 lg:py-20">
    <div class="container mx-auto max-w-4xl">
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
  </div>
  
  <!-- 回退页面：如果 index 文章不存在 -->
  <div v-else class="relative overflow-hidden py-24 lg:py-32">
    <div class="container relative z-10">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          现代化简易 <span class="text-primary">Wiki</span> 系统
        </h1>
        <p class="text-lg text-muted-foreground mb-10">
          基于 Nuxt 3 构建，为您提供极简、美观且功能完备的知识管理体验。
        </p>
      </div>
    </div>
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
