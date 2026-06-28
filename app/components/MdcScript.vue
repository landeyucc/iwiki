<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  js?: string
}>()

const slots = useSlots()

onMounted(() => {
  const content = props.js || slots.default?.()?.[0]?.children || ''
  if (content) {
    try {
      const fn = new Function(content as string)
      fn()
    } catch (e) {
      console.error('MDC Script execution error:', e)
    }
  }
})
</script>

<template>
  <div v-if="false"/>
</template>
