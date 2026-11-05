import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import EventInvitation from '~/components/events/EventInvitation.vue'

// The close of an event page. It offers the one booking button only when there
// is something to book; otherwise it says why there isn't one.
const props = { reservationPath: '/reservations', eventsPath: '/events' }

describe('the invitation at the end of an event page', () => {
  it('offers a seat for an upcoming event that takes bookings', async () => {
    const wrapper = await mountSuspended(EventInvitation, {
      props: { ...props, upcoming: true, reservation: 'required' as const }
    })

    expect(wrapper.get('a[href="/reservations"]').text()).toBe('Reserve your seat')
    expect(wrapper.text()).toContain('Reservation required')
  })

  it('does not ask for a booking when guests can walk in', async () => {
    const wrapper = await mountSuspended(EventInvitation, {
      props: { ...props, upcoming: true, reservation: 'walkin' as const }
    })

    expect(wrapper.find('a[href="/reservations"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No booking needed')
  })

  it('points back to the other events once the date has passed', async () => {
    const wrapper = await mountSuspended(EventInvitation, {
      props: { ...props, upcoming: false, reservation: 'required' as const }
    })

    expect(wrapper.find('a[href="/reservations"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('This gathering has passed.')
    expect(wrapper.get('a[href="/events"]').text()).toBe('More events')
  })
})
