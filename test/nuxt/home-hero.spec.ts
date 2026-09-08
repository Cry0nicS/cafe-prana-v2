import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeHero from '~/components/content/HomeHero.vue'

type NextEvent = {
  stem: string
  title: string
  description: string
  date: string
  time: string
  image: { src: string, alt: string }
  paid?: boolean
  price?: number
}

const { current } = vi.hoisted(() => ({
  current: { value: null as NextEvent | null }
}))

// The hero reads the next event through this composable; serve the fixture
// instead of hitting the content database.
mockNuxtImport('useNextEvent', () => async () => ({ data: ref(current.value) }))

const welcome = {
  headline: 'Newly opened!',
  title: 'Welcome to Café Prana',
  description: 'A gluten-free and vegan haven in the heart of Berlin',
  image: { src: '/images/hero.webp', alt: 'Café Prana table' }
}

const aperitivo = (overrides: Partial<NextEvent> = {}): NextEvent => ({
  stem: 'events/deep-talk-aperitivo',
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

const mountHero = async (event: NextEvent | null) => {
  current.value = event

  const wrapper = await mountSuspended(HomeHero, { props: welcome })

  mounted.push(wrapper)

  return wrapper
}

// `setLocale` would navigate to the prefixed route; the component only reads
// the locale ref, so switching that is enough and keeps the router out of it.
const setLocale = async (code: 'en' | 'de') => {
  const { $i18n } = useNuxtApp()

  $i18n.locale.value = code
  await nextTick()
}

describe('HomeHero', () => {
  afterEach(async () => {
    mounted.forEach(wrapper => wrapper.unmount())
    mounted = []
    await setLocale('en')
  })

  it('leads with the next event while keeping the welcome title as the heading', async () => {
    const wrapper = await mountHero(aperitivo())
    const text = wrapper.text()

    expect(wrapper.get('h1').text()).toBe('Welcome to Café Prana')
    expect(text).toContain('Our next event')
    expect(text).toContain('Deep Talk Aperitivo')
    expect(text).toContain('An evening of small plates and big questions.')
    expect(text).toContain('14 September 2026')
    expect(text).toContain('18:30')

    // The welcome hero's own copy stays out of the poster.
    expect(text).not.toContain('Newly opened!')
    expect(text).not.toContain('A gluten-free and vegan haven')
  })

  it('points the call to action at that event\'s page', async () => {
    const wrapper = await mountHero(aperitivo())
    const link = wrapper.get('a[href="/events/deep-talk-aperitivo"]')

    expect(link.text()).toContain('View event')
  })

  it('shows the event photo with its own alt text', async () => {
    const wrapper = await mountHero(aperitivo())
    const image = wrapper.get('img')

    expect(image.attributes('alt')).toBe('Aperitivo table at Café Prana')
    expect(image.attributes('src')).toContain('deep-talk-aperitivo-hero')
  })

  it('shows the price for a paid event and none for a free one', async () => {
    const paid = await mountHero(aperitivo())

    expect(paid.text()).toContain('€25')

    const free = await mountHero(aperitivo({ paid: false, price: undefined }))

    expect(free.text()).not.toContain('€')
  })

  it('renders the welcome hero when nothing is coming up', async () => {
    const wrapper = await mountHero(null)
    const text = wrapper.text()

    expect(wrapper.get('h1').text()).toBe('Welcome to Café Prana')
    expect(text).toContain('Newly opened!')
    expect(text).toContain('A gluten-free and vegan haven in the heart of Berlin')
    expect(text).toContain('Menu Highlights')
    expect(text).toContain('Get Directions')
    expect(text).not.toContain('Our next event')
    expect(wrapper.get('img').attributes('alt')).toBe('Café Prana table')
  })

  it('renders the German labels, date and link in the German locale', async () => {
    await setLocale('de')

    const wrapper = await mountHero(aperitivo())
    const text = wrapper.text()

    expect(text).toContain('Unser nächstes Event')
    expect(text).toContain('14. September 2026')
    expect(wrapper.get('a[href="/de/events/deep-talk-aperitivo"]').text()).toContain('Zum Event')
  })
})
