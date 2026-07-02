<script setup lang="ts">
import { Save, CheckCircle2 } from '@lucide/vue'

const { data: settings, refresh } = await useFetch<Record<string, string>>('/api/settings')

const form = ref({
  title: '',
  favicon: '',
  copyright: '',
  icp: ''
})

const saved = ref(false)

watch(settings, (val) => {
  if (val) {
    form.value = { ...val }
  }
}, { immediate: true })

const saveSettings = async () => {
  try {
    await $fetch('/api/settings', {
      method: 'PUT',
      body: form.value
    })
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 3000)
    await refresh()
  } catch (err: any) {
    alert('保存失败: ' + (err.data?.statusMessage || err.message))
  }
}

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">系统管理</h1>
      <p class="text-muted-foreground">配置 Wiki 系统的基础信息、外观和备案信息。</p>
    </div>

    <div class="max-w-2xl bg-card border rounded-lg overflow-hidden">
      <div class="p-6 space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-medium">系统标题</label>
          <input 
            v-model="form.title"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="例如：现代化 Wiki 系统"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Favicon 链接</label>
          <input 
            v-model="form.favicon"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background font-mono"
            placeholder="/favicon.ico 或外部 URL"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">底部版权信息</label>
          <textarea 
            v-model="form.copyright"
            rows="3"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="© 2024 Wiki System. All rights reserved."
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">备案号</label>
          <input
            v-model="form.icp"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="例如：京ICP备XXXXXXXX号"
          >
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">公安备案号</label>
          <input
            v-model="form.beian"
            type="text"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="例如：43011102000123"
          >
          <p class="text-xs text-muted-foreground">
            完整填写：例如"湘公网安备43011102000123号"，系统会自动提取数字用于生成查询链接
          </p>
        </div>
      </div>

      <div class="p-6 border-t bg-muted/50 flex items-center justify-between">
        <div v-if="saved" class="flex items-center text-green-500 text-sm animate-in fade-in slide-in-from-left-2">
          <CheckCircle2 class="h-4 w-4 mr-2" />
          保存成功
        </div>
        <div v-else/>
        
        <button 
          class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
          @click="saveSettings"
        >
          <Save class="mr-2 h-4 w-4" />
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>
