<script setup lang="ts">
const {
  bannerVisible,
  initConsent,
  acknowledgeNotice
} = useCookieConsent()
const { t } = useI18n()
const localePath = useLocalePath()

onMounted(() => {
  initConsent()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <aside
        v-if="bannerVisible"
        :aria-label="t('cookies.bannerTitle')"
        class="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
      >
        <div class="mx-auto max-w-4xl rounded-lg border border-default bg-default/95 p-4 shadow-xl ring-1 ring-default backdrop-blur sm:p-5">
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="max-w-2xl space-y-2">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-cookie"
                  class="size-5 text-primary"
                />
                <h2 class="text-base font-semibold text-highlighted">
                  {{ t('cookies.bannerTitle') }}
                </h2>
              </div>
              <p class="text-sm leading-6 text-muted">
                {{ t('cookies.bannerDescription') }}
              </p>
              <ULink
                :to="localePath('/cookies')"
                class="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                {{ t('cookies.readPolicy') }}
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4"
                />
              </ULink>
            </div>

            <div class="grid gap-2 sm:flex md:flex-col lg:flex-row">
              <UButton
                :label="t('cookies.understand')"
                color="primary"
                :aria-label="t('cookies.acknowledgeLabel')"
                @click="acknowledgeNotice"
              />
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
