const COOKIE_NOTICE_STORAGE_KEY = 'cafe-prana-cookie-notice-v1'
const LEGACY_COOKIE_CONSENT_STORAGE_KEY = 'cafe-prana-cookie-consent-v1'

type StoredCookieNotice = {
  version: 1
  acknowledged: true
  updatedAt: string
}

const readStoredNotice = () => {
  const raw = window.localStorage.getItem(COOKIE_NOTICE_STORAGE_KEY)

  if (!raw) {
    return window.localStorage.getItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY) !== null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredCookieNotice>

    if (parsed.acknowledged === true) {
      return true
    }
  } catch {
    window.localStorage.removeItem(COOKIE_NOTICE_STORAGE_KEY)
  }

  return false
}

export const useCookieConsent = () => {
  const acknowledged = useState('cookie-notice-acknowledged', () => false)
  const initialized = useState('cookie-notice-initialized', () => false)

  const initConsent = () => {
    if (!import.meta.client || initialized.value) {
      return
    }

    acknowledged.value = readStoredNotice()
    initialized.value = true
  }

  const acknowledgeNotice = () => {
    acknowledged.value = true
    initialized.value = true

    if (!import.meta.client) {
      return
    }

    const payload: StoredCookieNotice = {
      version: 1,
      acknowledged: true,
      updatedAt: new Date().toISOString()
    }

    window.localStorage.setItem(COOKIE_NOTICE_STORAGE_KEY, JSON.stringify(payload))
    window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY)
  }

  const resetNotice = () => {
    acknowledged.value = false
    initialized.value = true

    if (import.meta.client) {
      window.localStorage.removeItem(COOKIE_NOTICE_STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY)
    }
  }

  const bannerVisible = computed(() => initialized.value && !acknowledged.value)

  return {
    storageKey: COOKIE_NOTICE_STORAGE_KEY,
    acknowledged,
    initialized,
    bannerVisible,
    initConsent,
    acknowledgeNotice,
    resetNotice
  }
}
