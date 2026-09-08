import { describe, expect, it } from 'vitest'
import {
  compareDocuments,
  contentPathFor,
  documentBodyString,
  documentsFromQueries,
  findEmojiShortcodes,
  studioDocument
} from '~~/scripts/studio-document.mjs'

const markdown = (body: string) => `---\nlocale: en\n---\n\n${body}\n`

describe('studio document derivation', () => {
  it('derives a data document the way Studio reads the file', async () => {
    const document = await studioDocument(
      'openingHours/opening-hours.yml',
      'hours:\n  - day: monday\n    closed: true\n'
    )

    expect(document).toMatchObject({
      id: 'openingHours/opening-hours.yml',
      extension: 'yml',
      stem: 'opening-hours',
      meta: {},
      hours: [{ day: 'monday', closed: true }]
    })
  })

  it('derives a page document with frontmatter and a body', async () => {
    const document = await studioDocument('index/index.md', markdown('Hello.'))

    expect(document).toMatchObject({ id: 'index/index.md', extension: 'md', stem: 'index', locale: 'en' })
    expect(documentBodyString(document.body)).toContain('Hello.')
  })

  // The build defaults remark-mdc's `autoUnwrap` off and Studio hardcodes it on,
  // which is why `nuxt.config.ts` turns it on. If this ever parses back to a
  // wrapped paragraph, every markdown page conflicts in Studio again.
  it('unwraps a block component whose slot is a single paragraph', async () => {
    const document = await studioDocument('index/index.md', markdown('::callout\nJust one paragraph.\n::'))

    expect(documentBodyString(document.body)).not.toContain('["p"')
    expect(documentBodyString(document.body)).toContain('Just one paragraph.')
  })
})

describe('emoji shortcodes', () => {
  // Studio parses with its own emoji plugin, which turns `:smile:` into a span
  // carrying an aria-label. @nuxt/content registers `remark-emoji` instead,
  // which produces the bare character. The two can never match, so this locks
  // in that the checker reproduces Studio's side rather than either of the
  // other two shapes (the character, or the untouched shortcode).
  it('parses a shortcode the way Studio does, not the way the build does', async () => {
    const document = await studioDocument('index/index.md', markdown('A gathering :smile:'))
    const body = documentBodyString(document.body)

    expect(body).toContain('ariaLabel=":smile:"')
    expect(body).toContain('😄')
    expect(body).not.toContain(':smile: ')
  })

  it('cannot match the character the build stores, so a shortcode always conflicts', async () => {
    const shortcode = await studioDocument('index/index.md', markdown('A gathering :smile:'))
    const character = await studioDocument('index/index.md', markdown('A gathering 😄'))

    expect(compareDocuments(shortcode, character as never).bodyMatches).toBe(false)
    expect(compareDocuments(character, character as never).bodyMatches).toBe(true)
  })

  it('finds shortcodes so the failure can explain itself', () => {
    expect(findEmojiShortcodes('Come along :tada: and :smile:')).toEqual([':tada:', ':smile:'])
  })

  // The content in this repo is full of colons that are not shortcodes; a false
  // positive would attach a misleading hint to an unrelated conflict.
  it('ignores times, urls and MDC syntax', () => {
    for (const source of [
      'time: "09:30-11:30"',
      'time: "18:00"',
      'date: 2026-09-14',
      'https://cafeprana.de/events',
      '::home-hero',
      ':feature{description="Everything is gluten-free." icon="i-lucide-wheat-off"}',
      'src: /images/events/posts/deep-talk.webp'
    ]) {
      expect(findEmojiShortcodes(source), source).toEqual([])
    }
  })
})

describe('comparing against the build', () => {
  it('names the field that differs', async () => {
    const generated = await studioDocument('openingHours/opening-hours.yml', 'lastSlot: 60\n')
    // A number that landed in a TEXT column comes back as a string.
    const comparison = compareDocuments(generated, { ...generated, lastSlot: '60' } as never)

    expect(comparison.matches).toBe(false)
    expect(comparison.fields).toEqual(['lastSlot'])
  })

  it('accepts extra fields the build adds, such as schema defaults', async () => {
    const generated = await studioDocument('openingHours/opening-hours.yml', 'hours: []\n')
    const comparison = compareDocuments(generated, { ...generated, navigation: false, path: '/' } as never)

    expect(comparison.matches).toBe(true)
  })
})

describe('reading the build dump', () => {
  const queries = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN); -- structure',
    'INSERT INTO _content_info VALUES (\'checksum_x\', false); -- meta',
    'CREATE TABLE IF NOT EXISTS _content_menuItems (id TEXT PRIMARY KEY, "image" TEXT, "order" INT, "title" VARCHAR); -- structure',
    'INSERT INTO _content_menuItems VALUES (\'menuItems/menu/latte.yml\', \'{"src":"/images/latte.webp","alt":"A latte"}\', 3, \'Anna\'\'s Latte\'); -- hash'
  ]

  it('returns one document per insert, skipping the checksum table', () => {
    expect(documentsFromQueries(queries)).toEqual([{
      id: 'menuItems/menu/latte.yml',
      image: { src: '/images/latte.webp', alt: 'A latte' },
      order: 3,
      title: 'Anna\'s Latte'
    }])
  })

  it('maps a document id back to its content file', () => {
    expect(contentPathFor('menuItems/menu/latte.yml')).toBe('content/menu/latte.yml')
    expect(contentPathFor('index/index.de.md')).toBe('content/index.de.md')
  })
})
