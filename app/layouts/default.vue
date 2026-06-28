<script setup lang="ts">
const { copyright, icp } = useSettings()
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t py-6">
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
