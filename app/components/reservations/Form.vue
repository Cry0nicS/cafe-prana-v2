<script setup lang="ts">
import { CAFE_CONTACT_EMAIL } from '#shared/utils/constants'
import { reservationSlotsOn, validateReservationSlot } from '#shared/utils/opening-hours'
import type { DateParts, TimeParts } from '#shared/utils/opening-hours'
import { ReservationSchema, getReservationValidationMessage } from '#shared/utils/schemas'

type ReservationFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  message: string
  privacyConsent: boolean
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

const toast = useToast()
const { t } = useI18n()
const localePath = useLocalePath()

// The bookable days and slots come from the same opening-hours file the
// homepage shows, so the form can only offer what the cafe actually opens.
const { data: openingHours } = await useOpeningHours()

const isSubmitting = ref(false)
const showModal = ref(false)

const todayInput = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const toDateParts = (date: string): DateParts | null => {
  const [year, month, day] = date.split('-').map(Number)

  return year && month && day ? { year, month, day } : null
}

const toTimeParts = (time: string): TimeParts | null => {
  const [hour, minute] = time.split(':').map(Number)

  return Number.isInteger(hour) && Number.isInteger(minute) ? { hour: hour!, minute: minute! } : null
}

const slotsOn = (date: string) => {
  const parts = toDateParts(date)

  return parts ? reservationSlotsOn(openingHours.value, parts) : []
}

const PREFERRED_SLOT = '12:30'

// The usual lunch slot when the day offers it, otherwise the first one.
const defaultSlot = (slots: string[]) => slots.includes(PREFERRED_SLOT) ? PREFERRED_SLOT : (slots[0] ?? '')

const defaultState = (): ReservationFormState => {
  const date = todayInput()

  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date,
    time: defaultSlot(slotsOn(date)),
    guests: 2,
    message: '',
    privacyConsent: false
  }
}

const formState = reactive<ReservationFormState>(defaultState())

const availableSlots = computed(() => slotsOn(formState.date))
const dateUnavailable = computed(() => Boolean(formState.date) && availableSlots.value.length === 0)

// Changing the date changes the slots; keep the chosen time if it still
// exists, otherwise fall back so the guest never submits a stale slot.
watch(availableSlots, (slots) => {
  if (!slots.includes(formState.time)) {
    formState.time = defaultSlot(slots)
  }
})

const buildPayload = (state: ReservationFormState) => ({
  firstName: state.firstName,
  lastName: state.lastName,
  email: state.email,
  phone: state.phone,
  date: state.date,
  time: state.time,
  guests: state.guests,
  message: state.message,
  privacyConsent: state.privacyConsent
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

const validateReservation = (state: ReservationFormState) => {
  const result = ReservationSchema.safeParse(buildPayload(state))

  const errors = result.success
    ? []
    : result.error.issues.map(issue => ({
        name: issue.path.map(String).join('.'),
        message: translateReservationMessage(issue.message)
      }))

  const date = toDateParts(state.date)
  const time = toTimeParts(state.time)
  const slotIssue = date && time ? validateReservationSlot(openingHours.value, date, time) : null

  if (slotIssue && !errors.some(error => error.name === slotIssue.path)) {
    errors.push({ name: slotIssue.path, message: t(slotIssue.message) })
  }

  return errors
}

const getErrorDescription = (error: unknown) => {
  const serverError = error as ServerError
  const issueMessage = serverError.data?.data?.[0]?.message
  const fallbackMessage = serverError.data?.message || serverError.data?.statusMessage || serverError.statusMessage || serverError.message

  return translateReservationMessage(issueMessage || fallbackMessage)
}

const sendReservation = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    await $fetch('/api/reservations', {
      method: 'POST',
      body: buildPayload(formState)
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
  <UForm
    :state="formState"
    :validate="validateReservation"
    :disabled="isSubmitting"
    class="rounded-lg border border-default bg-elevated/80 p-4 shadow-sm sm:p-6"
    @submit="sendReservation"
  >
    <fieldset class="space-y-5 disabled:opacity-70">
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          name="firstName"
          :label="t('reservations.form.firstName')"
          required
        >
          <UInput
            v-model="formState.firstName"
            class="w-full"
            autocomplete="given-name"
            :placeholder="t('reservations.form.firstName')"
          />
        </UFormField>

        <UFormField
          name="lastName"
          :label="t('reservations.form.lastName')"
          required
        >
          <UInput
            v-model="formState.lastName"
            class="w-full"
            autocomplete="family-name"
            :placeholder="t('reservations.form.lastName')"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          name="email"
          :label="t('reservations.form.email')"
          required
        >
          <UInput
            v-model="formState.email"
            class="w-full"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </UFormField>

        <UFormField
          name="phone"
          :label="t('reservations.form.phone')"
        >
          <UInput
            v-model="formState.phone"
            class="w-full"
            type="tel"
            autocomplete="tel"
            placeholder="+49 345 678 9012"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
        <UFormField
          name="date"
          :label="t('reservations.form.date')"
          :error="dateUnavailable ? t('reservations.form.errors.date.closed') : undefined"
          required
        >
          <UInput
            v-model="formState.date"
            class="w-full"
            type="date"
            :min="todayInput()"
          />
        </UFormField>

        <UFormField
          name="time"
          :label="t('reservations.form.time')"
          required
        >
          <!--
            A native time input lets the guest type any minute, then the
            browser's own step validation rejects it on submit with a message we
            cannot translate. Offering the bookable slots directly avoids both.
          -->
          <USelect
            v-model="formState.time"
            class="w-full"
            :items="availableSlots"
            :disabled="dateUnavailable"
            :placeholder="t('reservations.form.noSlots')"
            icon="i-lucide-clock"
          />
        </UFormField>

        <UFormField
          name="guests"
          :label="t('reservations.form.guests')"
          required
        >
          <UInput
            v-model.number="formState.guests"
            class="w-full"
            type="number"
            :min="1"
            :max="20"
            inputmode="numeric"
          />
        </UFormField>
      </div>

      <UFormField
        name="message"
        :label="t('reservations.form.message')"
      >
        <UTextarea
          v-model="formState.message"
          class="w-full"
          :rows="4"
          :maxlength="1000"
          :placeholder="t('reservations.form.messagePlaceholder')"
        />
      </UFormField>

      <UFormField name="privacyConsent">
        <label class="flex items-start gap-3 rounded-md bg-muted/50 p-3 text-sm leading-6 text-toned">
          <UCheckbox
            v-model="formState.privacyConsent"
            class="mt-0.5"
          />
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
      </UFormField>
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
        {{ t('reservations.form.urgent', { email: CAFE_CONTACT_EMAIL }) }}
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
  </UForm>
</template>
