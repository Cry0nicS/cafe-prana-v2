import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import EventCard from '~/components/events/EventCard.vue'
import EventFeature from '~/components/events/EventFeature.vue'

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
})

describe('an event with a photo', () => {
  it('shows it with the alt text the owner typed', async () => {
    const wrapper = await mountSuspended(EventCard, { props: { event: published } })

    const image = wrapper.get('img')

    expect(image.attributes('alt')).toBe('A table at Prana')
    expect(image.attributes('src')).toContain('hero')
    expect(wrapper.find('[data-photo="pending"]').exists()).toBe(false)
  })
})
