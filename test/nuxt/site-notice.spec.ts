import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SiteNotice from '~/components/SiteNotice.vue'
import { NOTICE_STORAGE_PREFIX, noticeStorageKey, type SiteNotice as Notice } from '#shared/utils/notice'

const { current, route } = vi.hoisted(() => ({
  current: { value: null as Notice | null },
  route: { path: '/' }
}))

// The component reads the notice through this composable; serve the fixture
// instead of hitting the content database.
mockNuxtImport('useSiteNotice', () => async () => ({ data: ref(current.value) }))
// The component only watches the path, so a plain reactive stand-in is enough
// to simulate navigation without driving the real router.
mockNuxtImport('useRoute', () => () => reactive(route))

// Mutations must go through the proxy for the component's watcher to fire.
const routeState = reactive(route)

const notice = (overrides: Partial<Notice> = {}): Notice => ({
  tone: 'warning',
  schedule: { from: '', until: '2026-09-05 18:00:00' },
  en: { title: 'Closed on Friday', message: 'Back on Saturday.' },
  de: { title: 'Freitag geschlossen', message: 'Samstag sind wir zurück.' },
  ...overrides
})

const dialog = () => document.body.querySelector('[role="dialog"]')

const dismissButton = () =>
  Array.from(dialog()?.querySelectorAll('button') ?? []).find(button => button.textContent?.trim() === 'Got it')

let mounted: VueWrapper[] = []

const mountNotice = async (value: Notice | null) => {
  current.value = value

  const wrapper = await mountSuspended(SiteNotice)

  mounted.push(wrapper)
  await nextTick()

  return wrapper
}

describe('SiteNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date('2026-09-05T10:00:00.000Z'))
    routeState.path = '/'
    window.localStorage.clear()
  })

  afterEach(() => {
    mounted.forEach(wrapper => wrapper.unmount())
    mounted = []
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('shows the card inside the schedule', async () => {
    await mountNotice(notice())

    expect(dialog()).not.toBeNull()
    expect(dialog()?.textContent).toContain('Closed on Friday')
    expect(dialog()?.textContent).toContain('Back on Saturday.')
  })

  it('shows nothing without an end date', async () => {
    await mountNotice(notice({ schedule: { until: '' } }))

    expect(dialog()).toBeNull()
  })

  it('stays hidden for a visitor who dismissed this wording, and forgets older dismissals', async () => {
    const stale = `${NOTICE_STORAGE_PREFIX}old`

    window.localStorage.setItem(stale, '2026-01-01T00:00:00.000Z')
    window.localStorage.setItem(noticeStorageKey(notice()), '2026-09-04T00:00:00.000Z')

    await mountNotice(notice())

    expect(dialog()).toBeNull()
    expect(window.localStorage.getItem(stale)).toBeNull()
    expect(window.localStorage.getItem(noticeStorageKey(notice()))).not.toBeNull()
  })

  it('remembers a dismissal under the key listed on the cookie page', async () => {
    await mountNotice(notice())

    dismissButton()?.click()
    await nextTick()

    expect(dialog()).toBeNull()
    expect(window.localStorage.getItem(noticeStorageKey(notice()))).not.toBeNull()
  })

  it('appears on navigation once the start has been reached', async () => {
    await mountNotice(notice({ schedule: { from: '2026-09-05 13:00:00', until: '2026-09-05 14:00:00' } }))

    expect(dialog()).toBeNull()

    // Past the start, but the timer has not fired yet: the route change alone
    // must bring the card up.
    vi.setSystemTime(new Date('2026-09-05T11:30:00.000Z'))
    routeState.path = '/menu'
    await nextTick()

    expect(dialog()).not.toBeNull()
  })

  it('appears when the start arrives and disappears when the end passes, without a reload', async () => {
    await mountNotice(notice({ schedule: { from: '2026-09-05 13:00:00', until: '2026-09-05 14:00:00' } }))

    expect(dialog()).toBeNull()

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 + 1000)
    await nextTick()

    expect(dialog()).not.toBeNull()

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 + 1000)
    await nextTick()

    expect(dialog()).toBeNull()
  })
})
