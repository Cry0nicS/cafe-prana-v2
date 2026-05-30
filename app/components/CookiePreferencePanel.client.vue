<script setup lang="ts">
const {
  acknowledged,
  initialized,
  initConsent,
  acknowledgeNotice,
  resetNotice
} = useCookieConsent()
const { t } = useI18n()

onMounted(() => {
  initConsent()
})

const currentPreference = computed(() => {
  if (!initialized.value) {
    return t('cookies.loading')
  }

  return acknowledged.value ? t('cookies.acknowledged') : t('cookies.notAcknowledged')
})
</script>

<template>
  <UPageCard
    :title="t('cookies.statusTitle')"
    :description="currentPreference"
    icon="i-lucide-info"
    variant="subtle"
    :ui="{
      root: 'rounded-lg'
    }"
  >
    <template #footer>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <UButton
          :label="t('cookies.understand')"
          icon="i-lucide-check"
          color="primary"
          @click="acknowledgeNotice"
        />
        <UButton
          :label="t('cookies.showAgain')"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          @click="resetNotice"
        />
      </div>
    </template>
  </UPageCard>
</template>
