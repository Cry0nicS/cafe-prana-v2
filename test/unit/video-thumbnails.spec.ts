import { describe, expect, it, vi } from 'vitest'
import { fetchYoutubeThumbnail, youtubeIdsIn } from '~~/scripts/video-thumbnails'

describe('finding the youtube videos a page mentions', () => {
  it('reads the id out of every link shape the share sheet produces', () => {
    const body = [
      ':video{url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="A"}',
      ':video{url="https://youtu.be/aaaaaaaaaaa" title="B"}',
      ':video{url="https://www.youtube.com/shorts/bbbbbbbbbbb" title="C"}'
    ].join('\n\n')

    expect(youtubeIdsIn(body)).toEqual(['dQw4w9WgXcQ', 'aaaaaaaaaaa', 'bbbbbbbbbbb'])
  })

  it('lists a video once however often it appears', () => {
    const body = 'url="https://youtu.be/dQw4w9WgXcQ" and again url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"'

    expect(youtubeIdsIn(body)).toEqual(['dQw4w9WgXcQ'])
  })

  // Only a video the block would actually embed is worth a request at build.
  it.each([
    ['a vimeo link', 'https://vimeo.com/123456789'],
    ['a self-hosted file', '/videos/frauenretreat.mp4'],
    ['a youtube channel', 'https://www.youtube.com/@cafeprana'],
    ['a link to the cafe', 'https://cafeprana.de/events'],
    ['no link at all', 'Just a paragraph about breathing.']
  ])('ignores %s', (_label, body) => {
    expect(youtubeIdsIn(body)).toEqual([])
  })

  // A link in a sentence is not a block: nothing embeds it, so nothing should
  // be fetched or published for it.
  it('ignores a youtube link that is only mentioned in text', () => {
    expect(youtubeIdsIn('See [our playlist](https://youtu.be/dQw4w9WgXcQ) or https://youtu.be/aaaaaaaaaaa')).toEqual([])
  })

  it('reads a single-quoted or unquoted url too', () => {
    expect(youtubeIdsIn(`:video{url='https://youtu.be/dQw4w9WgXcQ'}`)).toEqual(['dQw4w9WgXcQ'])
    expect(youtubeIdsIn('<video-embed url=https://youtu.be/aaaaaaaaaaa />')).toEqual(['aaaaaaaaaaa'])
  })

  it('stops at the end of the link, not at the end of the attribute', () => {
    expect(youtubeIdsIn('url="https://youtu.be/dQw4w9WgXcQ" title="x"')).toEqual(['dQw4w9WgXcQ'])
  })
})

describe('fetching a youtube thumbnail', () => {
  const image = (bytes: number[], status = 200) =>
    new Response(new Uint8Array(bytes), { status, headers: { 'content-type': 'image/jpeg' } })

  it('takes the large thumbnail when there is one', async () => {
    const fetcher = vi.fn(async (_url: string) => image([1, 2, 3]))

    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', fetcher)).toEqual(new Uint8Array([1, 2, 3]))
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]![0]).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
  })

  // Older and smaller uploads have no maxres file; YouTube answers 404.
  it('falls back to the smaller 16:9 thumbnail when the large one is missing', async () => {
    const fetcher = vi.fn(async (url: string) => (url.includes('maxres') ? image([9], 404) : image([4, 5])))

    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', fetcher)).toEqual(new Uint8Array([4, 5]))
    expect(fetcher.mock.calls[1]![0]).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg')
  })

  // The build must never fail over a thumbnail: no network, a removed video
  // and a blocked host all come out as "no thumbnail", and the block falls
  // back to its drawn frame.
  it('gives up quietly when every address fails', async () => {
    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', async () => image([], 404))).toBeNull()
  })

  it('gives up quietly when the network is down', async () => {
    const offline = async () => {
      throw new TypeError('fetch failed')
    }

    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', offline)).toBeNull()
  })

  it('does not keep something that is not an image', async () => {
    const html = async () => new Response('<html>consent</html>', { status: 200, headers: { 'content-type': 'text/html' } })

    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', html)).toBeNull()
  })

  it('does not keep an empty body', async () => {
    expect(await fetchYoutubeThumbnail('dQw4w9WgXcQ', async () => image([]))).toBeNull()
  })
})
