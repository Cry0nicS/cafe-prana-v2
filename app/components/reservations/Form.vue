<script setup lang="ts">
import { ReservationSchema, getReservationValidationMessage } from '#shared/utils/schemas'
import type { ReservationPayload } from '#shared/utils/types'

type FieldKey
  = | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'date'
    | 'time'
    | 'guests'
    | 'message'
    | 'privacyConsent'

type ServerError = {
  data?: {
    data?: Array<{ message?: string }>
    message?: string
    statusMessage?: string
  }
  message?: string
  statusMessage?: string
}

const toast = useToast()
const { t } = useI18n()
const localePath = useLocalePath()

const isSubmitting = ref(false)
const showModal = ref(false)

const formId = useId()

const todayInput = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const defaultState = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  date: todayInput(),
  time: '12:30',
  guests: 2,
  message: '',
  privacyConsent: false
})

const formState = reactive(defaultState())

const fieldIds = computed<Record<FieldKey, string>>(() => ({
  firstName: `${formId}-first-name`,
  lastName: `${formId}-last-name`,
  email: `${formId}-email`,
  phone: `${formId}-phone`,
  date: `${formId}-date`,
  time: `${formId}-time`,
  guests: `${formId}-guests`,
  message: `${formId}-message`,
  privacyConsent: `${formId}-privacy-consent`
}))

const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)

  return {
    year: year ?? Number.NaN,
    month: month ?? Number.NaN,
    day: day ?? Number.NaN
  }
}

const parseTime = (time: string) => {
  const [hour, minute = 0] = time.split(':').map(Number)

  return {
    hour: hour ?? Number.NaN,
    minute,
    second: 0
  }
}

const isDateUnavailable = (date: string) => {
  if (!date) return false

  const { year, month, day } = parseDate(date)

  if (year === 2026 && month === 1 && day === 5) {
    return false
  }

  return new Date(year, month - 1, day, 12).getDay() === 1
}

const dateUnavailable = computed(() => isDateUnavailable(formState.date))

const buildPayload = (): ReservationPayload => ({
  firstName: formState.firstName,
  lastName: formState.lastName,
  email: formState.email,
  phone: formState.phone,
  date: parseDate(formState.date),
  time: parseTime(formState.time),
  guests: formState.guests,
  message: formState.message,
  privacyConsent: formState.privacyConsent
})

const resetFormData = () => {
  Object.assign(formState, defaultState())
}

const translateReservationMessage = (message?: string) => {
  if (message?.startsWith('reservations.form.errors.')) {
    return t(message)
  }

  return getReservationValidationMessage(message)
}

const getErrorDescription = (error: unknown) => {
  const serverError = error as ServerError
  const issueMessage = serverError.data?.data?.[0]?.message
  const fallbackMessage = serverError.data?.message || serverError.data?.statusMessage || serverError.statusMessage || serverError.message

  return translateReservationMessage(issueMessage || fallbackMessage)
}

const showValidationError = (message?: string) => {
  toast.add({
    title: t('reservations.form.validationTitle'),
    description: translateReservationMessage(message),
    color: 'error',
    icon: 'i-lucide-shield-alert'
  })
}

