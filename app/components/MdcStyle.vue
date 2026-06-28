<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  css?: string
}>()

let styleTag: HTMLStyleElement | null = null

onMounted(() => {
  if (props.css || (slots.default && typeof slots.default === 'function')) {
    styleTag = document.createElement('style')
    const content = props.css || slots.default?.()?.[0]?.children || ''
    styleTag.innerHTML = content as string
    document.head.appendChild(styleTag)
  }
})

const slots = useSlots()

onUnmounted(() => {
  if (styleTag) {
    document.head.removeChild(styleTag)
  }
})
</script>

<template>
  <div v-if="false"/>
</template>
