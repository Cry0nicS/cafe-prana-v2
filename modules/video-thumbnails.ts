import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineNuxtModule } from 'nuxt/kit'
import { fetchYoutubeThumbnail, youtubeIdsIn } from '../scripts/video-thumbnails'

// Gives a YouTube video in a page a still to show before anyone presses play,
// without the visitor's browser ever contacting YouTube to get it.
//
// The block's promise to guests is that nothing is sent to YouTube until they
// press play, and the owner docs repeat it. YouTube's own thumbnail address
// would break that on page load, so the still is fetched here, at build, and
// served from the site. It only ever reaches the browser as `/video-thumbnails/
// <id>.jpg`.
//
// The ids that came back are handed to the page through runtime config, so the
// block never points at a file that is not there: a video whose thumbnail
// could not be fetched simply has none, and the block draws its own frame.
//
// A link the owner pastes in Studio gets its thumbnail on the next build, not
// before.
export default defineNuxtModule({
  meta: {
    name: 'video-thumbnails'
  },
  async setup(_options, nuxt) {
    // `nuxt prepare` (postinstall, typecheck) and the Vitest environment load
    // modules too, and have no business on the network.
    if (nuxt.options.test || nuxt.options._prepare) {
      return
    }

    // Not under `nuxt.options.buildDir`: a production build clears that
    // directory after module setup, and the thumbnails were gone by the time
    // Nitro copied public assets, so the page linked to files the deploy did
    // not have. It also keeps what an earlier run fetched across builds.
    const dir = join(nuxt.options.rootDir, 'node_modules', '.cache', 'video-thumbnails')

    await mkdir(dir, { recursive: true })

    const ids = new Set<string>()

    for (const file of await markdownFiles(join(nuxt.options.rootDir, 'content'))) {
      for (const id of youtubeIdsIn(await readFile(file, 'utf8'))) {
        ids.add(id)
      }
    }

    // The cache outlives the content that filled it, and everything in it is
    // published. Drop what no page links to any more.
    for (const file of await readdir(dir)) {
      if (!file.endsWith('.jpg') || !ids.has(file.slice(0, -'.jpg'.length))) {
        await rm(join(dir, file), { force: true })
      }
    }

    const available: string[] = []

    await Promise.all([...ids].map(async (id) => {
      const path = join(dir, `${id}.jpg`)

      // Dev restarts and local builds keep what an earlier run fetched.
      if (!existsSync(path)) {
        const bytes = await fetchYoutubeThumbnail(id)

        if (!bytes) {
          console.warn(`[video-thumbnails] no thumbnail for youtube video ${id}; the block will show its drawn frame`)
          return
        }

        // Written under another name and renamed, so a build that dies half
        // way never leaves a truncated `<id>.jpg` for every later build to
        // trust.
        await writeFile(`${path}.part`, bytes)
        await rename(`${path}.part`, path)
      }

      available.push(id)
    }))

    nuxt.options.runtimeConfig.public.videoThumbnails = available.sort()
    nuxt.options.nitro.publicAssets ||= []
    nuxt.options.nitro.publicAssets.push({ dir, baseURL: '/video-thumbnails', maxAge: 60 * 60 * 24 * 30 })
  }
})

const markdownFiles = async (dir: string): Promise<string[]> => {
  if (!(await stat(dir).catch(() => null))?.isDirectory()) {
    return []
  }

  const found: string[] = []

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)

    if (entry.isDirectory()) {
      found.push(...await markdownFiles(path))
    } else if (entry.name.endsWith('.md')) {
      found.push(path)
    }
  }

  return found
}
