export type VideoProvider = 'youtube' | 'vimeo'

export type ParsedVideo = {
  provider: VideoProvider
  id: string
  /** The embed URL, already carrying the privacy and autoplay parameters. */
  embedUrl: string
  /** Where to send someone if the embed cannot be shown. */
  watchUrl: string
}

const YOUTUBE_ID = /^[\w-]{6,20}$/
const VIMEO_ID = /^\d{6,12}$/
const VIMEO_HASH = /^[a-f0-9]{6,16}$/i

const youtubeId = (url: URL) => {
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    return url.pathname.slice(1)
  }

  if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'youtube-nocookie.com') {
    return null
  }

  // `/watch?v=`, plus the three path forms YouTube hands out from its own
  // share sheet: `/embed/`, `/shorts/` and `/live/`.
  const fromQuery = url.searchParams.get('v')

  if (fromQuery) {
    return fromQuery
  }

  const [, segment, id] = url.pathname.split('/')

  return segment === 'embed' || segment === 'shorts' || segment === 'live' ? id : null
}

const vimeoVideo = (url: URL) => {
  if (url.hostname.replace(/^www\./, '') !== 'vimeo.com') {
    return null
  }

  // `/123456789`, plus the two shapes Vimeo's share sheet produces for an
  // unlisted video: `/123456789/abc123def` and `/123456789?h=abc123def`. That
  // trailing value is the privacy hash, and the player rejects the video
  // without it - dropping it turns a working unlisted link into a dead frame.
  const [, id, segment] = url.pathname.split('/')

  if (!id) {
    return null
  }

  const hash = segment || url.searchParams.get('h') || null

  return { id, hash: hash && VIMEO_HASH.test(hash) ? hash : null }
}

/**
 * Turn whatever the owner pasted into an embed she can trust.
 *
 * Returns `null` rather than guessing when the link is not a video the site can
 * show: a mistyped URL has to degrade into a plain link on the page, never into
 * a broken frame on a published event.
 *
 * The embed URLs are the no-tracking variants on purpose - `youtube-nocookie`
 * and Vimeo's `dnt` - because the component only ever loads them after the
 * visitor asks for the video.
 */
export const parseVideoUrl = (url?: string): ParsedVideo | null => {
  if (!url) {
    return null
  }

  let parsed: URL

  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null
  }

  const youtube = youtubeId(parsed)

  if (youtube && YOUTUBE_ID.test(youtube)) {
    return {
      provider: 'youtube',
      id: youtube,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
      watchUrl: `https://www.youtube.com/watch?v=${youtube}`
    }
  }

  const vimeo = vimeoVideo(parsed)

  if (vimeo && VIMEO_ID.test(vimeo.id)) {
    const privacy = vimeo.hash ? `h=${vimeo.hash}&` : ''

    return {
      provider: 'vimeo',
      id: vimeo.id,
      embedUrl: `https://player.vimeo.com/video/${vimeo.id}?${privacy}autoplay=1&dnt=1&playsinline=1`,
      watchUrl: vimeo.hash ? `https://vimeo.com/${vimeo.id}/${vimeo.hash}` : `https://vimeo.com/${vimeo.id}`
    }
  }

  return null
}

/** A video file the site serves itself, from the media library. */
export type VideoFile = {
  /** Root-relative path, exactly as the media library wrote it. */
  src: string
  /** Lets the browser skip a format it cannot play without fetching it. */
  type: string
}

export type VideoSource = ({ kind: 'embed' } & ParsedVideo) | ({ kind: 'file' } & VideoFile)

const VIDEO_FILE_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime'
}

/**
 * A path on this site that names a video file, or `null`.
 *
 * Root-relative only: a file on another host is not something the cafe serves
 * or can vouch for, and `//host/...` would read as root-relative while leaving
 * the site.
 */
const videoFile = (value: string): VideoFile | null => {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return null
  }

  const extension = /\.(\w+)$/.exec(value.split(/[?#]/, 1)[0] ?? '')?.[1]?.toLowerCase()
  const type = extension ? VIDEO_FILE_TYPES[extension] : undefined

  return type ? { src: value, type } : null
}

/**
 * What the owner put in the video field: a file from the media library, or a
 * YouTube / Vimeo link. One field takes both, so she never has to know which
 * of the two she is holding.
 *
 * Returns `null` for anything else, for the same reason `parseVideoUrl` does.
 */
export const parseVideoSource = (value?: string): VideoSource | null => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return null
  }

  const file = videoFile(trimmed)

  if (file) {
    return { kind: 'file', ...file }
  }

  const embed = parseVideoUrl(trimmed)

  return embed ? { kind: 'embed', ...embed } : null
}