const sendReservation = async () => {
  if (isSubmitting.value) return

  if (dateUnavailable.value) {
    showValidationError(t('reservations.form.mondayUnavailable'))
    return
  }

  const payload = buildPayload()
  const result = ReservationSchema.safeParse(payload)

  if (!result.success) {
    showValidationError(result.error.issues[0]?.message)
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/reservations', {
      method: 'POST',
      body: payload
    })

    toast.add({
      title: t('reservations.form.successTitle'),
      description: t('reservations.form.successDescription'),
      color: 'success',
      icon: 'i-lucide-thumbs-up'
    })

    showModal.value = true
    resetFormData()
  } catch (error) {
    toast.add({
      title: t('reservations.form.errorTitle'),
      description: getErrorDescription(error) || t('reservations.form.errorDescription'),
      color: 'error',
      icon: 'i-lucide-shield-alert'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form
    class="rounded-lg border border-default bg-elevated/80 p-4 shadow-sm sm:p-6"
    @submit.prevent="sendReservation"
  >
    <fieldset
      :disabled="isSubmitting"
      class="space-y-5 disabled:opacity-70"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            :for="fieldIds.firstName"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.firstName') }}
          </label>
          <input
            :id="fieldIds.firstName"
            v-model="formState.firstName"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="text"
            autocomplete="given-name"
            :placeholder="t('reservations.form.firstName')"
            required
          >
        </div>

        <div>
          <label
            :for="fieldIds.lastName"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.lastName') }}
          </label>
          <input
            :id="fieldIds.lastName"
            v-model="formState.lastName"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="text"
            autocomplete="family-name"
            :placeholder="t('reservations.form.lastName')"
            required
          >
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            :for="fieldIds.email"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.email') }}
          </label>
          <input
            :id="fieldIds.email"
            v-model="formState.email"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            required
          >
        </div>

        <div>
          <label
            :for="fieldIds.phone"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.phone') }}
          </label>
          <input
            :id="fieldIds.phone"
            v-model="formState.phone"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="tel"
            autocomplete="tel"
            placeholder="+49 345 678 9012"
          >
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
        <div>
          <label
            :for="fieldIds.date"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.date') }}
          </label>
          <input
            :id="fieldIds.date"
            v-model="formState.date"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="date"
            :min="todayInput()"
            required
          >
          <p
            v-if="dateUnavailable"
            class="mt-2 text-sm text-error"
          >
            {{ t('reservations.form.mondayUnavailable') }}
          </p>
        </div>

        <div>
          <label
            :for="fieldIds.time"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.time') }}
          </label>
          <input
            :id="fieldIds.time"
            v-model="formState.time"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="time"
            min="07:00"
            max="16:00"
            step="900"
            required
          >
        </div>

        <div>
          <label
            :for="fieldIds.guests"
            class="block text-sm font-medium text-highlighted"
          >
            {{ t('reservations.form.guests') }}
          </label>
          <input
            :id="fieldIds.guests"
            v-model.number="formState.guests"
            class="mt-2 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            type="number"
            min="1"
            max="20"
            inputmode="numeric"
            required
          >
        </div>
      </div>

      <div>
        <label
          :for="fieldIds.message"
          class="block text-sm font-medium text-highlighted"
        >
          {{ t('reservations.form.message') }}
        </label>
        <textarea
          :id="fieldIds.message"
          v-model="formState.message"
          class="mt-2 min-h-28 w-full rounded-md border border-default bg-default px-3 py-2.5 text-sm text-highlighted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          maxlength="1000"
          :placeholder="t('reservations.form.messagePlaceholder')"
        />
      </div>

      <label class="flex items-start gap-3 rounded-md bg-muted/50 p-3 text-sm leading-6 text-toned">
        <input
          :id="fieldIds.privacyConsent"
          v-model="formState.privacyConsent"
          class="mt-1 size-4 rounded border-default accent-primary"
          type="checkbox"
          required
        >
        <span>
          {{ t('reservations.form.privacyPrefix') }}
          <NuxtLink
            :to="localePath('/cookies')"
            class="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
          >
            {{ t('reservations.form.privacyLink') }}
          </NuxtLink>.
          {{ t('reservations.form.privacySuffix') }}
        </span>
      </label>
    </fieldset>

    <UAlert
      icon="i-lucide-info"
      color="primary"
      variant="soft"
      class="mt-5"
      :description="t('reservations.form.info')"
    />

    <div class="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-muted">
        {{ t('reservations.form.urgent') }}
      </p>
      <UButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        icon="i-lucide-send"
        size="lg"
        class="justify-center"
      >
        {{ t('reservations.form.submit') }}
      </UButton>
    </div>

    <UModal
      v-model:open="showModal"
      :title="t('reservations.form.modalTitle')"
      :description="t('reservations.form.modalDescription')"
      :ui="{ content: 'max-w-lg' }"
    >
      <template #body>
        <div class="space-y-4 text-sm leading-6 text-muted">
          <p>
            {{ t('reservations.form.modalBody') }}
          </p>
        </div>
      </template>

      <template #footer>
        <UButton
          icon="i-lucide-thumbs-up"
          @click="showModal = false"
        >
          {{ t('reservations.form.modalClose') }}
        </UButton>
      </template>
    </UModal>
  </form>
</template>
