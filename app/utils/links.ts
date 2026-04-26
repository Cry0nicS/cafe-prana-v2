import type { NavigationMenuItem } from '@nuxt/ui'

export const navLinks: NavigationMenuItem[] = [{
  label: 'Home',
  icon: 'i-lucide-home',
  to: '/'
}, {
  label: 'Menu',
  icon: 'i-lucide-utensils',
  to: '/menu'
}, {
  label: 'Events',
  icon: 'i-lucide-party-popper',
  to: '/events'
}, {
  label: 'Reservations',
  icon: 'i-lucide-calendar-check',
  to: '/reservations'
}, {
  label: 'Contact',
  icon: 'i-lucide-mail',
  to: 'mailto:info@cafeprana.de'
}]
