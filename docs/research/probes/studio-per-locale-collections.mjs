// Hypothesis: `generateIdFromFsPath` only ever reads `source[0]`, so a
// collection may hold at most ONE (fixed, prefix) pair. Give each locale its
// own collection - one source each - and the forward mapping is always right.
// Tested by synthesising the split collections from the real ones, so no
// rebuild is needed.
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = '/home/adrian/Programming/Projects/Cry0nicS/GitHub/cafe-prana-v2/.claude/worktrees/prototype-content-locale-tree'
const RT = join(ROOT, 'node_modules/nuxt-studio/dist/module/runtime/utils')

const { collections } = await import(join(ROOT, '.nuxt/content/preview.mjs'))
const { getCollectionByFilePath, generateIdFromFsPath, generateFsPathFromId } = await import(join(RT, 'collection.js'))
const { getCollectionSourceById } = await import(join(RT, 'source.js'))

// Split every multi-source collection into one collection per source.
const split = {}
for (const [name, col] of Object.entries(collections)) {
  if (!col.source || col.source.length < 2) { split[name] = col; continue }
  col.source.forEach((src) => {
    const locale = src.include.startsWith('de/') ? 'De' : 'En'
    const newName = `${name}${locale}`
    split[newName] = { ...col, name: newName, source: [src] }
  })
}

console.log('collections: %d -> %d', Object.keys(collections).length, Object.keys(split).length)
console.log(Object.keys(split).join(', '), '\n')

const files = execSync('find content -type f \\( -name "*.md" -o -name "*.yml" \\)', { cwd: ROOT, encoding: 'utf8' })
  .trim().split('\n').map(p => p.replace(/^content\//, '')).sort()

for (const [label, cols] of [['BEFORE (shared collections)', collections], ['AFTER (one per locale)', split]]) {
  let ok = 0
  const bad = []
  for (const rel of files) {
    const col = getCollectionByFilePath(rel, cols)
    if (!col) { bad.push(rel); continue }
    const id = generateIdFromFsPath(rel, col)
    let back = ''
    try { back = generateFsPathFromId(id, getCollectionSourceById(id, col.source)) } catch { back = '(threw)' }
    if (back === rel) ok++
    else bad.push(rel)
  }
  console.log(`${label}: ${ok}/${files.length} round-trip`)
  if (bad.length) console.log(`  failing: ${bad.length} (${bad.filter(f => f.startsWith('de/')).length} German, ${bad.filter(f => f.startsWith('en/')).length} English)`)
}
