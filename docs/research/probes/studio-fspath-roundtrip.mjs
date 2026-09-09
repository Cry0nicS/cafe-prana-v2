// Clicking a file in Studio's tree goes fsPath -> id (to load the document),
// and Studio goes id -> fsPath to write it back. If those two disagree, the
// owner opens one file and Studio is holding another.
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = '/home/adrian/Programming/Projects/Cry0nicS/GitHub/cafe-prana-v2/.claude/worktrees/prototype-content-locale-tree'
const RT = join(ROOT, 'node_modules/nuxt-studio/dist/module/runtime/utils')

const { collections } = await import(join(ROOT, '.nuxt/content/preview.mjs'))
const { getCollectionByFilePath, generateIdFromFsPath, generateFsPathFromId } = await import(join(RT, 'collection.js'))
const { getCollectionSourceById } = await import(join(RT, 'source.js'))

const files = execSync('find content -type f \\( -name "*.md" -o -name "*.yml" \\)', { cwd: ROOT, encoding: 'utf8' })
  .trim().split('\n').map(p => p.replace(/^content\//, '')).sort()

let ok = 0
const bad = []
for (const rel of files) {
  const col = getCollectionByFilePath(rel, collections)
  if (!col) { bad.push([rel, 'NO COLLECTION MATCHED', '']); continue }
  const id = generateIdFromFsPath(rel, col)
  let back = ''
  try { back = generateFsPathFromId(id, getCollectionSourceById(id, col.source)) } catch (e) { back = `(${e.message})` }
  if (back === rel) ok++
  else bad.push([rel, id, back])
}

console.log(`round-trips to itself: ${ok}/${files.length}\n`)
const byLoc = { en: 0, de: 0, root: 0 }
for (const [rel] of bad) byLoc[rel.startsWith('de/') ? 'de' : rel.startsWith('en/') ? 'en' : 'root']++
console.log('failures by location:', JSON.stringify(byLoc), '\n')
for (const [rel, id, back] of bad) console.log(`  content/${rel}\n    id: ${id}\n    -> content/${back}`)
