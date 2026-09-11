import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import MenuItemCard from '~/components/menu/ItemCard.vue'

// The card is the only place a menu item reaches a guest, so availability has
// to be legible here or it is not communicated at all.
const ITEM = {
  title: 'Banana Bread',
  description: 'Toasted and served with toppings of the day.',
  ingredients: 'Gluten-free homemade flour blend, banana, almonds',
  price: '10,5',
  image: {
    src: '/images/menu/banana-bread.webp',
    alt: 'Toasted banana bread with toppings of the day'
  }
}

const mountCard = (available?: boolean) =>
  mountSuspended(MenuItemCard, {
    props: {
      item: available === undefined ? ITEM : { ...ITEM, available },
      labels: {}
    }
  })

describe('menu item card', () => {
  it('says nothing about availability while the item is available', async () => {
    const wrapper = await mountCard(true)

    expect(wrapper.text()).not.toContain('Currently unavailable')
    expect(wrapper.get('article').attributes('data-availability')).toBeUndefined()
  })

  // A file that predates the field, or one a hand edit stripped it from, must
  // read as available rather than quietly taking the item off the menu.
  it('treats a missing flag as available', async () => {
    const wrapper = await mountCard()

    expect(wrapper.text()).not.toContain('Currently unavailable')
    expect(wrapper.get('article').attributes('data-availability')).toBeUndefined()
  })

  it('marks an unavailable item in words, not only in styling', async () => {
    const wrapper = await mountCard(false)

    // The words are the signal. Everything else on the card - the muted
    // surface, the drained image - only reinforces them, so a guest who
    // cannot see either still gets told.
    expect(wrapper.text()).toContain('Currently unavailable')
    expect(wrapper.get('article').attributes('data-availability')).toBe('unavailable')
  })

  it('still shows an unavailable item in full', async () => {
    const wrapper = await mountCard(false)
    const text = wrapper.text()

    // Q2/Q7: the item stays on the menu, in place and priced. Hiding it would
    // leave a regular wondering whether it is gone for good.
    expect(text).toContain(ITEM.title)
    expect(text).toContain(ITEM.description)
    expect(text).toContain('10,5€')
    expect(text).toContain(ITEM.ingredients)
  })
})
