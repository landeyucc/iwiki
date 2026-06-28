import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'wiki.db')
const db = new Database(dbPath)

// 优化性能：使用 WAL 模式
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')

// 初始化数据库表
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'md',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
  CREATE INDEX IF NOT EXISTS idx_groups_slug ON groups(slug);
`)

// 数据库迁移逻辑
try {
  db.exec("ALTER TABLE articles ADD COLUMN group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL")
} catch (_e) { /* 字段可能已存在 */ }

try {
  db.exec("ALTER TABLE articles ADD COLUMN content_type TEXT DEFAULT 'md'")
} catch (_e) { /* 字段可能已存在 */ }

try {
  db.exec("ALTER TABLE groups ADD COLUMN is_pinned INTEGER DEFAULT 0")
} catch (_e) { /* 字段可能已存在 */ }

// 初始化系统设置
const initSettings = [
  { key: 'title', value: 'iWiki 系统' },
  { key: 'favicon', value: '/favicon.ico' },
  { key: 'copyright', value: '© 2024 iWiki System. All rights reserved.' },
  { key: 'icp', value: '' }
]

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
initSettings.forEach(s => insertSetting.run(s.key, s.value))

// 初始化系统分组（固定 slug 为 'system'，不可删除）
// 使用 INSERT OR IGNORE 确保即使数据库已存在也不会报错
try {
  db.prepare('INSERT OR IGNORE INTO groups (id, name, slug) VALUES (?, ?, ?)').run(1, '系统分组', 'system')
} catch (_e) {
  // 如果 id 1 已被占用，尝试通过 slug 查找或创建
  const existingSystemGroup = db.prepare('SELECT id FROM groups WHERE slug = ?').get('system')
  if (!existingSystemGroup) {
    db.prepare('INSERT INTO groups (name, slug) VALUES (?, ?)').run('系统分组', 'system')
  }
}

// 检查文章是否为空，如果为空则插入初始数据到系统分组
const count = db.prepare('SELECT COUNT(*) as total FROM articles').get() as { total: number }
if (count.total === 0) {
  const systemGroup = db.prepare('SELECT id FROM groups WHERE slug = ?').get('system') as { id: number }
  db.prepare('INSERT INTO articles (group_id, title, slug, content, description, content_type) VALUES (?, ?, ?, ?, ?, ?)').run(
    systemGroup.id,
    '欢迎使用 iWiki',
    'index',
    `<div class="relative overflow-hidden py-24 lg:py-32">
  <div class="container relative z-10">
    <div class="mx-auto max-w-3xl text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
        现代化简易 <span class="text-primary">iWiki</span> 系统
      </h1>
      <p class="text-lg text-muted-foreground mb-10">
        基于 Nuxt 3 构建，为您提供极简、美观且功能完备的知识管理体验。
      </p>
    </div>

    <div class="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="text-xl font-bold mb-2">Markdown 驱动</h3>
        <p class="text-muted-foreground text-sm">
          使用您熟悉的 Markdown 语法编写文档，轻松管理知识库。
        </p>
      </div>
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="text-xl font-bold mb-2">极速体验</h3>
        <p class="text-muted-foreground text-sm">
          基于 Nuxt 3 的高性能架构，实现秒开的文档浏览体验。
        </p>
      </div>
      <div class="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 class="text-xl font-bold mb-2">内置搜索</h3>
        <p class="text-muted-foreground text-sm">
          强大的全文搜索功能，助您在海量文档中瞬间找到答案。
        </p>
      </div>
    </div>
  </div>
</div>`,
    '开始了解如何使用本系统。',
    'html'
  )
}

export default db
