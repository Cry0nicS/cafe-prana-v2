// Normalises everything under `public/images` into reasonably sized WebP and
// rewrites the references that point at the files it renames.
//
// Nuxt Studio writes uploads straight into `public/` and commits them to the
// repository, so this cannot be a one-off cleanup: whatever the editor uploads
// next has to go through the same pass. Nobody can be relied on to run it,
// either, because Studio commits to `main` without a local checkout ever being
// involved. So `modules/optimize-images.ts` runs it on every production build,
// which is what guarantees an upload is normalised before it is deployed, and
// `npm run optimize:images` runs the same pass by hand to settle the committed
// files back into their optimised form.
//
// The pass has to be idempotent, because the build reruns it over output a
// previous run may already have committed and a second opinion on an
// already-processed file would keep churning the bytes. Idempotency holds
// because the transform is a pure function of the input bytes, a file is only
// ever written when the result is genuinely smaller, and an already-WebP file
// within `MAX_EDGE` is never re-encoded at all.

import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { extname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const IMAGE_DIR = join(ROOT, 'public', 'images')

// The largest thing any layout asks for is the gallery lightbox, which now
// loads the original file rather than an IPX variant. 1800px keeps that crisp
// on a HiDPI screen without carrying camera-sized originals in the repository.
const MAX_EDGE = 1800
const QUALITY = 80

// Files above this are only reported, never force-reprocessed: using the
// budget as a re-encode trigger would break idempotency for an image that
// cannot be squeezed under it. A lossy WebP re-encode almost always comes out
// a fraction smaller, so such a file would be rewritten on every single run,
// shedding quality each time and never reaching a fixed point.
const SIZE_BUDGET = 400 * 1024

const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg', '.tif', '.tiff', '.avif', '.webp'])

// Where a renamed file might be referenced. Studio only edits `content`, but
// the components and page-level SEO metadata hardcode a few paths too.
const REFERENCE_DIRS = ['content', 'app', 'shared', 'server', 'test']
const REFERENCE_EXTS = new Set(['.md', '.yml', '.yaml', '.vue', '.ts', '.js', '.mjs', '.json'])

const kb = bytes => `${(bytes / 1024).toFixed(0)}KB`

async function walk(dir) {
  const found = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...await walk(path))
    } else if (entry.isFile()) {
      found.push(path)
    }
  }
  return found
}

// `null` means the file is already in the shape we want and must not be
// rewritten, which is what keeps repeated runs from producing new commits.
async function planFor(path) {
  const ext = extname(path).toLowerCase()
  if (!CONVERTIBLE.has(ext)) {
    return null
  }

  const input = await readFile(path)
  let meta
  try {
    meta = await sharp(input).metadata()
  } catch {
    console.warn(`  ! skipped (unreadable): ${relative(ROOT, path)}`)
    return null
  }

  // Animated sources would lose their frames through the still encoder.
  if ((meta.pages ?? 1) > 1) {
    return null
  }

  // Deliberately not conditioned on `SIZE_BUDGET`: a WebP already within
  // `MAX_EDGE` is left alone however heavy it is, and reported instead. An
  // oversized one still gets resized, and lands in this branch on the next
  // run, which is what gives the pass a fixed point.
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0)
  if (ext === '.webp' && longEdge <= MAX_EDGE) {
    return null
  }

  const output = await sharp(input)
    .rotate() // bake in EXIF orientation before it is dropped
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  // Re-encoding has to actually pay for itself. Flat graphics occasionally
  // survive better as PNG, and refusing to write here is also what makes a
  // rerun a no-op for anything that cannot be improved further.
  if (output.length >= input.length) {
    return null
  }

  return { path, input, output, ext, longEdge }
}

async function collectReferenceFiles() {
  const files = []
  for (const dir of REFERENCE_DIRS) {
    for (const path of await walk(join(ROOT, dir))) {
      if (REFERENCE_EXTS.has(extname(path).toLowerCase())) {
        files.push(path)
      }
    }
  }
  return files
}

