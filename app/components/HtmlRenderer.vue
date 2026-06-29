<script setup lang="ts">
import { Maximize2, Minimize2 } from '@lucide/vue'

const props = defineProps<{
  content: string
}>()

const decodedContent = computed(() => {
  if (!props.content) return ''
  
  let decoded = props.content
  let prevDecoded = ''
  
  while (decoded !== prevDecoded) {
    prevDecoded = decoded
    decoded = decoded
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
  }
  
  return decoded
})

const hostRef = ref<HTMLElement>()
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

onMounted(() => {
  if (!hostRef.value) return
  
  const shadow = hostRef.value.attachShadow({ mode: 'open' })
  
  const wrapper = document.createElement('div')
  wrapper.innerHTML = decodedContent.value
  
  shadow.appendChild(wrapper)
  
  const scripts = wrapper.querySelectorAll('script')
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    newScript.textContent = oldScript.textContent
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
})
</script>

<template>
  <div :class="{ 'fixed inset-0 z-50 bg-background overflow-auto': isFullscreen, 'relative': !isFullscreen }">
    <button
      class="sticky top-4 right-4 float-right z-10 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
      @click="toggleFullscreen"
    >
      <Maximize2 v-if="!isFullscreen" class="h-4 w-4" />
      <Minimize2 v-else class="h-4 w-4" />
    </button>
    <div ref="hostRef" class="html-renderer-host" :class="{ 'container mx-auto py-8': isFullscreen }" />
  </div>
</template>
