import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import EventCard from '~/components/events/EventCard.vue'
import EventFeature from '~/components/events/EventFeature.vue'
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
  it('still renders its card', async () => {
    const wrapper = await mountSuspended(EventCard, { props: { event: draft } })

    expect(wrapper.text()).toContain('My event')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('still renders as a feature', async () => {
    const wrapper = await mountSuspended(EventFeature, { props: { event: draft } })

    expect(wrapper.text()).toContain('My event')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  // The frame has to stay, or one missing photo leaves a ragged hole in the grid
  // next to the events that do have one.
  it('keeps the frame so the grid stays even', async () => {
    const wrapper = await mountSuspended(EventCard, { props: { event: draft } })

    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(true)
  })

  // The homepage poster is the opposite case: the photo is a whole grid column,
  // so leaving the wrapper behind reserves an empty 42% of the card with a 24rem
  // floor under it. The card has to collapse to one column instead.
  it('collapses the homepage poster to a single column', async () => {
    const wrapper = await mountSuspended(NextEventHero, {
      props: { title: 'Welcome to Cafe Prana', event: draft }
    })

    const card = wrapper.get('article')

    expect(wrapper.text()).toContain('My event')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(card.classes()).toContain('lg:grid-cols-1')
    expect(card.classes().join(' ')).not.toContain('42%')
    // `col-span-2` in a one-column grid would conjure a second column back.
    expect(wrapper.get('footer').classes()).not.toContain('lg:col-span-2')
  })
})

describe('an event with a photo', () => {
  it('shows it with the alt text the owner typed', async () => {
    const wrapper = await mountSuspended(EventCard, { props: { event: published } })

    const image = wrapper.get('img')

    expect(image.attributes('alt')).toBe('A table at Prana')
    expect(image.attributes('src')).toContain('hero')
    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(false)
  })

  it('gives the homepage poster its two-column card back', async () => {
    const wrapper = await mountSuspended(NextEventHero, {
      props: { title: 'Welcome to Cafe Prana', event: published }
    })

    expect(wrapper.get('img').attributes('alt')).toBe('A table at Prana')
    expect(wrapper.get('article').classes().join(' ')).toContain('42%')
    expect(wrapper.get('footer').classes()).toContain('lg:col-span-2')
  })
})
