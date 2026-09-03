import { parseDate, parseDateTime, toCalendarDateTime, toZoned } from '@internationalized/date'

// The site notice: a short card the owner schedules for spontaneous news, like
// closing for a day at short notice. Edited in Studio as `content/notice.yml`.

export const NOTICE_TONES = ['info', 'warning', 'urgent'] as const

export type NoticeTone = typeof NOTICE_TONES[number]

type NoticeText = {
  title: string
  message?: string
}

type NoticeSchedule = {
  // Local Berlin wall-clock times, `YYYY-MM-DD HH:mm[:ss]` (Studio's format)
  // or `YYYY-MM-DDTHH:mm[:ss]`. An empty `from` means "starting now". `until`
  // is what switches the notice on: while it is empty, nothing is shown.
  // Studio's picker defaults the time to 00:00, so an `until` at midnight
  // (or a bare `YYYY-MM-DD`) is read as the end of that day, not its start.
  from?: string
  until?: string
}

export type SiteNotice = {
  tone: NoticeTone
  schedule?: NoticeSchedule
  en: NoticeText
  de: NoticeText
}

// Every schedule time the owner enters is cafe time, wherever the visitor or
// the build machine happens to be.
const TIME_ZONE = 'Europe/Berlin'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

// The instant a schedule bound refers to, or null when it is unset or
// unparseable. An unparseable value counts as unset: for `from` that means
// "starting now", for `until` it means the notice stays off.
// Exported for the tests; the app goes through `noticeWindow`.
export const parseNoticeBound = (value: string | undefined, edge: 'from' | 'until'): Date | null => {
  const trimmed = value?.trim()

  if (!trimmed) {
    return null
  }

  try {
    const dateTime = DATE_ONLY.test(trimmed)
      ? toCalendarDateTime(parseDate(trimmed))
      : parseDateTime(trimmed.replace(' ', 'T'))
    const zoned = toZoned(dateTime, TIME_ZONE)
    const isMidnight = dateTime.hour === 0 && dateTime.minute === 0 && dateTime.second === 0

    return edge === 'until' && isMidnight
      ? zoned.add({ days: 1 }).toDate()
      : zoned.toDate()
  } catch {
    return null
  }
}

type NoticeWindow = {
  // Epoch milliseconds, or null for an open side.
  from: number | null
  until: number | null
}

export const noticeWindow = (schedule: NoticeSchedule | undefined): NoticeWindow => ({
  from: parseNoticeBound(schedule?.from, 'from')?.getTime() ?? null,
  // `until` is exclusive: a whole-day `until` resolves to the start of the
  // following day.
  until: parseNoticeBound(schedule?.until, 'until')?.getTime() ?? null
})

// Whether the notice should be showing at `now`. The end date is the switch:
// without one there is no window, so nothing is shown.
export const isNoticeActive = (notice: SiteNotice | null | undefined, now: Date) => {
  const window = noticeWindow(notice?.schedule)
  const time = now.getTime()

  return window.until !== null
    && time < window.until
    && (window.from === null || time >= window.from)
}

// The next moment at which `isNoticeActive` changes its answer, or null when
// nothing will change. Lets an open page show or hide the card on time
// instead of waiting for a reload.
export const nextNoticeChange = (notice: SiteNotice | null | undefined, now: Date): Date | null => {
  const window = noticeWindow(notice?.schedule)
  const time = now.getTime()

  if (window.until === null || time >= window.until) {
    return null
  }

  return new Date(window.from !== null && time < window.from ? window.from : window.until)
}

// Visitors who dismissed the notice are remembered under this prefix plus the
// fingerprint below, so a rewritten notice shows up again.
export const NOTICE_STORAGE_PREFIX = 'cafe-prana-site-notice-'

// A short fingerprint of the notice: wording, schedule and tone. Any change
// to it shows the notice again to people who dismissed the previous version.
export const noticeRevision = (notice: SiteNotice) => {
  const source = [
    notice.tone,
    notice.schedule?.from ?? '',
    notice.schedule?.until ?? '',
    notice.en.title,
    notice.en.message ?? '',
    notice.de.title,
    notice.de.message ?? ''
  ].join('|')

  let hash = 5381

  for (let index = 0; index < source.length; index++) {
    hash = ((hash << 5) + hash + source.charCodeAt(index)) | 0
  }

  return (hash >>> 0).toString(36)
}

export const noticeStorageKey = (notice: SiteNotice) => `${NOTICE_STORAGE_PREFIX}${noticeRevision(notice)}`
