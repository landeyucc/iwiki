export interface Article {
  id: number
  group_id: number | null
  title: string
  slug: string
  content: string
  content_type: 'md' | 'html'
  description: string | null
  updated_at: string
  group_slug?: string
}

export interface Group {
  id: number
  name: string
  slug: string
  is_pinned: boolean | number
  updated_at: string
}

export interface Setting {
  key: string
  value: string
}
