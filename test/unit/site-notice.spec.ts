import { describe, expect, it } from 'vitest'
import {
  isNoticeActive,
  noticeRevision,
  noticeWindow,
  parseNoticeBound,
  type SiteNotice
} from '#shared/utils/notice'

const notice = (overrides: Partial<SiteNotice> = {}): SiteNotice => ({
  enabled: true,
  tone: 'warning',
  en: { title: 'Closed on Friday', message: 'Back on Saturday.' },
  de: { title: 'Freitag geschlossen', message: 'Samstag sind wir zurück.' },
  ...overrides
})

describe('site notice schedule', () => {
  it('reads what Studio writes, the ISO variant and a bare date, and nothing else', () => {
    expect(parseNoticeBound('2026-09-05 14:30:00', 'from')).toBeInstanceOf(Date)
    expect(parseNoticeBound('2026-09-05T14:30', 'from')).toBeInstanceOf(Date)
    expect(parseNoticeBound('2026-09-05', 'from')).toBeInstanceOf(Date)
    expect(parseNoticeBound('05.09.2026', 'from')).toBeNull()
    expect(parseNoticeBound('2026-09-05 14:30:00Z', 'from')).toBeNull()
  })

  it('reads schedule times as Berlin time, in summer and in winter', () => {
    expect(parseNoticeBound('2026-07-01 10:00:00', 'from')?.toISOString()).toBe('2026-07-01T08:00:00.000Z')
    expect(parseNoticeBound('2026-01-15 10:00:00', 'from')?.toISOString()).toBe('2026-01-15T09:00:00.000Z')
    expect(parseNoticeBound('2026-01-15T10:00', 'from')?.toISOString()).toBe('2026-01-15T09:00:00.000Z')
  })

  it('treats a bare date as the whole day', () => {
    expect(parseNoticeBound('2026-09-05', 'from')?.toISOString()).toBe('2026-09-04T22:00:00.000Z')
    expect(parseNoticeBound('2026-09-05', 'until')?.toISOString()).toBe('2026-09-05T22:00:00.000Z')
  })

  it('treats empty, missing and unparseable bounds as open', () => {
    expect(parseNoticeBound('', 'from')).toBeNull()
    expect(parseNoticeBound('   ', 'until')).toBeNull()
    expect(parseNoticeBound(undefined, 'from')).toBeNull()
    expect(parseNoticeBound('2026-13-45 99:00', 'from')).toBeNull()
    expect(noticeWindow(undefined)).toEqual({ from: null, until: null })
  })
})

describe('isNoticeActive', () => {
  const now = new Date('2026-09-05T10:00:00.000Z')

  it('is off while the switch is off, whatever the schedule says', () => {
    expect(isNoticeActive(notice({ enabled: false }), now)).toBe(false)
    expect(isNoticeActive(null, now)).toBe(false)
  })

  it('is on without a schedule', () => {
    expect(isNoticeActive(notice(), now)).toBe(true)
    expect(isNoticeActive(notice({ schedule: { from: '', until: '' } }), now)).toBe(true)
  })

  it('waits for the start and stops at the end', () => {
    const scheduled = notice({ schedule: { from: '2026-09-05 08:00:00', until: '2026-09-05 18:00:00' } })

    expect(isNoticeActive(scheduled, new Date('2026-09-05T05:59:00.000Z'))).toBe(false)
    expect(isNoticeActive(scheduled, new Date('2026-09-05T06:00:00.000Z'))).toBe(true)
    expect(isNoticeActive(scheduled, now)).toBe(true)
    expect(isNoticeActive(scheduled, new Date('2026-09-05T15:59:59.000Z'))).toBe(true)
    expect(isNoticeActive(scheduled, new Date('2026-09-05T16:00:00.000Z'))).toBe(false)
  })

  it('shows a date-only schedule for the whole of both days', () => {
    const scheduled = notice({ schedule: { from: '2026-09-05', until: '2026-09-06' } })

    expect(isNoticeActive(scheduled, new Date('2026-09-04T21:59:59.000Z'))).toBe(false)
    expect(isNoticeActive(scheduled, new Date('2026-09-04T22:00:00.000Z'))).toBe(true)
    expect(isNoticeActive(scheduled, new Date('2026-09-06T21:59:59.000Z'))).toBe(true)
    expect(isNoticeActive(scheduled, new Date('2026-09-06T22:00:00.000Z'))).toBe(false)
  })

  it('works with only one side set', () => {
    expect(isNoticeActive(notice({ schedule: { until: '2026-09-04' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { until: '2026-09-05' } }), now)).toBe(true)
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-06' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-01' } }), now)).toBe(true)
  })
})

describe('noticeRevision', () => {
  it('is stable for the same wording and changes when the notice is rewritten', () => {
    expect(noticeRevision(notice())).toBe(noticeRevision(notice()))
    expect(noticeRevision(notice())).not.toBe(noticeRevision(notice({ en: { title: 'Open again' } })))
    expect(noticeRevision(notice())).not.toBe(noticeRevision(notice({ schedule: { until: '2026-09-06' } })))
    expect(noticeRevision(notice())).toMatch(/^[0-9a-z]+$/)
  })
})
