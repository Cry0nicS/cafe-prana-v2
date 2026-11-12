import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContentRenderer } from '#components'
import { studioDocument } from '~~/scripts/studio-document.mjs'

// The homepage as the owner writes it: plain markdown inside each section,
// driven through the same parse Studio uses and the renderer the page uses.

type NextEvent = {
  // Only the ordering-prefix test sets it: the links must ignore it.
  stem?: string
  path: string
  title: string
  description?: string
  date: string
  time: string
  image: { src: string, alt: string } | null
  paid?: boolean
  price?: number
}

const { current } = vi.hoisted(() => ({
  current: { value: null as NextEvent | null }
}))

// Serve fixtures instead of hitting the content database.
mockNuxtImport('useNextEvent', () => async () => ({ data: ref(current.value) }))
mockNuxtImport('useOpeningHours', () => async () => ({
  data: ref({ hours: [{ day: 'monday', closed: true }, { day: 'tuesday', closed: false, opens: '09:00', closes: '15:00' }] })
}))

const aperitivo = (overrides: Partial<NextEvent> = {}): NextEvent => ({
  path: '/events/deep-talk-aperitivo',
  title: 'Deep Talk Aperitivo',
  description: 'An evening of small plates and big questions.',
  date: '2026-09-14',
  time: '18:30',
  image: { src: '/images/events/posts/deep-talk-aperitivo-hero.webp', alt: 'Aperitivo table at Café Prana' },
  paid: true,
  price: 25,
  ...overrides
})

let mounted: VueWrapper[] = []

const render = async (markdown: string, event: NextEvent | null = null) => {
  current.value = event

  const document = await studioDocument('indexEn/index.md', markdown)
  const wrapper = await mountSuspended(ContentRenderer, { props: { value: document } })

  // The blocks resolve through `defineAsyncComponent`, so the first render is
  // the shell and the second is the component.
  await flushPromises()
  mounted.push(wrapper)

  return wrapper
}

const hero = [
  '::home-hero',
  'One year of Prana!',
  '',
  '# Order anything.',
  '',
  'A small café in Prenzlauer Berg.',
  '',
  '![The front room](/images/hero.webp)',
  '::'
].join('\n')

afterEach(() => {
  mounted.forEach(wrapper => wrapper.unmount())
  mounted = []
})

describe('the hero', () => {
  it('shows the owner\'s markdown as the page title, with the buttons from code', async () => {
    const wrapper = await render(hero)

    expect(wrapper.get('h1').text()).toBe('Order anything.')
    expect(wrapper.text()).toContain('One year of Prana!')
    expect(wrapper.text()).toContain('A small café in Prenzlauer Berg.')
    expect(wrapper.get('a[href="/reservations"]').text()).toBe('Reserve a table')
    expect(wrapper.get('a[href="/menu"]').text()).toBe('See the menu')
  })

  // The section pulls the picture out of the text so it can frame it, and has
  // to carry the alt text the owner typed across with it.
  it('frames the picture, with its alt text', async () => {
    const wrapper = await render(hero)
    const image = wrapper.get('img')

    expect(image.attributes('alt')).toBe('The front room')
    expect(image.attributes('src')).toContain('hero')
  })

  // The line of news sits above the title in the markdown, and the section
  // has to tell the two apart: only the `#` line is the page's heading.
  it('keeps the line of news out of the title', async () => {
    const wrapper = await render(hero)

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.get('h1').text()).not.toContain('One year of Prana!')
  })

  it('adds a card for the next event, linked to its page', async () => {
    const wrapper = await render(hero, aperitivo())
    const link = wrapper.get('a[href="/events/deep-talk-aperitivo"]')

    expect(link.text()).toContain('Our next event')
    expect(link.text()).toContain('Deep Talk Aperitivo')
    expect(link.text()).toContain('14 September 2026')
    // The owner's own line of news stays; the event does not replace it.
    expect(wrapper.text()).toContain('One year of Prana!')
  })

  // Beside an event the poster takes the photo's place. The photo stays in the
  // page, hidden: `ipxStatic` only bakes what is rendered at build time, and
  // it has to be there the day the event has passed.
  it('shows the event\'s poster and keeps the photo in the page, hidden', async () => {
    const wrapper = await render(hero, aperitivo())
    const poster = wrapper.get('a[href="/events/deep-talk-aperitivo"] img')
    const photo = wrapper.get('img[alt="The front room"]')

    expect(poster.attributes('alt')).toBe('Aperitivo table at Café Prana')
    expect(photo.classes()).toContain('hidden')
    expect(photo.attributes('loading')).toBe('lazy')
  })

  it('shows the photo when no event is coming up', async () => {
    const wrapper = await render(hero)

    expect(wrapper.get('img[alt="The front room"]').classes()).not.toContain('hidden')
  })

  // Studio names files with an ordering prefix (`1.foo.md`). Nuxt Content
  // strips it from `path` but not from `stem`, and a link built from the stem
  // pointed at a page that does not exist - the prerender failed on its 404.
  it('links to the content path, not the stem', async () => {
    const wrapper = await render(hero, aperitivo({ stem: 'events/1.deep-talk-aperitivo' }))

    expect(wrapper.find('a[href="/events/deep-talk-aperitivo"]').exists()).toBe(true)
  })

  it('says nothing about events when none is coming up', async () => {
    const wrapper = await render(hero)

    expect(wrapper.text()).not.toContain('Our next event')
  })
})

