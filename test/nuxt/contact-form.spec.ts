import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { defineEventHandler, readBody } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ContactForm from '~/components/contact/Form.vue'

const { toastAdd } = vi.hoisted(() => ({ toastAdd: vi.fn() }))

mockNuxtImport('useToast', () => () => ({ add: toastAdd }))

type ApiCall = { body: any }

const calls: ApiCall[] = []
let respond: () => unknown = () => ({ message: 'Contact message sent successfully', confirmationSent: true })

registerEndpoint('/api/contact', {
  method: 'POST',
  handler: defineEventHandler(async (event) => {
    calls.push({ body: await readBody(event) })

    return respond()
  })
})

const MESSAGE = 'Could you tell me whether the cacao ceremony is suitable for beginners?'

const fillForm = async (wrapper: VueWrapper, overrides: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '',
    message: MESSAGE,
    ...overrides
  }

  for (const [name, value] of Object.entries(values)) {
    await wrapper.get(`[name="${name}"]`).setValue(value)
  }
}

// The subject is a Nuxt UI select, which is not a native `<select>` element, so
// drive it through its `v-model` instead of the (teleported) dropdown.
const chooseSubject = async (wrapper: VueWrapper, subject: string) => {
  await wrapper.findComponent({ name: 'USelect' }).setValue(subject)
}

const acceptPrivacy = (wrapper: VueWrapper) => wrapper.get('button[role="checkbox"]').trigger('click')

const submit = async (wrapper: VueWrapper) => {
  await wrapper.find('form').trigger('submit')
  // One tick for validation, one for the awaited request.
  await new Promise(resolve => setTimeout(resolve, 0))
  await wrapper.vm.$nextTick()
}

describe('contact form', () => {
  beforeEach(() => {
    calls.length = 0
    toastAdd.mockReset()
    respond = () => ({ message: 'Contact message sent successfully', confirmationSent: true })
  })

  it('sends the message and confirms it to the visitor', async () => {
    const wrapper = await mountSuspended(ContactForm)

    await fillForm(wrapper)
    await chooseSubject(wrapper, 'events')
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(1)
    expect(calls[0]!.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '',
      subject: 'events',
      message: MESSAGE,
      privacyConsent: true,
      // The active UI language travels with the message so the visitor is
      // answered in the language they wrote in.
      locale: 'en'
    })

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Message sent',
      description: 'A short confirmation was also sent to your email address.',
      color: 'success'
    }))
    expect((wrapper.get('[name="firstName"]').element as HTMLInputElement).value).toBe('')
  })

  it('tells the visitor when the confirmation email could not be sent', async () => {
    respond = () => ({ message: 'Contact message sent successfully', confirmationSent: false })

    const wrapper = await mountSuspended(ContactForm)

    await fillForm(wrapper)
    await chooseSubject(wrapper, 'general')
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      color: 'success',
      description: 'The message was sent, but the confirmation email could not be sent.'
    }))
  })

  it('does not send a message without a subject or privacy consent', async () => {
    const wrapper = await mountSuspended(ContactForm)

    await fillForm(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(0)
    expect(wrapper.text()).toContain('Please choose a subject.')
    expect(wrapper.text()).toContain('Please agree to the processing of your details')
  })

  it('does not send a message that is too short', async () => {
    const wrapper = await mountSuspended(ContactForm)

    await fillForm(wrapper, { message: 'Are you open?' })
    await chooseSubject(wrapper, 'general')
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(calls).toHaveLength(0)
    expect(wrapper.text()).toContain('Please write at least a few sentences.')
  })

  it('reports a failing request without clearing what the visitor typed', async () => {
    respond = () => {
      throw createError({ statusCode: 500, statusMessage: 'Mailgun is not configured' })
    }

    const wrapper = await mountSuspended(ContactForm)

    await fillForm(wrapper)
    await chooseSubject(wrapper, 'general')
    await acceptPrivacy(wrapper)
    await submit(wrapper)

    expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Could not send message',
      color: 'error'
    }))
    expect((wrapper.get('[name="message"]').element as HTMLTextAreaElement).value).toBe(MESSAGE)
  })
})
