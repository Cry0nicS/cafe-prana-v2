// The two source spellings produce the *same* ids, so Studio's id -> file math
// can be compared on one set of ids. Left: `cwd` per locale. Right: the locale
// folder inside `include`. Ids come from the built database.
import { existsSync, readFileSync } from 'node:fs'
import Database from 'better-sqlite3'
import { getCollectionSourceById } from './node_modules/nuxt-studio/dist/module/runtime/utils/source.js'
import { generateFsPathFromId } from './node_modules/nuxt-studio/dist/module/runtime/utils/collection.js'

const CWD_EN = '/abs/content/en'
const CWD_DE = '/abs/content/de'

const variants = {
  // `cwd` strips the locale folder outside the glob
  cwd: {
    index: [{ include: 'index.md', prefix: '', cwd: CWD_EN }, { include: 'index.md', prefix: '/de', cwd: CWD_DE }],
    menuPage: [{ include: 'menu.yml', prefix: '', cwd: CWD_EN }, { include: 'menu.yml', prefix: '/de', cwd: CWD_DE }],
    eventsPage: [{ include: 'events.yml', prefix: '', cwd: CWD_EN }, { include: 'events.yml', prefix: '/de', cwd: CWD_DE }],
    events: [{ include: 'events/*.md', prefix: '/events', cwd: CWD_EN }, { include: 'events/*.md', prefix: '/de/events', cwd: CWD_DE }],
    menuItems: [{ include: 'menu/*.yml', prefix: '/menu', cwd: CWD_EN }, { include: 'menu/*.yml', prefix: '/de/menu', cwd: CWD_DE }],
    menuCategories: [{ include: 'menu-categories/*.yml', prefix: '/menu-categories', cwd: CWD_EN }, { include: 'menu-categories/*.yml', prefix: '/de/menu-categories', cwd: CWD_DE }]
  },
  // locale folder inside the include glob, `**/` for the singletons
  glob: {
    index: [{ include: 'en/**/index.md', prefix: '' }, { include: 'de/**/index.md', prefix: '/de' }],
    menuPage: [{ include: 'en/**/menu.yml', prefix: '' }, { include: 'de/**/menu.yml', prefix: '/de' }],
    eventsPage: [{ include: 'en/**/events.yml', prefix: '' }, { include: 'de/**/events.yml', prefix: '/de' }],
    events: [{ include: 'en/events/*.md', prefix: '/events' }, { include: 'de/events/*.md', prefix: '/de/events' }],
    menuItems: [{ include: 'en/menu/*.yml', prefix: '/menu' }, { include: 'de/menu/*.yml', prefix: '/de/menu' }],
    menuCategories: [{ include: 'en/menu-categories/*.yml', prefix: '/menu-categories' }, { include: 'de/menu-categories/*.yml', prefix: '/de/menu-categories' }]
  },
  // same, but the looser singleton glob
  'glob-star': {
    index: [{ include: 'en/*.md', prefix: '' }, { include: 'de/*.md', prefix: '/de' }],
    menuPage: [{ include: 'en/*.yml', exclude: ['en/events.yml'], prefix: '' }, { include: 'de/*.yml', exclude: ['de/events.yml'], prefix: '/de' }],
    eventsPage: [{ include: 'en/*.yml', exclude: ['en/menu.yml'], prefix: '' }, { include: 'de/*.yml', exclude: ['de/menu.yml'], prefix: '/de' }],
    events: [{ include: 'en/events/*.md', prefix: '/events' }, { include: 'de/events/*.md', prefix: '/de/events' }],
    menuItems: [{ include: 'en/menu/*.yml', prefix: '/menu' }, { include: 'de/menu/*.yml', prefix: '/de/menu' }],
    menuCategories: [{ include: 'en/menu-categories/*.yml', prefix: '/menu-categories' }, { include: 'de/menu-categories/*.yml', prefix: '/de/menu-categories' }]
  }
}

const sql = readFileSync('node_modules/.cache/nuxt/.nuxt/content/sql_dump.txt', 'utf8')
const db = new Database(':memory:')
for (const stmt of sql.split('\n')) {
  const s = stmt.replace(/ -- [a-z0-9]+$/i, '').trim()
  if (s) { try { db.exec(s) } catch { /* structure lines only */ } }
}

for (const [name, collections] of Object.entries(variants)) {
  let ok = 0; let total = 0; const failures = []
  for (const [collection, sources] of Object.entries(collections)) {
    for (const { id } of db.prepare(`SELECT id FROM "_content_${collection}"`).all()) {
      total++
      const source = getCollectionSourceById(id, sources)
      const fsPath = source ? `content/${generateFsPathFromId(id, source)}` : '(no source matched)'
      if (source && existsSync(fsPath)) ok++
      else failures.push(`${id} -> ${fsPath}`)
    }
  }
  console.log(`\n${name}: ${ok}/${total} ids resolve to a real file`)
  for (const f of failures) console.log(`  MISS ${f}`)
}
