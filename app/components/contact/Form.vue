<script setup lang="ts">
import { CAFE_CONTACT_EMAIL } from '#shared/utils/constants'
import { ContactSchema, contactSubjects, getContactValidationMessage } from '#shared/utils/schemas'
import type { ContactPayload, ContactSubject } from '#shared/utils/types'

type ContactFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: ContactSubject | undefined
  message: string
  privacyConsent: boolean
  locale: 'en' | 'de'
}

type ServerError = {
  data?: {
    data?: Array<{ message?: string }>
    message?: string
    statusMessage?: string
  }
  message?: string
  statusMessage?: string
}

type ContactResponse = {
  message: string
  confirmationSent: boolean
}

const toast = useToast()
const { locale, t } = useI18n()

const isSubmitting = ref(false)

const getLocale = () => locale.value === 'de' ? 'de' : 'en'

const defaultState = (): ContactFormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: undefined,
  message: '',
  privacyConsent: false,
  locale: getLocale()
})

const formState = reactive<ContactFormState>(defaultState())

watch(locale, () => {
  formState.locale = getLocale()
})

const subjectOptions = computed(() =>
  contactSubjects.map(subject => ({
    label: t(`contact.form.subjectOptions.${subject}`),
    value: subject
  }))
)

const resetFormData = () => {
  Object.assign(formState, defaultState())
}

const buildPayload = (state: ContactFormState): ContactPayload => ({
  ...state,
  subject: state.subject ?? '',
  locale: getLocale()
})

const translateContactMessage = (message?: string) => {
  if (message?.startsWith('contact.form.errors.')) {
    return t(message)
  }

  return getContactValidationMessage(message)
}

const validateContact = (state: ContactFormState) => {
  const result = ContactSchema.safeParse(buildPayload(state))

  if (result.success) {
    return []
  }

  return result.error.issues.map(issue => ({
    name: issue.path.map(String).join('.'),
    message: translateContactMessage(issue.message)
  }))
}

const getErrorDescription = (error: unknown) => {
  const serverError = error as ServerError
  const issueMessage = serverError.data?.data?.[0]?.message
  const fallbackMessage = serverError.data?.message || serverError.data?.statusMessage || serverError.statusMessage || serverError.message

  return translateContactMessage(issueMessage || fallbackMessage)
}

const sendContactMessage = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  const payload = buildPayload(formState)

  try {
    const response = await $fetch<ContactResponse>('/api/contact', {
      method: 'POST',
      body: payload
    })

    toast.add({
      title: t('contact.form.successTitle'),
      description: response.confirmationSent
        ? t('contact.form.confirmationSent')
        : t('contact.form.confirmationNotSent'),
      color: 'success',
      icon: 'i-lucide-send'
    })

    resetFormData()
  } catch (error) {
    toast.add({
      title: t('contact.form.errorTitle'),
      description: getErrorDescription(error) || t('contact.form.errorDescription', { email: CAFE_CONTACT_EMAIL }),
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UForm
    :state="formState"
    :validate="validateContact"
    :disabled="isSubmitting"
    class="rounded-lg border border-default bg-elevated/80 shadow-sm"
    @submit="sendContactMessage"
  >
    <div class="border-b border-default p-5 sm:p-6">
      <h2 class="text-2xl font-semibold tracking-normal text-highlighted">
        {{ t('contact.formTitle') }}
      </h2>
      <p class="mt-2 text-sm leading-6 text-muted">
        {{ t('contact.formDescription') }}
      </p>
    </div>

    <fieldset class="space-y-5 p-5 disabled:opacity-70 sm:p-6">
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          name="firstName"
          :label="t('contact.form.firstName')"
          required
        >
          <UInput
            v-model="formState.firstName"
            class="w-full"
            autocomplete="given-name"
            :placeholder="t('contact.form.firstNamePlaceholder')"
          />
        </UFormField>

        <UFormField
          name="lastName"
          :label="t('contact.form.lastName')"
          required
        >
          <UInput
            v-model="formState.lastName"
            class="w-full"
            autocomplete="family-name"
            :placeholder="t('contact.form.lastNamePlaceholder')"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          name="email"
          :label="t('contact.form.email')"
          required
        >
          <UInput
            v-model="formState.email"
            class="w-full"
            type="email"
            autocomplete="email"
            :placeholder="t('contact.form.emailPlaceholder')"
          />
        </UFormField>

        <UFormField
          name="phone"
          :label="t('contact.form.phone')"
          :hint="t('contact.form.optional')"
        >
          <UInput
            v-model="formState.phone"
            class="w-full"
            type="tel"
            autocomplete="tel"
            :placeholder="t('contact.form.phonePlaceholder')"
          />
        </UFormField>
      </div>

      <UFormField
        name="subject"
        :label="t('contact.form.subject')"
        required
      >
        <USelect
          v-model="formState.subject"
          class="w-full"
          :items="subjectOptions"
          value-key="value"
          label-key="label"
          :placeholder="t('contact.form.subjectPlaceholder')"
        />
      </UFormField>

      <UFormField
        name="message"
        :label="t('contact.form.message')"
        :help="t('contact.form.messageHelp')"
        required
      >
        <UTextarea
          v-model="formState.message"
          class="w-full"
          :rows="7"
          :placeholder="t('contact.form.messagePlaceholder')"
        />
      </UFormField>

      <UFormField name="privacyConsent">
        <label class="flex items-start gap-3 rounded-lg bg-muted/50 p-3 text-sm leading-6 text-toned">
          <UCheckbox
            v-model="formState.privacyConsent"
            class="mt-0.5"
          />
          <span>{{ t('contact.form.privacy') }}</span>
        </label>
      </UFormField>

      <UButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        icon="i-lucide-send"
        size="lg"
        block
      >
        {{ t('contact.form.submit') }}
      </UButton>
    </fieldset>
  </UForm>
</template>
