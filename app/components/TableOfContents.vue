<script setup lang="ts">
defineProps<{
  toc: any
}>()
</script>

<template>
  <div class="hidden text-sm lg:block">
    <div class="sticky top-20 -mt-10 h-[calc(100vh-5rem)] overflow-y-auto pt-10">
      <div class="space-y-2">
        <p class="font-medium">本页大纲</p>
        <ul v-if="toc && toc.links" class="m-0 list-none">
          <li v-for="link in toc.links" :key="link.id" class="mt-0 pt-2">
            <a
              :href="`#${link.id}`"
              class="inline-block no-underline transition-colors hover:text-foreground text-muted-foreground"
            >
              {{ link.text }}
            </a>
            <ul v-if="link.children" class="m-0 list-none pl-4">
              <li v-for="child in link.children" :key="child.id" class="pt-2">
                <a
                  :href="`#${child.id}`"
                  class="inline-block no-underline transition-colors hover:text-foreground text-muted-foreground"
                >
                  {{ child.text }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
