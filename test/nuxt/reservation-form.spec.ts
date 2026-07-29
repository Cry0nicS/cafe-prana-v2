import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { defineEventHandler, readBody } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReservationForm from '~/components/reservations/Form.vue'

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))

type ApiCall = { body: any }

const calls: ApiCall[] = []
let respond: () => unknown = () => ({ message: 'Reservation created successfully', emailSent: true })

registerEndpoint('/api/reservations', {
  method: 'POST',
  handler: defineEventHandler(async (event) => {
    calls.push({ body: await readBody(event) })

    return respond()
  })
})

// Dates are relative to today, because the schema rejects anything in the past.
const nextWeekday = (weekday: number) => {
  const date = new Date()

  date.setHours(12, 0, 0, 0)

  do {
    date.setDate(date.getDate() + 1)
  } while (date.getDay() !== weekday)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

const OPEN_DAY = nextWeekday(3)
const CLOSED_MONDAY = nextWeekday(1)

const fillForm = async (wrapper: VueWrapper, overrides: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+49 152 3684 8480',
    date: OPEN_DAY,
    time: '12:30',
    guests: '4',
    message: 'Window seat if possible.',
    ...overrides
  }

  for (const [name, value] of Object.entries(values)) {
    await wrapper.get(`[name="${name}"]`).setValue(value)
  }
}

const acceptPrivacy = (wrapper: VueWrapper) => wrapper.get('button[role="checkbox"]').trigger('click')

const submit = async (wrapper: VueWrapper) => {
  await wrapper.find('form').trigger('submit')
  // One tick for validation, one for the awaited request.
  await new Promise(resolve => setTimeout(resolve, 0))
  await wrapper.vm.$nextTick()
}

describe('reservation form', () => {
  beforeEach(() => {
    calls.length = 0
    toastAdd.mockReset()
    respond = () => ({ message: 'Reservation created successfully', emailSent: true })
  })

  it('sends the reservation and confirms it to the guest', async () => {
    const wrapper = await mountSuspended(ReservationForm)

    await fillForm(wrapper)
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(1)
    expect(calls[0]!.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '+49 152 3684 8480',
      date: OPEN_DAY,
      time: '12:30',
      guests: 4,
      message: 'Window seat if possible.',
      privacyConsent: true
    })

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Reservation sent successfully',
      color: 'success'
    }))

    // The form is emptied so a reload cannot resend the same request.
    expect((wrapper.get('[name="firstName"]').element as HTMLInputElement).value).toBe('')
  })

  it('does not send a reservation without privacy consent', async () => {
    const wrapper = await mountSuspended(ReservationForm)

    await fillForm(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(0)
    expect(wrapper.text()).toContain('Please confirm the privacy policy')
  })

  it('does not send a reservation with invalid guest details', async () => {
    const wrapper = await mountSuspended(ReservationForm)

    await fillForm(wrapper, { email: 'ada@example', guests: '25' })
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(0)
    expect(wrapper.text()).toContain('Please provide a valid email address.')
    expect(wrapper.text()).toContain('Maximum 20 guests allowed.')
  })

  it('does not send a reservation on a Monday, when the cafe is closed', async () => {
    const wrapper = await mountSuspended(ReservationForm)

    await fillForm(wrapper, { date: CLOSED_MONDAY })
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(0)
    expect(wrapper.text()).toContain('Reservations are not available on Mondays.')
  })

  it('reports a failing request without clearing what the guest typed', async () => {
    respond = () => {
      throw createError({ statusCode: 500, statusMessage: 'Supabase is not configured' })
    }

    const wrapper = await mountSuspended(ReservationForm)

    await fillForm(wrapper)
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Error sending request',
      color: 'error'
    }))
    expect((wrapper.get('[name="firstName"]').element as HTMLInputElement).value).toBe('Ada')
  })
})
