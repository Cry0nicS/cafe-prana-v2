<script setup lang="ts">
const {
  acknowledged,
  initialized,
  initConsent,
  acknowledgeNotice,
  resetNotice
} = useCookieConsent()

onMounted(() => {
  initConsent()
})

const currentPreference = computed(() => {
  if (!initialized.value) {
    return 'Loading notice status...'
  }

  return acknowledged.value ? 'Notice acknowledged' : 'Notice not yet acknowledged'
})
</script>

<template>
  <UPageCard
    title="Cookie notice status"
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
          label="I understand"
          icon="i-lucide-check"
          color="primary"
          @click="acknowledgeNotice"
        />
        <UButton
          label="Show notice again"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="ghost"
          @click="resetNotice"
        />
      </div>
    </template>
  </UPageCard>
</template>
