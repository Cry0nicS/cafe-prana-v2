import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'

const file = process.argv[2] || 'node_modules/.cache/nuxt/.nuxt/content/sql_dump.txt'
const sql = readFileSync(file, 'utf8')
const db = new Database(':memory:')
for (const stmt of sql.split('\n')) {
  const s = stmt.replace(/ -- [a-z0-9]+$/i, '').trim()
  if (!s) continue
  try { db.exec(s) } catch (e) { console.error('SKIP:', s.slice(0, 90), '|', e.message) }
}
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '_content_%'").all().map(r => r.name)
for (const t of tables) {
  if (t === '_content_info') continue
  const cols = db.prepare(`PRAGMA table_info("${t}")`).all().map(c => c.name)
  const sel = ['id', 'stem', 'path', 'locale', 'title'].filter(c => cols.includes(c))
  const rows = db.prepare(`SELECT ${sel.map(c => `"${c}"`).join(',')} FROM "${t}"`).all()
  console.log(`\n### ${t}   (${rows.length} rows)`)
  for (const r of rows) console.log('  ' + sel.map(c => `${c}=${JSON.stringify(r[c])}`).join('  '))
}
