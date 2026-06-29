<script setup lang="ts">
import { useSettings } from '~/composables/useSettings';

const { copyright, icp } = useSettings()
const route = useRoute()
const isPreviewMode = computed(() => route.query.onlyPreview === '1')
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <AppHeader v-if="!isPreviewMode" />
    <div class="container flex-1 items-start md:grid md:gap-6 lg:gap-10" :class="isPreviewMode ? '' : 'md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]'">
      <Sidebar v-if="!isPreviewMode" />
      <div class="flex flex-1 gap-10">
        <main class="relative py-6 lg:gap-10 lg:py-8 flex-1 min-w-0">
          <slot />
        </main>
      </div>
    </div>
    <footer v-if="!isPreviewMode" class="border-t py-6">
      <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div class="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
          <span>{{ copyright }}</span>
          <span v-if="icp" class="hidden md:inline text-muted-foreground/30">|</span>
          <a 
            v-if="icp" 
            href="https://beian.miit.gov.cn/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="hover:text-foreground hover:underline transition-colors"
          >
            {{ icp }}
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
