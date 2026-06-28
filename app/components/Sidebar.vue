<script setup lang="ts">
import type { Article, Group } from '~/types/article'

const [{ data: articlesData }, { data: groupsData }] = await Promise.all([
  useAsyncData('sidebar-articles', () => $fetch<Article[]>('/api/articles')),
  useAsyncData('sidebar-groups', () => $fetch<Group[]>('/api/groups'))
])

const articles = computed(() => (Array.isArray(articlesData.value) ? articlesData.value : []))
const groups = computed(() => (Array.isArray(groupsData.value) ? groupsData.value : []))

const groupedArticles = computed(() => {
  const result: { root: { name: string, articles: Article[] } } & Record<string, { name: string, articles: Article[] }> = {
    root: { name: '概览', articles: [] }
  }
  
  const filteredGroups = groups.value.filter(g => g.slug !== 'system')
  
  filteredGroups.forEach(g => {
    result[g.id.toString()] = { name: g.name, articles: [] }
  })
  
  articles.value.forEach(a => {
    const isSystemGroupArticle = a.group_slug === 'system'
    if (!isSystemGroupArticle) {
      const key = a.group_id?.toString()
      if (key && result[key]) {
        result[key].articles.push(a)
      } else {
        result.root.articles.push(a)
      }
    }
  })
  
  return result
})

const { isAuthenticated } = useAuth()
</script>

<template>
  <aside class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
    <div class="py-6 pr-6 lg:py-8">
      <nav class="space-y-6">
        <div v-for="(group, key) in groupedArticles" :key="key" class="space-y-2">
          <h4 v-if="group.articles.length > 0" class="mb-1 px-2 text-sm font-semibold tracking-tight text-primary/80">
            {{ group.name }}
          </h4>
          <div class="grid grid-flow-row auto-rows-max text-sm">
            <NuxtLink
              v-for="article in group.articles"
              :key="article.id"
              :to="article.group_slug ? `/${article.group_slug}/${article.slug}` : `/system/${article.slug}`"
              class="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:underline text-muted-foreground transition-colors hover:text-foreground"
              active-class="!text-foreground font-medium border-l-2 border-primary -ml-[1px] pl-[7px]"
            >
              {{ article.title }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="articles.length === 0" class="px-2 py-1.5 text-xs text-muted-foreground">
          暂无文档
        </div>
        
        <div v-if="isAuthenticated" class="pt-4 border-t">
          <NuxtLink 
            to="/admin" 
            class="group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            管理后台
          </NuxtLink>
        </div>
      </nav>
    </div>
  </aside>
</template>
