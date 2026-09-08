// Fails when a content file would show "Conflict detected" in Nuxt Studio.
//
// Studio does not compare bytes. It parses the file as it stands on the branch
// in GitHub, asks the deployed site for the same document out of its content
// database, and refuses to open the file if the two do not match. So a build
// that stores a document even slightly differently from how Studio reads the
// source locks the owner out of that page, and nothing about the site or the
// build going green says so - the conflicts this check was written for shipped
// as a passing build and a healthy site.
//
// Two sides, two sources:
//   - Studio's side is read from **git**, not from the working tree. The
//     production build rewrites `content/**` when the image pass renames a file
//     (`foo.png` -> `foo.webp`), and CI cannot commit that back, so the tree
//     after a build no longer matches the branch Studio reads. Comparing
//     against the tree hid exactly the mismatch that causes the conflict.
//   - The build's side is the per-collection dumps under `.output/`, the same
//     files the deployed site hands the browser. Re-deriving them here would
//     re-derive any bug along with them.
//
// Needs a build first (`npm run build`).
import { readFile, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { gunzipSync } from 'node:zlib'
import {
  EMOJI_SHORTCODE_HINT,
  compareDocuments,
  contentPathFor,
  documentsFromQueries,
  findEmojiShortcodes,
  studioDocument
} from './studio-document.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const DUMPS = join(ROOT, '.output', 'public', '__nuxt_content')

// The revision Studio would be reading. In CI this is the commit the build ran
// on, which is exactly right; locally it is whatever is committed, which is why
// uncommitted content is reported below rather than silently compared.
const REVISION = 'HEAD'

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

const fileFromGit = (path) => {
  try {
    return git('show', `${REVISION}:${path}`)
  } catch {
    return null
  }
}

// --- load the build's dumps --------------------------------------------------

let collections
try {
  collections = await readdir(DUMPS)
} catch {
  console.error(`✖ no content dumps under ${relative(ROOT, DUMPS)}.`)
  console.error('  They are written by the build, so run `npm run build` first.')
  process.exit(1)
}

// Each collection is one gzipped, base64-encoded JSON array of SQL statements.
const queries = []
for (const collection of collections) {
  const encoded = await readFile(join(DUMPS, collection, 'sql_dump.txt'), 'utf8')
  queries.push(...JSON.parse(gunzipSync(Buffer.from(encoded, 'base64')).toString()))
}

const deployedDocuments = documentsFromQueries(queries)

// --- is either side stale? ---------------------------------------------------

// Content that differs from the committed revision. Locally that means unsaved
// work; in CI it means the build rewrote `content/**` on its way past, which is
// itself a cause of conflicts, so it is worth naming either way.
const dirty = git('status', '--porcelain', '--', 'content')
  .split('\n')
  .map(line => line.slice(3).trim())
  .filter(Boolean)

if (dirty.length > 0) {
  console.warn(`⚠ ${dirty.length} content file(s) differ from ${REVISION}, which is what Studio reads:`)
  for (const path of dirty.slice(0, 10)) {
    console.warn(`  ${path}`)
  }
  console.warn('  Comparing against the committed version. Commit them, or expect this to differ')
  console.warn('  from what a deployment of this revision would serve.')
  console.warn('')
}

// A dump that predates a content file was built from a different tree, so the
// comparison would pass or fail for reasons a deployment never sees.
const committed = new Set(
  git('ls-tree', '-r', REVISION, '--name-only', 'content')
    .split('\n')
    .filter(path => /\.(md|ya?ml|json)$/.test(path))
)
const inDump = new Set(deployedDocuments.map(document => contentPathFor(document.id)))
const missingFromDump = [...committed].filter(path => !inDump.has(path))

if (missingFromDump.length > 0) {
  console.warn(`⚠ ${missingFromDump.length} committed content file(s) are absent from the dump:`)
  for (const path of missingFromDump.slice(0, 10)) {
    console.warn(`  ${path}`)
  }
  console.warn('  Rebuild (`npm run build`) if content has changed since the last one.')
  console.warn('')
}

// --- compare -----------------------------------------------------------------

const conflicts = []
let checked = 0

for (const deployed of deployedDocuments) {
  const path = contentPathFor(deployed.id)
  const source = fileFromGit(path)

  if (source === null) {
    console.error(`✖ the dump holds ${path}, which does not exist at ${REVISION}.`)
    console.error('  The dump was built from a different tree; rebuild (`npm run build`) and retry.')
    process.exit(1)
  }

  const generated = await studioDocument(deployed.id, source)
  const { matches, bodyMatches, fields } = compareDocuments(generated, deployed)
  checked += 1

  if (matches) {
    continue
  }

  // Studio only ever reports "the content differs", so name what differs.
  const reasons = fields.map(key =>
    `${key}: file=${JSON.stringify(generated[key])} built=${JSON.stringify(deployed[key])}`
  )
  if (!bodyMatches) {
    reasons.unshift('body: the parsed document tree differs')
  }

  const shortcodes = findEmojiShortcodes(source)
  if (shortcodes.length > 0) {
    reasons.push(`${[...new Set(shortcodes)].join(', ')} - ${EMOJI_SHORTCODE_HINT}`)
  }

  conflicts.push({ path, reasons })
}

if (conflicts.length === 0) {
  console.log(`✔ ${checked} content documents match what Studio derives from their source at ${REVISION}`)
  process.exit(0)
}

console.error(`✖ ${conflicts.length}/${checked} content documents would show "Conflict detected" in Studio:`)
for (const { path, reasons } of conflicts) {
  console.error(`  ${path}`)
  for (const reason of reasons) {
    console.error(`    ${reason}`)
  }
}
process.exitCode = 1
