// Does a content row `id` still round-trip to the file on disk?
// Uses Nuxt Studio's own helpers plus the *resolved* collection sources the
// build generated, so this is the same math the editor does.
import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import { collections } from './node_modules/.cache/nuxt/.nuxt/content/preview.mjs'
import { getCollectionSourceById } from './node_modules/nuxt-studio/dist/module/runtime/utils/source.js'
import { generateFsPathFromId } from './node_modules/nuxt-studio/dist/module/runtime/utils/collection.js'

// The repo's own id -> path rule, from scripts/studio-document.mjs
const contentPathFor = id => `content/${id.split('/').slice(1).join('/')}`

const sql = readFileSync('node_modules/.cache/nuxt/.nuxt/content/sql_dump.txt', 'utf8')
const db = new Database(':memory:')
for (const stmt of sql.split('\n')) {
  const s = stmt.replace(/ -- [a-z0-9]+$/i, '').trim()
  if (s) { try { db.exec(s) } catch { /* structure lines only */ } }
}

let bad = 0
for (const collection of Object.values(collections)) {
  if (collection.name === 'info') continue
  let ids
  try {
    ids = db.prepare(`SELECT id FROM "${collection.tableName}"`).all().map(r => r.id)
  } catch { continue }
  console.log(`\n### ${collection.name}`)
  for (const id of ids) {
    const source = getCollectionSourceById(id, collection.source)
    const fsPath = source ? generateFsPathFromId(id, source) : undefined
    const studioFile = fsPath ? `content/${fsPath}` : '(no source matched)'
    const repoFile = contentPathFor(id)
    const studioOk = fsPath ? existsSync(studioFile) : false
    const repoOk = existsSync(repoFile)
    if (!studioOk || !repoOk) bad++
    console.log(`  ${id}`)
    console.log(`    studio fsPath -> ${studioFile}  ${studioOk ? 'EXISTS' : 'MISSING'}`)
    console.log(`    check:studio  -> ${repoFile}  ${repoOk ? 'EXISTS' : 'MISSING'}`)
  }
}
console.log(`\n${bad} row(s) whose id does not round-trip to a real file`)
