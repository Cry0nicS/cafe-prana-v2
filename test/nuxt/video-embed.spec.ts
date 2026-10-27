import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'
import VideoEmbed from '~/components/content/VideoEmbed.vue'

type Props = InstanceType<typeof VideoEmbed>['$props']

// A markdown body can omit any prop, so the tests need to be able to as well.
const mount = (props: Partial<Props>) => mountSuspended(VideoEmbed, { props: props as Props })

describe('VideoEmbed', () => {
  describe('with a video from the media library', () => {
    const props = { url: '/videos/frauenretreat.mp4', title: 'A morning at the cafe' }

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
      expect(video.find('source').attributes()).toMatchObject({ src: '/videos/frauenretreat.mp4', type: 'video/mp4' })
      expect(wrapper.find('iframe').exists()).toBe(false)
    })

    // Deleted, renamed, or a format this browser cannot decode: the guest gets
    // the same way out as for a link that did not parse, not a black box.
    it('falls back to the unavailable frame when the file will not load', async () => {
      const wrapper = await mount(props)

      await wrapper.find('button').trigger('click')
      await wrapper.find('source').trigger('error')

      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe('/videos/frauenretreat.mp4')
    })

    // A truncated file or an unsupported codec passes source selection and
    // fails later, as an error on the player itself.
    it('falls back to the unavailable frame when the player fails while playing', async () => {
      const wrapper = await mount(props)

      await wrapper.find('button').trigger('click')
      await wrapper.find('video').trigger('error')

      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe('/videos/frauenretreat.mp4')
    })

    it('goes back to the still when the url is changed', async () => {
      const wrapper = await mount(props)

      await wrapper.find('button').trigger('click')
      await wrapper.setProps({ url: 'https://youtu.be/dQw4w9WgXcQ' })

      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('iframe').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    // Studio's form writes the picked image as a plain path, so that is the
    // shape a poster arrives in.
    it('uses the poster path as the still when there is one', async () => {
      const wrapper = await mount({ ...props, poster: '/images/events/retreat.webp' })

      expect(wrapper.find('img').exists()).toBe(true)
      expect(wrapper.find('img').attributes('src')).toContain('retreat.webp')
    })

    // What Studio saves when the owner only picks a thumbnail: no title. The
    // frame must still be a working, labelled player.
    it('still plays, with a label, when the owner gave no title', async () => {
      const wrapper = await mount({ url: '/videos/frauenretreat.mp4', poster: '/images/events/retreat.webp' })

      expect(wrapper.find('figcaption').exists()).toBe(false)
      expect(wrapper.find('button').attributes('aria-label')).toBeTruthy()

      await wrapper.find('button').trigger('click')

      expect(wrapper.find('video').attributes('aria-label')).toBeTruthy()
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

  // The build fetches thumbnails for the youtube videos in the content and
  // lists the ones it got in runtime config. The block only ever points at one
  // of those, and at the site's own copy, so the page load never contacts
  // YouTube.
  describe('before pressing play on a YouTube link', () => {
    const youtube = { url: 'https://youtu.be/dQw4w9WgXcQ', title: 'Tour' }
    const stills = (ids: string[]) => {
      useRuntimeConfig().public.videoThumbnails = ids
    }

    afterEach(() => stills([]))

    it('shows the thumbnail the build saved, from this site', async () => {
      stills(['dQw4w9WgXcQ'])

      const wrapper = await mount(youtube)

      expect(wrapper.find('img').attributes('src')).toBe('/video-thumbnails/dQw4w9WgXcQ.jpg')
    })

    it('prefers a poster the owner picked', async () => {
      stills(['dQw4w9WgXcQ'])

      const wrapper = await mount({ ...youtube, poster: '/images/events/retreat.webp' })

      expect(wrapper.findAll('img')).toHaveLength(1)
      expect(wrapper.find('img').attributes('src')).not.toContain('video-thumbnails')
    })

    // No fetch succeeded: the drawn frame, not a request for a file that is
    // not there.
    it('draws its own frame when the build could not get one', async () => {
      stills(['someOtherId1'])

      const wrapper = await mount(youtube)

      expect(wrapper.find('img').exists()).toBe(false)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('never looks for a thumbnail of a file or a Vimeo link', async () => {
      stills(['dQw4w9WgXcQ'])

      expect((await mount({ url: '/videos/frauenretreat.mp4', title: 'Tour' })).find('img').exists()).toBe(false)
      expect((await mount({ url: 'https://vimeo.com/123456789', title: 'Tour' })).find('img').exists()).toBe(false)
    })
  })

  describe('with a value that is not a video', () => {
    it('falls back to the unavailable frame with a link, and no player', async () => {
      const wrapper = await mount({ url: 'https://example.com/frauenretreat.mp4', title: 'Tour' })

      expect(wrapper.find('button').exists()).toBe(false)
      expect(wrapper.find('video').exists()).toBe(false)
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com/frauenretreat.mp4')
    })

    it('renders without a title or a url instead of breaking the page', async () => {
      const wrapper = await mount({})

      expect(wrapper.find('figcaption').exists()).toBe(false)
      expect(wrapper.find('video').exists()).toBe(false)
    })
  })
})
