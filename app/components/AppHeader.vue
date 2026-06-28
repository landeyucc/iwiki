<script setup lang="ts">
import { Moon, Sun, Search, X, FileText, Globe } from '@lucide/vue'
import type { Group, Article } from '~/types/article'

const colorMode = useColorMode()
const { isAuthenticated } = useAuth()
const { title, favicon } = useSettings()

const { data: groups } = await useFetch<Group[]>('/api/groups')
const pinnedGroups = computed(() => {
  if (!Array.isArray(groups.value)) return []
  return groups.value.filter((group: Group) => !!group.is_pinned && group.slug !== 'system')
})

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const searchQuery = ref('')
const searchResults = ref<Article[]>([])
const inPageMatches = ref<any[]>([])
const isSearching = ref(false)
const showResults = ref(false)
const searchMode = ref<'global' | 'inpage'>('global')
const currentPageSlug = ref('')

const route = useRoute()
const slugParts = computed(() => (route.params.slug || []) as string[])

const isHomePage = computed(() => {
  return route.path === '/' || (!route.params.slug || (Array.isArray(route.params.slug) && route.params.slug.length === 0))
})

watch(slugParts, (newParts) => {
  if (newParts.length >= 1) {
    currentPageSlug.value = newParts[newParts.length - 1] as string
  }
}, { immediate: true })

const performSearch = async () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) {
    searchResults.value = []
    inPageMatches.value = []
    showResults.value = false
    return
  }

  isSearching.value = true
  try {
    if (searchMode.value === 'global') {
      const results = await $fetch<Article[]>('/api/search', {
        query: { q: keyword, mode: 'global' }
      })
      searchResults.value = results.slice(0, 10)
      inPageMatches.value = []
      showResults.value = results.length > 0
    } else {
      const data = await $fetch<any>('/api/search', {
        query: { q: keyword, mode: 'inpage', pageSlug: currentPageSlug.value }
      })
      inPageMatches.value = data.matches || []
      searchResults.value = []
      showResults.value = inPageMatches.value.length > 0
    }
  } catch (err) {
    console.error('Search failed:', err)
    searchResults.value = []
    inPageMatches.value = []
    showResults.value = false
  } finally {
    isSearching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  inPageMatches.value = []
  showResults.value = false
}

const selectResult = (article: Article) => {
  const path = article.group_slug ? `/${article.group_slug}/${article.slug}` : `/system/${article.slug}`
  navigateTo(path)
  clearSearch()
}

const searchContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showResults.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img :src="favicon" alt="Logo" class="w-6 h-6 rounded">
          {{ title }}
        </NuxtLink>
      </div>

      <div class="flex flex-1 items-center justify-end gap-4">
        <div
          v-if="!isHomePage"
          ref="searchContainer"
          class="relative flex-1 max-w-md"
        >
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchMode === 'global' ? '搜索文章...' : '在当前页搜索...'"
              class="w-full h-9 pl-9 pr-20 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              @input="performSearch"
              @keydown.enter.prevent="performSearch"
            >
            <button
              v-if="searchQuery"
              class="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:text-foreground"
              @click="clearSearch"
            >
              <X class="h-4 w-4" />
            </button>
            <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                :title="searchMode === 'global' ? '全局搜索' : ''"
                class="p-1 rounded hover:bg-accent transition-colors"
                :class="searchMode === 'global' ? 'text-primary' : 'text-muted-foreground'"
                @click="searchMode = 'global'"
              >
                <Globe class="h-4 w-4" />
              </button>
              <button
                :title="searchMode === 'inpage' ? '当前页搜索' : ''"
                class="p-1 rounded hover:bg-accent transition-colors"
                :class="searchMode === 'inpage' ? 'text-primary' : 'text-muted-foreground'"
                @click="searchMode = 'inpage'"
              >
                <FileText class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            v-if="showResults && searchResults.length > 0 && searchMode === 'global'"
            class="absolute z-50 w-full mt-2 bg-card border rounded-md shadow-lg max-h-96 overflow-y-auto"
          >
            <div
              v-for="article in searchResults"
              :key="article.id"
              class="px-4 py-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
              @click="selectResult(article)"
            >
              <div class="font-medium text-sm">{{ article.title }}</div>
              <div class="text-xs text-muted-foreground truncate">{{ article.description || article.slug }}</div>
            </div>
          </div>

          <div
            v-if="showResults && inPageMatches.length > 0 && searchMode === 'inpage'"
            class="absolute z-50 w-full mt-2 bg-card border rounded-md shadow-lg max-h-96 overflow-y-auto"
          >
            <div class="px-4 py-2 border-b text-xs text-muted-foreground">
              找到 {{ inPageMatches.length }} 个匹配
            </div>
            <div
              v-for="(match, index) in inPageMatches.slice(0, 10)"
              :key="index"
              class="px-4 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
            >
              <div class="text-xs text-muted-foreground mb-1">匹配 #{{ index + 1 }}</div>
              <div class="text-sm">{{ match.snippet }}</div>
            </div>
          </div>

          <div
            v-if="showResults && searchResults.length === 0 && inPageMatches.length === 0 && searchQuery.trim()"
            class="absolute z-50 w-full mt-2 bg-card border rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground"
          >
            未找到相关内容
          </div>
        </div>

        <nav class="flex items-center gap-4">
          <NuxtLink 
            v-for="group in pinnedGroups" 
            :key="group.id" 
            :to="`/${group.slug}`" 
            class="text-sm font-medium transition-colors hover:text-primary"
          >
            {{ group.name }}
          </NuxtLink>
          <NuxtLink v-if="isAuthenticated" to="/admin" class="text-sm font-medium transition-colors hover:text-primary">后台管理</NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <button 
            class="inline-flex items-center justify-center rounded-md w-9 h-9 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            @click="toggleColorMode"
          >
            <Sun v-if="colorMode.value === 'dark'" class="h-4 w-4" />
            <Moon v-else class="h-4 w-4" />
            <span class="sr-only">切换主题</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