describe('the events section', () => {
  const events = '::events-intro\n## Gatherings\n\nSome days Prana is one long table.\n::'

  it('shows the next event with its poster, what it is, date, time and price', async () => {
    const wrapper = await render(events, aperitivo())
    const card = wrapper.get('article')

    expect(card.text()).toContain('Our next event')
    expect(card.text()).toContain('Deep Talk Aperitivo')
    expect(card.text()).toContain('An evening of small plates and big questions.')
    expect(card.text()).toContain('14 September 2026')
    expect(card.text()).toContain('18:30')
    expect(card.text()).toContain('€25')
    expect(card.get('a[href="/events/deep-talk-aperitivo"]').text()).toBe('View event')
    // The last image: the first is the blurred backdrop, which has no alt.
    expect(card.findAll('img').at(-1)!.attributes('alt')).toBe('Aperitivo table at Café Prana')
  })

  it('lists each kind of gathering from its heading and the line under it', async () => {
    const wrapper = await render('::events-intro\n## Gatherings\n\nIntro.\n\n### Community meals\n\nBreakfast together.\n\n### Your own event\n\nBook the room.\n::')

    expect(wrapper.findAll('h3').map(heading => heading.text())).toEqual(['Community meals', 'Your own event'])
    expect(wrapper.text()).toContain('Book the room.')
  })

  it('shows no price for a free event', async () => {
    const wrapper = await render(events, aperitivo({ paid: false, price: undefined }))

    expect(wrapper.text()).not.toContain('€')
  })

  it('keeps its text and buttons when nothing is coming up', async () => {
    const wrapper = await render(events)

    expect(wrapper.get('h2').text()).toBe('Gatherings')
    expect(wrapper.text()).not.toContain('Our next event')
    expect(wrapper.get('a[href="/events"]').text()).toBe('See all events')
  })
})

describe('sections built from plain markdown', () => {
  it('puts every gallery picture in the grid, in the order written', async () => {
    const wrapper = await render('::gallery\n## A look inside\n\n![One](/images/a.webp)\n\n![Two](/images/b.webp)\n![Three](/images/c.webp)\n::')

    expect(wrapper.findAll('img').map(image => image.attributes('alt'))).toEqual(['One', 'Two', 'Three'])
    expect(wrapper.get('h2').text()).toBe('A look inside')
  })

  it('renders each dish from its own picture, name and line', async () => {
    const wrapper = await render([
      '::menu-highlights',
      '## Favourites',
      '',
      '  :::menu-highlight',
      '  ![Waffle](/images/waffle.webp)',
      '',
      '  ### Savoury waffle',
      '',
      '  With toppings of the day.',
      '  :::',
      '::'
    ].join('\n'))
    const dish = wrapper.get('article')

    expect(dish.get('img').attributes('alt')).toBe('Waffle')
    expect(dish.get('h3').text()).toBe('Savoury waffle')
    expect(dish.text()).toContain('With toppings of the day.')
  })

  it('renders a feature with its icon, title and text', async () => {
    const wrapper = await render('::feature-grid\n## Promises\n\n  :::feature{icon="i-lucide-leaf"}\n  ### Gluten-free\n\n  All of it.\n  :::\n::')

    expect(wrapper.get('h3').text()).toBe('Gluten-free')
    expect(wrapper.text()).toContain('All of it.')
  })

  it('renders each question as a row that opens onto its answer', async () => {
    const wrapper = await render('::faq\n## Good to know\n\n### Are pets allowed?\n\nNot indoors.\n\n### Take-away?\n\nYes.\n::')
    const rows = wrapper.findAll('details')

    expect(rows).toHaveLength(2)
    expect(rows[0]!.get('summary').text()).toBe('Are pets allowed?')
    expect(rows[0]!.text()).toContain('Not indoors.')
    expect(rows[1]!.text()).not.toContain('Not indoors.')
  })
})

// The two files the owner edits. A section that stops rendering, a second
// page title or a picture without alt text would all ship as a green build.
describe.each(['en', 'de'])('content/%s/index.md', (locale) => {
  it('renders every section, one page title, and alt text on every picture', async () => {
    const path = resolve(process.cwd(), 'content', locale, 'index.md')
    const wrapper = await render(await readFile(path, 'utf8'), aperitivo())

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findAll('h2').length).toBeGreaterThanOrEqual(7)
    expect(wrapper.find('#directions').exists()).toBe(true)

    // The event poster's blurred backdrop is decoration and says so.
    const images = wrapper.findAll('img').filter(image => image.attributes('aria-hidden') !== 'true')

    expect(images.length).toBeGreaterThan(10)
    expect(images.filter(image => !image.attributes('alt'))).toEqual([])
  })
})
