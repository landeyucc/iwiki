export const useSettings = () => {
  const settings = useState<Record<string, string>>('system-settings', () => ({}))

  const fetchSettings = async () => {
    try {
      const data = await $fetch<Record<string, string>>('/api/settings')
      settings.value = data
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const title = computed(() => settings.value.title || 'iWiki 首页')
  const favicon = computed(() => settings.value.favicon || '/favicon.ico')
  const copyright = computed(() => settings.value.copyright || '© 2026 iWiki Powered by Coldsea.')
  const icp = computed(() => settings.value.icp || '')
  const beian = computed(() => settings.value.beian || '')

  // 提取备案号中的数字部分
  const beianCode = computed(() => {
    const match = beian.value.match(/\d+/)
    return match ? match[0] : ''
  })

  return {
    settings,
    fetchSettings,
    title,
    favicon,
    copyright,
    icp,
    beian,
    beianCode
  }
}