async function rewriteReferences(renames) {
  if (renames.size === 0) {
    return []
  }
  const touched = []
  for (const path of await collectReferenceFiles()) {
    const before = await readFile(path, 'utf8')
    let after = before
    for (const [from, to] of renames) {
      if (after.includes(from)) {
        after = after.replaceAll(from, to)
      }
    }
    if (after !== before) {
      await writeFile(path, after)
      touched.push(relative(ROOT, path))
    }
  }
  return touched
}

export async function optimizeImages() {
  const files = await walk(IMAGE_DIR)
  if (files.length === 0) {
    console.log(`No images found under ${relative(ROOT, IMAGE_DIR)}`)
    return { changed: 0, failures: [] }
  }

  const renames = new Map()
  let before = 0
  let after = 0
  let changed = 0
  const oversized = []
  const failures = []

  for (const path of files.sort()) {
    const original = (await stat(path)).size

    // Per file, because the build calls this: one upload the encoder chokes on
    // must not take the whole deployment down with it. The original is left in
    // place and still referenced, so the site ships a heavy image rather than
    // no image, and the run reports what it could not handle.
    try {
      const plan = await planFor(path)

      if (!plan) {
        before += original
        after += original
        if (original > SIZE_BUDGET) {
          oversized.push(`${relative(ROOT, path)} (${kb(original)})`)
        }
        continue
      }

      const target = plan.ext === '.webp' ? path : path.slice(0, -plan.ext.length) + '.webp'

      // Write the destination first and only then drop the source, so an
      // interrupted run never leaves webp bytes behind a `.png` extension.
      await writeFile(target, plan.output)
      if (target !== path) {
        await unlink(path)
        // Public URLs are the paths under `public/`, so map those, not disk paths.
        const toUrl = p => `/${relative(join(ROOT, 'public'), p).split(/[\\/]/).join('/')}`
        renames.set(toUrl(path), toUrl(target))
      }

      before += plan.input.length
      after += plan.output.length
      changed += 1
      if (plan.output.length > SIZE_BUDGET) {
        oversized.push(`${relative(ROOT, target)} (${kb(plan.output.length)})`)
      }
      console.log(`  ${relative(ROOT, path)}: ${kb(plan.input.length)} -> ${kb(plan.output.length)}`)
    } catch (error) {
      before += original
      after += original
      failures.push(`${relative(ROOT, path)}: ${error.message}`)
    }
  }

  const touched = await rewriteReferences(renames)

  console.log('')
  if (changed === 0) {
    console.log(`✔ ${files.length} images already optimised, nothing to do`)
  } else {
    const saved = before - after
    console.log(`✔ optimised ${changed}/${files.length} images: ${kb(before)} -> ${kb(after)} (saved ${kb(saved)}, ${(saved / before * 100).toFixed(1)}%)`)
    if (renames.size > 0) {
      console.log(`✔ renamed ${renames.size} files, rewrote references in ${touched.length} files`)
    }
  }

  if (oversized.length > 0) {
    console.log(`\n⚠ still above the ${kb(SIZE_BUDGET)} budget (not an error, but worth a look):`)
    for (const entry of oversized) {
      console.log(`  - ${entry}`)
    }
  }

  if (failures.length > 0) {
    console.warn(`\n✖ left untouched, could not be processed:`)
    for (const entry of failures) {
      console.warn(`  - ${entry}`)
    }
  }

  return { changed, failures }
}

// Executed directly by `npm run optimize:images`; imported by the Nuxt module
// otherwise, which calls `optimizeImages()` itself and ignores the exit code.
// A build has to survive a file it cannot encode, but a run here is the only
// place that failure gets noticed, so this one goes red.
if (import.meta.main) {
  const { failures } = await optimizeImages()
  if (failures.length > 0) {
    process.exitCode = 1
  }
}
