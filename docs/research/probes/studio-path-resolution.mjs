// Does Nuxt Studio resolve every content file to its own document?
//
// This is the check that caught the defect behind
// docs/adr/0001-bilingual-content-layout.md, and the one a green build cannot
// give you. Studio derives a document id from `collectionInfo.source[0]`
// unconditionally, so a collection carrying two differently-prefixed sources
// resolves every German file to its English counterpart - the build stays
// green, the URLs stay correct, and the owner is locked out of the German half
// of the site.
//
// Test the FORWARD direction (file -> id). The reverse (`generateFsPathFromId`)
// takes a per-document source and reports everything healthy either way, so
// checking only that direction is how this stays hidden.
//
// Not part of CI: it needs `.nuxt/content/preview.mjs`, which the dev server
// writes and `nuxt build` does not. Run `npm run dev` once, then:
//
//   node docs/research/probes/studio-path-resolution.mjs
//
// Expected: every file round-trips. Any German-only failure means the
// collections have been merged back together.
import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..', '..', '..')
const STUDIO = join(ROOT, 'node_modules', 'nuxt-studio', 'dist', 'module', 'runtime', 'utils')

const load = async (path) => {
  try {
    return await import(new URL(`file://${path}`))
  } catch (error) {
    throw new Error(`cannot load ${path} - run \`npm run dev\` once so the build writes it`, { cause: error })
  }
}

const { collections } = await load(join(ROOT, '.nuxt', 'content', 'preview.mjs'))
const { getCollectionByFilePath, generateIdFromFsPath, generateFsPathFromId } = await load(join(STUDIO, 'collection.js'))
const { getCollectionSourceById } = await load(join(STUDIO, 'source.js'))

const files = execSync('find content -type f \\( -name "*.md" -o -name "*.yml" \\)', { cwd: ROOT, encoding: 'utf8' })
  .trim().split('\n').map(path => path.replace(/^content\//, '')).sort()

let ok = 0
const broken = []

for (const file of files) {
  const collection = getCollectionByFilePath(file, collections)

  if (!collection) {
    broken.push([file, 'no collection matched', ''])
    continue
  }

  const id = generateIdFromFsPath(file, collection)
  let back

  try {
    back = generateFsPathFromId(id, getCollectionSourceById(id, collection.source))
  } catch (error) {
    back = `(${error.message})`
  }

  if (back === file) {
    ok += 1
  } else {
    broken.push([file, id, back])
  }
}

console.log(`round-trips to itself: ${ok}/${files.length}`)

if (broken.length === 0) {
  console.log('✔ every content file resolves to its own document')
  process.exit(0)
}

const byLocale = { en: 0, de: 0, root: 0 }
for (const [file] of broken) {
  byLocale[file.startsWith('de/') ? 'de' : file.startsWith('en/') ? 'en' : 'root'] += 1
}

console.error(`✖ ${broken.length} file(s) resolve to the wrong document: ${JSON.stringify(byLocale)}`)
for (const [file, id, back] of broken) {
  console.error(`  content/${file}\n    id: ${id}\n    -> content/${back}`)
}
console.error('\n  If the failures are all German, the collections have been merged back into one with two')
console.error('  sources. See docs/adr/0001-bilingual-content-layout.md.')
process.exitCode = 1
