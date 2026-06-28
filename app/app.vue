<script setup lang="ts">
const { fetchSettings, title, favicon } = useSettings()

// 在服务端和客户端初始化设置
await fetchSettings()

useHead({
  titleTemplate: (t) => t ? `${t} - ${title.value}` : title.value,
  link: [
    { rel: 'icon', type: 'image/x-icon', href: favicon.value }
  ]
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
