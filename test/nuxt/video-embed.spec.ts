import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import VideoEmbed from '~/components/content/VideoEmbed.vue'

type Props = InstanceType<typeof VideoEmbed>['$props']

// A markdown body can omit any prop, so the tests need to be able to as well.
const mount = (props: Partial<Props>) => mountSuspended(VideoEmbed, { props: props as Props })

describe('VideoEmbed', () => {
  describe('with a video from the media library', () => {
    const props = { url: '/videos/prana.mp4', title: 'A morning at the cafe' }

    // The page stays light for guests who never press play: no player element,
    // so no request for the file, until the button is pressed.
    it('shows a play button and no player until it is pressed', async () => {
      const wrapper = await mount(props)

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('iframe').exists()).toBe(false)
      expect(wrapper.find('figcaption').text()).toBe('A morning at the cafe')
    })

    it('plays the file inline, with controls, once pressed', async () => {
      const wrapper = await mount(props)

      await wrapper.find('button').trigger('click')

      const video = wrapper.find('video')

      expect(video.exists()).toBe(true)
      expect(video.attributes('controls')).toBeDefined()
      expect(video.attributes('playsinline')).toBeDefined()
      expect(video.find('source').attributes()).toMatchObject({ src: '/videos/prana.mp4', type: 'video/mp4' })
      expect(wrapper.find('iframe').exists()).toBe(false)
    })

    it('uses the poster as the still when there is one', async () => {
      const wrapper = await mount({ ...props, poster: { src: '/images/events/retreat.webp', alt: 'Breathwork circle' } })

      expect(wrapper.find('img').exists()).toBe(true)
    })
  })

  describe('with a YouTube link', () => {
    it('embeds the no-cookie player only after the button is pressed', async () => {
      const wrapper = await mount({ url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Tour' })

      expect(wrapper.find('iframe').exists()).toBe(false)

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('iframe').attributes('src')).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
      expect(wrapper.find('video').exists()).toBe(false)
    })
  })

  describe('with a value that is not a video', () => {
    it('falls back to the unavailable frame with a link, and no player', async () => {
      const wrapper = await mount({ url: 'https://example.com/prana.mp4', title: 'Tour' })

      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com/prana.mp4')
    })

    it('renders without a title or a url instead of breaking the page', async () => {
      const wrapper = await mount({})

      expect(wrapper.find('figcaption').exists()).toBe(false)
      expect(wrapper.find('video').exists()).toBe(false)
    })
  })
})
