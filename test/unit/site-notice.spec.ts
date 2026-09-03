import { describe, expect, it } from 'vitest'
import {
  NOTICE_STORAGE_PREFIX,
  isNoticeActive,
  nextNoticeChange,
  noticeRevision,
  noticeStorageKey,
  parseNoticeBound,
  type SiteNotice
} from '#shared/utils/notice'

const notice = (overrides: Partial<SiteNotice> = {}): SiteNotice => ({
  tone: 'warning',
  schedule: { until: '2026-12-31' },
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

  it('reads an end at midnight, the picker default, as the end of that day', () => {
    expect(parseNoticeBound('2026-09-25 00:00:00', 'until')?.toISOString()).toBe('2026-09-25T22:00:00.000Z')
    expect(parseNoticeBound('2026-09-25T00:00', 'until')?.toISOString()).toBe('2026-09-25T22:00:00.000Z')
    expect(parseNoticeBound('2026-09-25 00:00:00', 'from')?.toISOString()).toBe('2026-09-24T22:00:00.000Z')
    expect(parseNoticeBound('2026-09-25 00:15:00', 'until')?.toISOString()).toBe('2026-09-24T22:15:00.000Z')
  })

  it('treats empty, missing and unparseable bounds as open', () => {
    expect(parseNoticeBound('', 'from')).toBeNull()
    expect(parseNoticeBound('   ', 'until')).toBeNull()
    expect(parseNoticeBound(undefined, 'from')).toBeNull()
    expect(parseNoticeBound('2026-13-45 99:00', 'from')).toBeNull()
  })
})

describe('isNoticeActive', () => {
  const now = new Date('2026-09-05T10:00:00.000Z')

  it('is off without an end date, whatever else is set', () => {
    expect(isNoticeActive(null, now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: undefined }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { from: '', until: '' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-01', until: '' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { until: 'next friday' } }), now)).toBe(false)
  })

  it('is on from now until the end date when no start is set', () => {
    expect(isNoticeActive(notice(), now)).toBe(true)
    expect(isNoticeActive(notice({ schedule: { from: '', until: '2026-09-05 18:00:00' } }), now)).toBe(true)
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

  it('never shows when the start is after the end', () => {
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-06', until: '2026-09-05' } }), now)).toBe(false)
  })

  it('respects a start date and an end date that has passed', () => {
    expect(isNoticeActive(notice({ schedule: { until: '2026-09-04' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { until: '2026-09-05' } }), now)).toBe(true)
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-06', until: '2026-09-07' } }), now)).toBe(false)
    expect(isNoticeActive(notice({ schedule: { from: '2026-09-01', until: '2026-09-07' } }), now)).toBe(true)
  })
})

describe('nextNoticeChange', () => {
  const now = new Date('2026-09-05T10:00:00.000Z')

  it('points at the start while waiting, then at the end while showing', () => {
    const scheduled = notice({ schedule: { from: '2026-09-05 14:00:00', until: '2026-09-05 18:00:00' } })

    expect(nextNoticeChange(scheduled, now)?.toISOString()).toBe('2026-09-05T12:00:00.000Z')
    expect(nextNoticeChange(scheduled, new Date('2026-09-05T13:00:00.000Z'))?.toISOString()).toBe('2026-09-05T16:00:00.000Z')
  })

  it('has nothing to wait for once the end has passed or without an end', () => {
    expect(nextNoticeChange(notice({ schedule: { until: '2026-09-04' } }), now)).toBeNull()
    expect(nextNoticeChange(notice({ schedule: { until: '' } }), now)).toBeNull()
    expect(nextNoticeChange(null, now)).toBeNull()
  })
})

describe('noticeRevision', () => {
  it('is stable for the same wording and changes when the notice is rewritten', () => {
    expect(noticeRevision(notice())).toBe(noticeRevision(notice()))
    expect(noticeRevision(notice())).not.toBe(noticeRevision(notice({ en: { title: 'Open again' } })))
    expect(noticeRevision(notice())).not.toBe(noticeRevision(notice({ schedule: { until: '2026-09-06' } })))
    expect(noticeRevision(notice())).toMatch(/^[0-9a-z]+$/)
  })

  it('keys the dismissed flag by prefix and fingerprint', () => {
    expect(noticeStorageKey(notice())).toBe(`${NOTICE_STORAGE_PREFIX}${noticeRevision(notice())}`)
  })
})
