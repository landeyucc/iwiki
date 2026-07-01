<script setup lang="ts">
import { Maximize2, Minimize2 } from '@lucide/vue'

const props = defineProps<{
  content: string
  showFullscreenButton?: boolean
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

const updateContent = () => {
  if (!hostRef.value) return
  
  const shadow = hostRef.value.shadowRoot || hostRef.value.attachShadow({ mode: 'open' })
  
  shadow.innerHTML = ''
  
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
}

onMounted(() => {
  updateContent()
})

watch(() => props.content, () => {
  updateContent()
})
</script>

<template>
  <div :class="{ 'fixed inset-0 z-50 bg-background overflow-auto': isFullscreen, 'relative': !isFullscreen }">
    <button
      v-if="showFullscreenButton"
      class="absolute top-3 right-3 z-20 p-2 rounded-md bg-background/80 text-foreground border border-border shadow-sm hover:bg-background/95 transition-all duration-200"
      :class="{ 'opacity-0 pointer-events-none': !isFullscreen, 'opacity-100 pointer-events-auto': isFullscreen }"
      @click="toggleFullscreen"
    >
      <Maximize2 v-if="!isFullscreen" class="h-4 w-4" />
      <Minimize2 v-else class="h-4 w-4" />
    </button>
    <div 
      ref="hostRef" 
      class="html-renderer-host" 
      :class="{ 'container mx-auto py-8': isFullscreen }" 
    />
  </div>
</template>
