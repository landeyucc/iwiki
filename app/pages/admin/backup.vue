<script setup lang="ts">
import { Download, Upload, AlertTriangle } from '@lucide/vue'

const exporting = ref(false)
const importing = ref(false)
const fileInput = ref<HTMLInputElement>()

const exportBackup = async () => {
  if (exporting.value) return
  exporting.value = true
  
  try {
    const response = await fetch('/api/backup/export')
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iwiki-backup-${Date.now()}.vdata`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    alert('备份导出成功')
  } catch (err: any) {
    alert('导出失败: ' + (err.message || '未知错误'))
  } finally {
    exporting.value = false
  }
}

const selectFile = () => {
  fileInput.value?.click()
}

const importBackup = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.name.endsWith('.vdata')) {
    alert('请选择 .vdata 格式的备份文件')
    return
  }
  
  if (!confirm('导入备份将覆盖所有现有数据，是否继续？')) {
    target.value = ''
    return
  }
  
  importing.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    await $fetch('/api/backup/import', {
      method: 'POST',
      body: formData
    })
    
    alert('备份导入成功，页面即将刷新')
    window.location.reload()
  } catch (err: any) {
    alert('导入失败: ' + (err.data?.statusMessage || err.message || '未知错误'))
  } finally {
    importing.value = false
    target.value = ''
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
      <h1 class="text-3xl font-bold tracking-tight">备份管理</h1>
      <p class="text-muted-foreground">导出和导入系统数据备份</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- 导出备份 -->
      <div class="rounded-lg border bg-card p-6">
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-primary/10 p-3">
            <Download class="h-6 w-6 text-primary" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">导出备份</h3>
            <p class="text-sm text-muted-foreground mb-4">
              导出所有系统设置、分组和文章数据为 .vdata 文件
            </p>
            <button
              class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              :disabled="exporting"
              @click="exportBackup"
            >
              <Download class="mr-2 h-4 w-4" />
              {{ exporting ? '导出中...' : '导出备份' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 导入备份 -->
      <div class="rounded-lg border bg-card p-6">
        <div class="flex items-start gap-4">
          <div class="rounded-full bg-destructive/10 p-3">
            <Upload class="h-6 w-6 text-destructive" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-2">导入备份</h3>
            <p class="text-sm text-muted-foreground mb-4">
              从 .vdata 文件恢复系统数据（将覆盖现有数据）
            </p>
            <input
              ref="fileInput"
              type="file"
              accept=".vdata"
              class="hidden"
              @change="importBackup"
            >
            <button
              class="inline-flex items-center justify-center rounded-md border border-destructive/50 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
              :disabled="importing"
              @click="selectFile"
            >
              <Upload class="mr-2 h-4 w-4" />
              {{ importing ? '导入中...' : '选择文件导入' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 警告提示 -->
    <div class="mt-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
      <div class="flex items-start gap-3">
        <AlertTriangle class="h-5 w-5 text-yellow-600 mt-0.5" />
        <div class="flex-1">
          <h4 class="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">重要提示</h4>
          <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
            <li>导出的备份文件包含所有系统数据，请妥善保管</li>
            <li>导入备份会完全覆盖现有数据，操作前请先导出当前数据</li>
            <li>导出的数据使用环境变量JWT_SECRET执行AES加密，请确保密钥安全存储</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
