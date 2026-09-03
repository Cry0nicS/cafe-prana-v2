<script setup lang="ts">
import { isNoticeActive, noticeRevision, noticeWindow, type NoticeTone } from '#shared/utils/notice'

type BannerColor = 'primary' | 'warning' | 'error'

const TONES: Record<NoticeTone, { color: BannerColor, icon: string }> = {
  info: { color: 'primary', icon: 'i-lucide-info' },
  warning: { color: 'warning', icon: 'i-lucide-triangle-alert' },
  urgent: { color: 'error', icon: 'i-lucide-octagon-alert' }
}

const { locale, t } = useI18n()
const { data: notice } = await useSiteNotice()

const enabled = computed(() => Boolean(notice.value?.enabled))
const tone = computed(() => TONES[notice.value?.tone ?? 'warning'])
const text = computed(() => notice.value?.[locale.value === 'de' ? 'de' : 'en'])
const revision = computed(() => (notice.value ? noticeRevision(notice.value) : ''))
const bounds = computed(() => noticeWindow(notice.value?.schedule))

// Every page is prerendered, so the server cannot know whether the visitor
// arrives inside the schedule. The banner is rendered whenever the notice is
// switched on, and the visitor's clock decides in two steps: an inline script
// hides it before first paint when the schedule says so (no layout shift), and
// the same check runs again after hydration to drop it from the DOM.
const active = ref(enabled.value)

onMounted(() => {
  active.value = isNoticeActive(notice.value, new Date())

  if (active.value) {
    document.documentElement.style.removeProperty('--site-notice-display')
  }
})

useHead(() => {
  if (!enabled.value) {
    return {}
  }

  const from = JSON.stringify(bounds.value.from)
  const until = JSON.stringify(bounds.value.until)

  return {
    script: [{
      key: 'prehydrate-site-notice',
      type: 'text/javascript',
      tagPosition: 'head',
      innerHTML: `(function(){try{var n=Date.now(),f=${from},u=${until};if((f!==null&&n<f)||(u!==null&&n>=u)){document.documentElement.style.setProperty('--site-notice-display','none')}}catch(e){}})();`
    }],
    style: [{
      key: 'site-notice-style',
      tagPosition: 'head',
      innerHTML: '.site-notice{display:var(--site-notice-display,block)}'
    }]
  }
})
</script>

<template>
  <div
    v-if="active && text"
    class="site-notice -mx-4 sm:-mx-6 lg:-mx-8"
  >
    <UBanner
      :id="`site-notice-${revision}`"
      as="aside"
      :aria-label="t('notice.label')"
      :color="tone.color"
      :icon="tone.icon"
      close
      :ui="{
        container: 'h-auto min-h-12 items-start py-3 sm:items-center',
        left: 'hidden lg:hidden',
        center: 'flex-1 items-start gap-2.5 sm:items-center',
        right: 'flex-none lg:flex-none',
        icon: 'mt-0.5 sm:mt-0',
        title: 'whitespace-normal overflow-visible text-clip leading-6'
      }"
    >
      <template #title>
        <span class="block font-semibold text-inverted sm:inline">{{ text.title }}</span>
        <span
          v-if="text.message"
          class="block text-inverted/85 sm:ms-1.5 sm:inline"
        >{{ text.message }}</span>
      </template>
    </UBanner>
  </div>
</template>
