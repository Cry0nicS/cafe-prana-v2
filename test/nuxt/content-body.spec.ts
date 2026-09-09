import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { ContentRenderer } from '#components'
import { studioDocument } from '~~/scripts/studio-document.mjs'

// What the owner writes, driven through the same parse Studio uses and the same
// renderer the event page uses.
//
// Nothing here asserts a class name. Nuxt UI's prose themes emit long utility
// strings that move between minor versions, and a test that pins them fails on
// an upgrade without anything being broken. What is asserted is the element the
// markdown produces, the text inside it, and - where a component has a variant -
// the `data-*` attribute it publishes for the purpose.
//
// The suite runs in happy-dom with no stylesheet, so appearance itself is not
// observable here; it is checked in the browser instead.
const render = async (markdown: string) => {
  const document = await studioDocument('eventsEn/events/probe.md', `---\ntitle: Probe\n---\n\n${markdown}\n`)

  const wrapper = await mountSuspended(ContentRenderer, {
    props: { value: document },
    attrs: { class: 'cafe-prose' }
  })

  // The project's own blocks resolve through `defineAsyncComponent`, so the
  // first render is the shell and the second is the component.
  await flushPromises()

  mounted.push(wrapper)

  return wrapper
}

let mounted: VueWrapper[] = []

afterEach(() => {
  mounted.forEach(wrapper => wrapper.unmount())
  mounted = []
})

describe('markdown the owner can write', () => {
  it('renders a quote as a blockquote', async () => {
    const wrapper = await render('> The best gluten-free waffle in Prenzlauer Berg.')

    expect(wrapper.get('blockquote').text()).toContain('The best gluten-free waffle in Prenzlauer Berg.')
  })

  it('renders a table with its header and cells in order', async () => {
    const wrapper = await render([
      '| Course | Price |',
      '|--------|-------|',
      '| Waffle | €9    |',
      '| Chai   | €4.50 |'
    ].join('\n'))

    expect(wrapper.findAll('th').map(cell => cell.text())).toEqual(['Course', 'Price'])
    expect(wrapper.findAll('td').map(cell => cell.text())).toEqual(['Waffle', '€9', 'Chai', '€4.50'])
  })

  // A wide table has to scroll inside its own frame rather than pushing the page
  // sideways on a phone. Only the wrapper element is checkable here - that it
  // actually scrolls is a browser check.
  it('wraps a table in its own frame', async () => {
    const wrapper = await render('| a | b |\n|---|---|\n| 1 | 2 |')

    expect(wrapper.get('table').element.parentElement).not.toBeNull()
  })

  it('renders a section break', async () => {
    const wrapper = await render('One.\n\n---\n\nTwo.')

    expect(wrapper.find('hr').exists()).toBe(true)
  })

  it('renders a struck-through price', async () => {
    const wrapper = await render('~~€30~~ €25')

    expect(wrapper.get('del, s').text()).toBe('€30')
  })

  it('renders an image with the alt text the owner typed', async () => {
    const wrapper = await render('![Waffle with seasonal toppings](/images/menu/herzhafte-waffel.webp)')

    expect(wrapper.get('img').attributes('alt')).toBe('Waffle with seasonal toppings')
  })

  it('renders headings at the level written, and never an h1', async () => {
    const wrapper = await render('## What to expect\n\nSomething.\n\n### Who this is for\n\nYou.')

    expect(wrapper.get('h2').text()).toBe('What to expect')
    expect(wrapper.get('h3').text()).toBe('Who this is for')
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  // The page template already renders the event title as the h1; the editor no
  // longer offers Heading 1 for exactly this reason.
  it('leaves no anchor links hanging off the headings', async () => {
    const wrapper = await render('## What to expect\n\nSomething.')

    expect(wrapper.get('h2').find('a').exists()).toBe(false)
  })
})

describe('the callout', () => {
  it('renders its icon, title and body', async () => {
    const wrapper = await render('::callout{icon="i-lucide-info" title="Good to know"}\nEverything is gluten-free.\n::')

    expect(wrapper.text()).toContain('Good to know')
    expect(wrapper.text()).toContain('Everything is gluten-free.')
  })

  // `data-tone` is the component's own contract for which box this is, and the
  // only thing about the tone that survives a Nuxt UI upgrade unchanged.
  it.each(['neutral', 'positive', 'caution'])('publishes the %s tone', async (color) => {
    const wrapper = await render(`::callout{color="${color}"}\nA note.\n::`)

    expect(wrapper.text()).toContain('A note.')
    expect(wrapper.get('[data-tone]').attributes('data-tone')).toBe(color)
  })

  it('falls back to the neutral tone when the owner picks none', async () => {
    const wrapper = await render('::callout\nA note.\n::')

    expect(wrapper.get('[data-tone]').attributes('data-tone')).toBe('neutral')
  })
})

describe('the video block', () => {
  const youtube = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

  it('shows the title and a play control, and contacts nobody', async () => {
    const wrapper = await render(`::video{url="${youtube}" title="An evening at Prana"}\n::`)

    expect(wrapper.get('figcaption').text()).toBe('An evening at Prana')
    expect(wrapper.get('button').attributes('aria-label')).toContain('An evening at Prana')
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  it('loads the embed only once someone presses play', async () => {
    const wrapper = await render(`::video{url="${youtube}" title="An evening at Prana"}\n::`)

    await wrapper.get('button').trigger('click')

    const frame = wrapper.get('iframe')

    expect(frame.attributes('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(frame.attributes('title')).toBe('An evening at Prana')
  })

  it('shows the owner\'s still before play', async () => {
    const wrapper = await render(
      `::video\n---\nurl: ${youtube}\ntitle: An evening at Prana\nposter:\n  src: /images/hero.webp\n  alt: A table at Prana\n---\n::`
    )

    expect(wrapper.get('img').attributes('alt')).toBe('A table at Prana')
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  // A mistyped link must not put a broken frame on a published page.
  it('falls back to a plain link when the url is not a video', async () => {
    const wrapper = await render('::video{url="https://cafeprana.de/events" title="An evening at Prana"}\n::')

    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a[href="https://cafeprana.de/events"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('This video cannot be shown here.')
  })
})
