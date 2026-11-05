import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import EventPoster from '~/components/events/EventPoster.vue'
import EventRow from '~/components/events/EventRow.vue'
import NextEventHero from '~/components/events/NextEventHero.vue'

// An event the owner has started but not finished. `image` is required by the
// events schema, but @nuxt/content stores a missing one as `null` rather than
// rejecting the document, so the very first save from Studio - title typed,
// photo not chosen yet - reaches these components with no image. Dereferencing
// it took down the whole event page, and the listing with it.
const draft = {
  path: '/events/my-event',
  stem: 'events/my-event',
  title: 'My event',
  description: '',
  date: '2030-10-09',
  time: '',
  image: null as unknown as { src: string, alt: string },
  paid: false,
  reservation: 'recommended' as const
}

const published = {
  ...draft,
  description: 'An evening of small plates and big questions.',
  time: '18:30',
  image: { src: '/images/hero.webp', alt: 'A table at Prana' }
}

describe('an event with no photo yet', () => {
  it('still renders its row in the events list', async () => {
    const wrapper = await mountSuspended(EventRow, { props: { event: draft } })

    expect(wrapper.text()).toContain('My event')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(true)
  })

  // The frame has to stay, or one missing photo leaves a ragged hole in the list
  // next to the events that do have one.
  it('keeps the frame so the list stays even', async () => {
    const wrapper = await mountSuspended(EventPoster, { props: { src: null } })

    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(true)
  })

  // On the homepage the poster is a column of its own, so leaving its wrapper
  // behind would reserve an empty half of the hero. It has to collapse to one
  // column instead.
  it('collapses the homepage poster to a single column', async () => {
    const wrapper = await mountSuspended(NextEventHero, {
      props: { title: 'Welcome to Cafe Prana', event: draft }
    })

    const hero = wrapper.get('section')

    expect(wrapper.text()).toContain('My event')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(hero.classes()).toContain('xl:grid-cols-1')
  })
})

describe('an event with a photo', () => {
  it('shows it with the alt text the owner typed', async () => {
    const wrapper = await mountSuspended(EventRow, { props: { event: published } })

    // The second image: the first is the blurred backdrop, which has no alt.
    const image = wrapper.findAll('img')[1]!

    expect(image.attributes('alt')).toBe('A table at Prana')
    expect(image.attributes('src')).toContain('hero')
    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(false)
  })

  // Posters carry printed text, so the list shows them whole over a blurred
  // copy of themselves rather than cropping them to the frame.
  it('shows the whole image over a blurred, unlabelled copy of it', async () => {
    const wrapper = await mountSuspended(EventPoster, {
      props: { src: '/images/hero.webp', alt: 'A table at Prana' }
    })

    const [backdrop, image] = wrapper.findAll('img')

    expect(backdrop!.attributes('alt')).toBe('')
    expect(backdrop!.attributes('aria-hidden')).toBe('true')
    expect(image!.attributes('alt')).toBe('A table at Prana')
    expect(image!.classes()).toContain('object-contain')
  })

  it('gives the homepage poster its column back, uncropped', async () => {
    const wrapper = await mountSuspended(NextEventHero, {
      props: { title: 'Welcome to Cafe Prana', event: published }
    })

    const image = wrapper.get('img')

    expect(image.attributes('alt')).toBe('A table at Prana')
    // Posters carry their own printed title and date: shown whole, at their own
    // shape, never cropped into a frame.
    expect(image.classes()).toContain('h-auto')
    expect(image.classes()).not.toContain('object-cover')
    expect(wrapper.get('section').classes().join(' ')).not.toContain('xl:grid-cols-1')
  })
})
