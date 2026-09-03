import type { SiteNotice } from '#shared/utils/notice'

// The notice banner's content. Locale-independent key: both languages live in
// the one file, and the component picks the wording for the current locale.
export const useSiteNotice = () => useAsyncData(
  'site-notice',
  () => queryCollection('notice').first(),
  {
    // The default mirrors the schema; the generated document type marks
    // defaulted fields optional.
    transform: (document): SiteNotice | null => document
      ? {
          tone: document.tone ?? 'warning',
          schedule: document.schedule,
          en: document.en,
          de: document.de
        }
      : null,
    default: () => null
  }
)
