<script setup lang="ts">
import type { Article, Group } from '~/types/article'
import { ChevronDown, ChevronRight } from '@lucide/vue'

const [{ data: articlesData }, { data: groupsData }] = await Promise.all([
  useAsyncData('sidebar-articles', () => $fetch<Article[]>('/api/articles')),
  useAsyncData('sidebar-groups', () => $fetch<Group[]>('/api/groups'))
])

const articles = computed(() => (Array.isArray(articlesData.value) ? articlesData.value : []))
const groups = computed(() => (Array.isArray(groupsData.value) ? groupsData.value : []))

const route = useRoute()
const currentGroupSlug = computed(() => {
  const slugParts = (route.params.slug || []) as string[]
  if (slugParts.length > 0 && slugParts[0] !== 'system') {
    return slugParts[0] as string
  }
  return ''
})

const expandedGroups = ref<Set<string>>(new Set())

watch(currentGroupSlug, (newSlug) => {
  if (newSlug) {
    const group = groups.value.find(g => g.slug === newSlug)
    if (group) {
      expandedGroups.value.add(group.id.toString())
    }
  }
}, { immediate: true })

const toggleGroup = (groupId: string) => {
  if (expandedGroups.value.has(groupId)) {
    expandedGroups.value.delete(groupId)
  } else {
    expandedGroups.value.add(groupId)
  }
}

const groupedArticles = computed(() => {
  const filteredGroups = groups.value.filter(g => g.slug !== 'system')
  
  const result: Record<string, { name: string, articles: Article[] }> = {}
  
  filteredGroups.forEach(g => {
    result[g.id.toString()] = { name: g.name, articles: [] }
  })
  
  articles.value.forEach(a => {
    if (a.group_slug === 'system') return
    const key = a.group_id?.toString()
    if (key && result[key]) {
      result[key].articles.push(a)
    }
  })
  
  return result
})

const visibleGroups = computed(() => {
  return Object.entries(groupedArticles.value).filter(([_, group]) => group.articles.length > 0)
})

const { isAuthenticated } = useAuth()
</script>

<template>
  <aside class="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
    <div class="py-6 pr-6 lg:py-8">
      <nav class="space-y-2">
        <NuxtLink
          to="/"
          class="block px-2 py-1.5 text-sm font-semibold text-primary/80 hover:text-primary transition-colors"
        >
          概览
        </NuxtLink>

        <template v-for="[groupId, group] in visibleGroups" :key="groupId">
          <div class="space-y-1">
            <button
              class="flex w-full items-center gap-2 px-2 py-1.5 text-sm font-semibold text-primary/80 hover:text-primary transition-colors rounded-md hover:bg-muted"
              @click="toggleGroup(groupId)"
            >
              <component :is="expandedGroups.has(groupId) ? ChevronDown : ChevronRight" class="h-4 w-4" />
              <span>{{ group.name }}</span>
            </button>
            
            <div v-show="expandedGroups.has(groupId)" class="ml-4 space-y-1">
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
        </template>

        <div v-if="visibleGroups.length === 0 && articles.length === 0" class="px-2 py-1.5 text-xs text-muted-foreground">
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
