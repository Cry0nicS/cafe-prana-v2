<script setup lang="ts">
import { isNoticeActive, noticeRevision, type NoticeTone } from '#shared/utils/notice'

// One key per wording, so a rewritten notice shows again for visitors who
// dismissed the previous one. Older keys are cleaned up on the way.
const STORAGE_PREFIX = 'cafe-prana-site-notice-'

const TONES: Record<NoticeTone, { icon: string, badge: string, label: string }> = {
  info: { icon: 'i-lucide-info', badge: 'bg-primary/12 text-primary', label: 'text-primary' },
  warning: { icon: 'i-lucide-triangle-alert', badge: 'bg-warning/15 text-warning', label: 'text-warning' },
  urgent: { icon: 'i-lucide-octagon-alert', badge: 'bg-error/12 text-error', label: 'text-error' }
}

const { locale, t } = useI18n()
const { data: notice } = await useSiteNotice()

const tone = computed(() => TONES[notice.value?.tone ?? 'warning'])
const text = computed(() => notice.value?.[locale.value === 'de' ? 'de' : 'en'])
const storageKey = computed(() => (notice.value ? `${STORAGE_PREFIX}${noticeRevision(notice.value)}` : ''))

// The content travels in the server payload, but the card itself is only
// decided on the visitor's device: every page is prerendered, so whether the
// visitor arrives inside the schedule, and whether they already dismissed this
// wording, is unknown on the server. A fixed overlay cannot shift the layout,
// so appearing after mount costs nothing.
const visible = ref(false)
const dismissButton = useTemplateRef('dismissButton')

const readDismissed = () => {
  try {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith(STORAGE_PREFIX) && key !== storageKey.value) {
        window.localStorage.removeItem(key)
      }
    }

    return window.localStorage.getItem(storageKey.value) !== null
  } catch {
    return false
  }
}

const dismiss = () => {
  visible.value = false

  try {
    window.localStorage.setItem(storageKey.value, new Date().toISOString())
  } catch {
    // Private mode or blocked storage: the notice simply shows again next visit.
  }
}

onMounted(() => {
  if (!text.value?.title || !isNoticeActive(notice.value, new Date()) || readDismissed()) {
    return
  }

  visible.value = true

  nextTick(() => dismissButton.value?.$el?.focus?.())
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
