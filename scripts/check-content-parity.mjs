// Three content checks over the locale folders. Zero dependencies; safe to run
// in CI, and needs no build.
//
//   1. FAILS when the localized homepage MDC files do not use the same set and
//      order of component blocks - a section added or removed in one language
//      but not the other.
//   2. FAILS when a homepage image points at a file that is not in `public/`,
//      or a block carries a colon-prefixed prop (`:image: /images/x.webp`)
//      whose value is not JSON. Both mean an image the visitor never sees -
//      see docs/research/studio-image-swap.md.
//   3. REPORTS content that exists in only one language, without failing. That
//      is a legitimate state, not a defect; see the bottom of this file.
import { access, readFile, readdir } from 'node:fs/promises'
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

// --- homepage images ----------------------------------------------------------
//
// The components take `image` as a media-library path. A colon-prefixed key is
// MDC's marker for a JSON value; Studio leaves one behind holding a bare path,
// and its form then shows a second, duplicate image field.

// `modules/optimize-images.ts` turns a committed .jpg/.jpeg/.png into the .webp
// the content points at, during the build, so the source file counts too.
const imageExists = async (src) => {
  const base = join(root, 'public', src.replace(/^\//, ''))
  const candidates = [base, ...['.jpg', '.jpeg', '.png'].map(ext => base.replace(/\.webp$/, ext))]

  for (const file of candidates) {
    try {
      await access(file)
      return true
    } catch {
      // try the next candidate
    }
  }

  return false
}

const imageProblems = async (file, src) => {
  const problems = []
  const lines = src.split(/\r?\n/)

  for (const [index, line] of lines.entries()) {
    const where = `${file}:${index + 1}`
    const colonKey = line.match(/^\s*:([a-zA-Z][\w-]*):\s*(.+)$/)

    if (colonKey) {
      try {
        JSON.parse(colonKey[2])
      } catch {
        problems.push(`${where}: \`:${colonKey[1]}\` holds "${colonKey[2]}", which is not JSON - drop the colon or the line`)
      }
    }

    // `image: /path` in a YAML props block, or `image="/path"` inline.
    for (const match of line.matchAll(/(?:^\s*image:\s*|\bimage=")(\/[^"\s]+)/g)) {
      if (!(await imageExists(match[1]))) {
        problems.push(`${where}: image ${match[1]} is not in public/`)
      }
    }
  }

  return problems
}

for (const { a, b } of pairs) {
  for (const file of [a, b]) {
    const problems = await imageProblems(file, await readFile(join(root, file), 'utf8'))

    if (problems.length === 0) {
      console.log(`✔ images: ${file}`)
    } else {
      failed = true
      for (const problem of problems) {
        console.error(`✖ images: ${problem}`)
      }
    }
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
