// Verifies that each localized homepage MDC file uses the same set and order of
// component blocks. This guards against a section being added/removed in one
// language but not the other. Zero dependencies; safe to run in CI.
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Each locale's homepage and the file it must stay in sync with.
const pairs = [
  { label: 'homepage', a: 'content/index.md', b: 'content/index.de.md' }
]

// Extract ordered MDC opening tags (e.g. ::feature, :::feature-grid, ::faq-item{...}).
// Closing fences (`::`) have no name and are ignored.
const extractBlocks = src =>
  src
    .split(/\r?\n/)
    .map(line => line.match(/^\s*:{2,}([a-z][a-z0-9-]*)/))
    .filter(Boolean)
    .map(match => match[1])

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

if (failed) {
  process.exit(1)
}
