import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SiteNotice from '~/components/SiteNotice.vue'
import { NOTICE_STORAGE_PREFIX, noticeStorageKey, type SiteNotice as Notice } from '#shared/utils/notice'

const { current } = vi.hoisted(() => ({ current: { value: null as Notice | null } }))

// The component reads the notice through this composable; serve the fixture
// instead of hitting the content database.
mockNuxtImport('useSiteNotice', () => async () => ({ data: ref(current.value) }))

const notice = (overrides: Partial<Notice> = {}): Notice => ({
  tone: 'warning',
  schedule: { from: '', until: '2026-09-05 18:00:00' },
  en: { title: 'Closed on Friday', message: 'Back on Saturday.' },
  de: { title: 'Freitag geschlossen', message: 'Samstag sind wir zurück.' },
  ...overrides
})

const dialog = () => document.body.querySelector('[role="dialog"]')

const mountNotice = async (value: Notice | null) => {
  current.value = value

  const wrapper = await mountSuspended(SiteNotice)

  await nextTick()

  return wrapper
}

describe('SiteNotice', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date('2026-09-05T10:00:00.000Z'))
    window.localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('shows the card inside the schedule and hides it without an end date', async () => {
    const wrapper = await mountNotice(notice())

    expect(dialog()).not.toBeNull()
    expect(dialog()?.textContent).toContain('Closed on Friday')
    expect(dialog()?.textContent).toContain('Back on Saturday.')
    wrapper.unmount()

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
    const wrapper = await mountNotice(notice())

    dialog()?.querySelector<HTMLButtonElement>('button:not([aria-label])')?.click()
    await nextTick()

    expect(dialog()).toBeNull()
    expect(window.localStorage.getItem(noticeStorageKey(notice()))).not.toBeNull()
    wrapper.unmount()
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
