// Two content checks over the locale folders. Zero dependencies; safe to run in
// CI, and needs no build.
//
//   1. FAILS when the localized homepage MDC files do not use the same set and
//      order of component blocks - a section added or removed in one language
//      but not the other.
//   2. REPORTS content that exists in only one language, without failing. That
//      is a legitimate state, not a defect; see the bottom of this file.
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Each locale's homepage and the file it must stay in sync with. A locale pair
// is the same filename in each locale folder - see
// docs/adr/0001-bilingual-content-layout.md.
const pairs = [
  { label: 'homepage', a: 'content/en/index.md', b: 'content/de/index.md' }
]

// Extract ordered MDC component tags (e.g. ::feature, :::feature-grid, ::faq-item{...}).
// Studio serialises a block without children as an inline component with a single
// colon (`:directions{...}`), so one colon counts too. Closing fences (`::`) have
// no name and are ignored.
//
// Only the block STRUCTURE is compared. Props (the YAML between `---` fences
// after a block opener, or a page's own frontmatter) are skipped entirely:
// they are independently editable per language - see
// docs/adr/0001-bilingual-content-layout.md - and Studio can write YAML keys
// that start with a colon (`:image: ...`), which would otherwise be misread as
// a component.
const extractBlocks = (src) => {
  const lines = src.split(/\r?\n/)
  const blocks = []
  let inProps = false

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (inProps) {
      if (trimmed === '---') inProps = false
      return
    }

    // A props/frontmatter fence opens at the very top of the file or directly
    // after a block opener (`::name` with no inline `{...}` content needed).
    if (trimmed === '---') {
      const previous = index === 0 ? '' : lines[index - 1].trim()
      if (index === 0 || /^:{2,}[a-z][a-z0-9-]*/.test(previous)) {
        inProps = true
        return
      }
    }

    const match = line.match(/^\s*:+([a-z][a-z0-9-]*)/)
    if (match) blocks.push(match[1])
  })

  return blocks
}

let failed = false

for (const { label, a, b } of pairs) {
  const [srcA, srcB] = await Promise.all([
    readFile(join(root, a), 'utf8'),
    readFile(join(root, b), 'utf8')
  ])

  const blocksA = extractBlocks(srcA)
  const blocksB = extractBlocks(srcB)

  const inSync
    = blocksA.length === blocksB.length
      && blocksA.every((tag, index) => tag === blocksB[index])

  if (inSync) {
    console.log(`✔ ${label}: ${a} and ${b} in sync (${blocksA.length} blocks)`)
  } else {
    failed = true
    console.error(`✖ ${label}: ${a} and ${b} are out of sync`)
    console.error(`  ${a}: ${blocksA.join(', ')}`)
    console.error(`  ${b}: ${blocksB.join(', ')}`)
  }
}

// --- content that exists in only one language -------------------------------
//
// Deliberately a REPORT, not a gate. Publishing in one language only is the
// owner's call, so an unpaired file is legitimate and must never fail CI or
// block a deploy - see docs/adr/0001-bilingual-content-layout.md. This exists
// so a developer can see the gaps, since the owner never will.

const listFiles = async (dir) => {
  const found = []
  let entries

  try {
    entries = await readdir(dir, { withFileTypes: true, recursive: true })
  } catch {
    return found
  }

  for (const entry of entries) {
    if (entry.isFile() && /\.(md|ya?ml|json)$/.test(entry.name)) {
      found.push(relative(dir, join(entry.parentPath, entry.name)))
    }
  }

  return found
}

const [enFiles, deFiles] = await Promise.all([
  listFiles(join(root, 'content', 'en')),
  listFiles(join(root, 'content', 'de'))
])

const enOnly = enFiles.filter(file => !deFiles.includes(file)).sort()
const deOnly = deFiles.filter(file => !enFiles.includes(file)).sort()

if (enOnly.length === 0 && deOnly.length === 0) {
  console.log(`✔ locale pairs: all ${enFiles.length} files exist in both languages`)
} else {
  console.log(`ℹ ${enOnly.length + deOnly.length} file(s) exist in one language only.`)
  console.log('  Allowed - the language switcher on such a page has nowhere to go, which is accepted.')
  for (const file of enOnly) {
    console.log(`  en only: content/en/${file}`)
  }
  for (const file of deOnly) {
    console.log(`  de only: content/de/${file}`)
  }
}

if (failed) {
  process.exit(1)
}
