// Fails when a homepage image would not be drawn: its file is missing from
// `public/`, its value has no usable path, or a block carries a colon-prefixed
// prop that MDC cannot read. Each of those used to ship as a green build and a
// page with the picture silently missing - see docs/research/studio-image-swap.md.
//
// TypeScript, so the verdict comes from the same `resolveContentImage()` the
// components use. Run through `jiti` (part of `npm run check:content`).
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { findImageProblems } from './content-images'
import { summarise } from './step-summary'

const ROOT = resolve(import.meta.dirname, '..')
const FILES = ['content/en/index.md', 'content/de/index.md']

// `modules/optimize-images.ts` turns a committed .jpg/.jpeg/.png into the .webp
// the content points at, during the build, so the source file counts too.
const imageExists = (src: string) => {
  const base = join(ROOT, 'public', src.replace(/^\//, ''))

  return [base, ...['.jpg', '.jpeg', '.png'].map(ext => base.replace(/\.webp$/, ext))].some(existsSync)
}

let failed = false

for (const file of FILES) {
  const problems = findImageProblems(await readFile(join(ROOT, file), 'utf8'), imageExists)

  if (problems.length === 0) {
    console.log(`✔ images: ${file}`)
    continue
  }

  failed = true
  summarise(`### Homepage images: ${file}\n`)

  for (const { component, line, message } of problems) {
    console.error(`✖ images: ${file}:${line} (${component}): ${message}`)
    summarise(`- line ${line}, \`${component}\`: ${message}`)
  }
}

if (failed) {
  process.exit(1)
}
