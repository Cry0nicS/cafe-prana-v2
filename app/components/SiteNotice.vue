<script setup lang="ts">
import {
  NOTICE_STORAGE_PREFIX,
  isNoticeActive,
  nextNoticeChange,
  noticeStorageKey,
  type NoticeTone
} from '#shared/utils/notice'

const TONES: Record<NoticeTone, { icon: string, badge: string, label: string }> = {
  info: { icon: 'i-lucide-info', badge: 'bg-primary/12 text-primary', label: 'text-primary' },
  warning: { icon: 'i-lucide-triangle-alert', badge: 'bg-warning/15 text-warning', label: 'text-warning' },
  urgent: { icon: 'i-lucide-octagon-alert', badge: 'bg-error/12 text-error', label: 'text-error' }
}

// setTimeout treats anything above this as 0 and fires straight away.
const MAX_TIMEOUT_MS = 2 ** 31 - 1

const { locale, t } = useI18n()
const route = useRoute()
// Not a `.client` component, unlike the cookie notice: the content has to
// ride the server payload, since fetching it on the client would query the
// content database from the browser.
const { data: notice } = await useSiteNotice()

const tone = computed(() => TONES[notice.value?.tone ?? 'warning'])
const text = computed(() => notice.value?.[locale.value === 'de' ? 'de' : 'en'])
const storageKey = computed(() => (notice.value ? noticeStorageKey(notice.value) : ''))

// Everything below happens on the visitor's device: every page is prerendered,
// so whether they arrive inside the schedule, and whether they already
// dismissed this wording, is unknown on the server. A fixed overlay cannot
// shift the layout, so appearing after mount costs nothing.
const visible = ref(false)
const dismissed = ref(false)
const dismissButton = useTemplateRef('dismissButton')
let timer: ReturnType<typeof setTimeout> | undefined

const pruneOldDismissals = () => {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(NOTICE_STORAGE_PREFIX) && key !== storageKey.value) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    // Storage unavailable: nothing to prune.
  }
}

const readDismissed = () => {
  try {
    return window.localStorage.getItem(storageKey.value) !== null
  } catch {
    return false
  }
}

// Shows or hides the card for the current moment, and books the next check
// for when the schedule says the answer changes.
const evaluate = () => {
  clearTimeout(timer)

  const now = new Date()

  visible.value = Boolean(text.value?.title) && !dismissed.value && isNoticeActive(notice.value, now)

  const change = nextNoticeChange(notice.value, now)

  if (change && !dismissed.value) {
    timer = setTimeout(evaluate, Math.min(change.getTime() - now.getTime() + 1000, MAX_TIMEOUT_MS))
  }
}

const dismiss = () => {
  dismissed.value = true
  visible.value = false
  clearTimeout(timer)

  try {
    window.localStorage.setItem(storageKey.value, new Date().toISOString())
  } catch {
    // Private mode or blocked storage: the notice simply shows again next visit.
  }
}

onMounted(() => {
  pruneOldDismissals()
  dismissed.value = readDismissed()
  evaluate()
})

onBeforeUnmount(() => clearTimeout(timer))

// A visitor who arrived before the start and keeps browsing should still see
// the notice once it begins; the timer covers a page left open, this covers
// navigation in between.
watch(() => route.path, evaluate)

watch(visible, (isVisible) => {
  if (isVisible) {
    nextTick(() => dismissButton.value?.$el?.focus?.())
  }
})

useEventListener(document, 'keydown', (event) => {
  if (visible.value && event.key === 'Escape') {
    dismiss()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible && text"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-default/60 p-4 backdrop-blur-sm sm:p-6"
        @click.self="dismiss"
      >
        <Transition
          appear
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="translate-y-3 scale-[0.98] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-notice-title"
            :aria-describedby="text.message ? 'site-notice-message' : undefined"
            class="relative w-full max-w-md rounded-2xl border border-default bg-default/85 p-6 shadow-2xl ring-1 ring-default backdrop-blur-md sm:p-7"
          >
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="t('notice.close')"
              class="absolute end-3 top-3"
              @click="dismiss"
            />

            <div class="flex items-start gap-4">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full"
                :class="tone.badge"
              >
                <UIcon
                  :name="tone.icon"
                  class="size-5"
                />
              </span>

              <div class="min-w-0 space-y-2 pe-6">
                <p
                  class="font-mono text-[0.7rem] uppercase tracking-[0.24em]"
                  :class="tone.label"
                >
                  {{ t('notice.label') }}
                </p>
                <h2
                  id="site-notice-title"
                  class="font-serif text-xl font-medium leading-snug tracking-tight text-highlighted sm:text-2xl"
                >
                  {{ text.title }}
                </h2>
                <p
                  v-if="text.message"
                  id="site-notice-message"
                  class="text-sm leading-6 text-muted"
                >
                  {{ text.message }}
                </p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <UButton
                ref="dismissButton"
                :label="t('notice.dismiss')"
                color="primary"
                @click="dismiss"
              />
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
