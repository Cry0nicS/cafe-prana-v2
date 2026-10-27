import { parseVideoUrl } from '../app/utils/video'

// The pure half of `modules/video-thumbnails.ts`: which YouTube videos the
// content mentions, and how to get a still for one. The network is passed in
// so the failure cases can be tested without it.

// Only a link in a `url` attribute: that is what the video block reads. A link
// in a sentence is embedded by nothing, so nothing is fetched for it.
const VIDEO_URL = /\burl=["']?(https?:\/\/[^\s"'<>)\]}]+)/g

/** Every YouTube video the text links to, once each, in order of appearance. */
export const youtubeIdsIn = (text: string): string[] => {
  const ids = new Set<string>()

  for (const [, link] of text.matchAll(VIDEO_URL)) {
    const video = parseVideoUrl(link!)

    if (video?.provider === 'youtube') {
      ids.add(video.id)
    }
  }

  return [...ids]
}

type Fetcher = (url: string, init?: { signal?: AbortSignal }) => Promise<Response>

// Largest first. `maxresdefault` does not exist for every upload, `mqdefault`
// always does and is already 16:9 - `hqdefault` is 4:3 with black bars.
const THUMBNAILS = ['maxresdefault', 'mqdefault']

/**
 * The thumbnail's bytes, or `null` for any reason at all.
 *
 * A thumbnail is decoration. A host that is down, a removed video or a consent
 * page in place of an image must cost the page its still, never the build.
 */
export const fetchYoutubeThumbnail = async (id: string, fetcher: Fetcher = fetch): Promise<Uint8Array | null> => {
  for (const name of THUMBNAILS) {
    try {
      const response = await fetcher(`https://i.ytimg.com/vi/${id}/${name}.jpg`, { signal: AbortSignal.timeout(10_000) })

      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
        continue
      }

      const bytes = new Uint8Array(await response.arrayBuffer())

      if (bytes.length) {
        return bytes
      }
    } catch {
      continue
    }
  }

  return null
}
