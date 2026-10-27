import { describe, expect, it } from 'vitest'
import { parseVideoSource, parseVideoUrl } from '~/utils/video'

describe('reading a pasted video link', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
    '  https://m.youtube.com/watch?v=dQw4w9WgXcQ  '
  ])('reads the id out of %s', (url) => {
    expect(parseVideoUrl(url)).toMatchObject({ provider: 'youtube', id: 'dQw4w9WgXcQ' })
  })

  it.each([
    'https://vimeo.com/123456789',
    'https://vimeo.com/123456789/abc123def',
    'https://www.vimeo.com/123456789'
  ])('reads the id out of %s', (url) => {
    expect(parseVideoUrl(url)).toMatchObject({ provider: 'vimeo', id: '123456789' })
  })

  // An unlisted vimeo video is only playable with the privacy hash its share
  // link carries. Dropping it turns a working link into a dead frame, so both
  // shapes of it have to survive into the embed and into the fallback link.
  it.each([
    ['a path hash', 'https://vimeo.com/123456789/abc123def'],
    ['a query hash', 'https://vimeo.com/123456789?h=abc123def']
  ])('keeps the privacy hash from %s', (_label, url) => {
    const video = parseVideoUrl(url)

    expect(video?.embedUrl).toContain('https://player.vimeo.com/video/123456789?h=abc123def&')
    expect(video?.embedUrl).toContain('dnt=1')
    expect(video?.watchUrl).toBe('https://vimeo.com/123456789/abc123def')
  })

  it('adds no hash to a public vimeo link', () => {
    const video = parseVideoUrl('https://vimeo.com/123456789')

    expect(video?.embedUrl).not.toContain('h=')
    expect(video?.watchUrl).toBe('https://vimeo.com/123456789')
  })

  // A path segment that is not a hash must not be smuggled into the player URL.
  it('ignores a trailing segment that is not a privacy hash', () => {
    const video = parseVideoUrl('https://vimeo.com/123456789/settings')

    expect(video?.embedUrl).not.toContain('h=')
  })

  // The owner only ever sees the embed indirectly, so this is the one place the
  // privacy promise is checkable: the component contacts these hosts and no
  // others, and only after someone presses play.
  it('embeds youtube through the no-cookie host', () => {
    const video = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ')

    expect(video?.embedUrl).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(video?.embedUrl).toContain('autoplay=1')
    expect(video?.watchUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('embeds vimeo with do-not-track on', () => {
    const video = parseVideoUrl('https://vimeo.com/123456789')

    expect(video?.embedUrl).toContain('https://player.vimeo.com/video/123456789')
    expect(video?.embedUrl).toContain('dnt=1')
  })

  // A mistyped link has to degrade into a plain link on the page. Guessing would
  // put a broken frame on a published event page instead.
  it.each([
    ['nothing at all', undefined],
    ['an empty string', ''],
    ['a bare word', 'my video'],
    ['a page that is not a video', 'https://www.youtube.com/@cafeprana'],
    ['another site entirely', 'https://cafeprana.de/events'],
    ['a vimeo channel', 'https://vimeo.com/channels/staffpicks'],
    ['a javascript url', 'javascript:alert(1)'],
    ['a youtube watch link with no id', 'https://www.youtube.com/watch?list=PL123']
  ])('refuses %s', (_label, url) => {
    expect(parseVideoUrl(url)).toBeNull()
  })
})

describe('classifying what the owner put in the video field', () => {
  // The media library hands back a root-relative path, so that is the shape a
  // self-hosted video arrives in. The type is what lets the browser skip a
  // format it cannot play without downloading it first.
  it.each([
    ['/videos/prana.mp4', 'video/mp4'],
    ['/videos/prana.MP4', 'video/mp4'],
    ['/videos/prana.m4v', 'video/mp4'],
    ['/videos/prana.webm', 'video/webm'],
    ['/videos/prana.mov', 'video/quicktime'],
    ['  /videos/a%20b.mp4  ', 'video/mp4'],
    ['/videos/prana.mp4?v=2', 'video/mp4']
  ])('plays %s from the site itself', (value, type) => {
    expect(parseVideoSource(value)).toEqual({ kind: 'file', src: value.trim(), type })
  })

  it('still reads a youtube link as an embed', () => {
    expect(parseVideoSource('https://youtu.be/dQw4w9WgXcQ')).toMatchObject({
      kind: 'embed',
      provider: 'youtube',
      id: 'dQw4w9WgXcQ'
    })
  })

  it('still reads a vimeo link as an embed', () => {
    expect(parseVideoSource('https://vimeo.com/123456789')).toMatchObject({
      kind: 'embed',
      provider: 'vimeo',
      id: '123456789'
    })
  })

  // Same rule as for links: a value that is neither has to fall back to the
  // plain-link frame, not guess its way into a broken player.
  it.each([
    ['nothing at all', undefined],
    ['an empty string', ''],
    ['a path to something that is not a video', '/images/hero.webp'],
    ['a path with no extension', '/videos/prana'],
    ['a protocol-relative url to another host', '//cdn.example.com/prana.mp4'],
    ['a video file on another host', 'https://example.com/prana.mp4'],
    ['a javascript url', 'javascript:alert(1)'],
    ['a data url', 'data:video/mp4;base64,AAAA'],
    ['a bare word', 'my video']
  ])('refuses %s', (_label, value) => {
    expect(parseVideoSource(value)).toBeNull()
  })
})
