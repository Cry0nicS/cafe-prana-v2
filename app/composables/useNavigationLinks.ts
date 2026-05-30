import type { NavigationMenuItem } from '@nuxt/ui'

export const useNavigationLinks = () => {
  const { t } = useI18n()
  const localePath = useLocalePath()

  return computed<NavigationMenuItem[]>(() => [{
    label: t('nav.home'),
    icon: 'i-lucide-home',
    to: localePath('/')
  }, {
    label: t('nav.menu'),
    icon: 'i-lucide-utensils',
    to: localePath('/menu')
  }, {
    label: t('nav.events'),
    icon: 'i-lucide-party-popper',
    to: localePath('/events')
  }, {
    label: t('nav.reservations'),
    icon: 'i-lucide-calendar-check',
    to: localePath('/reservations')
  }, {
    label: t('nav.contact'),
    icon: 'i-lucide-mail',
    to: 'mailto:info@cafeprana.de'
  }])
}
