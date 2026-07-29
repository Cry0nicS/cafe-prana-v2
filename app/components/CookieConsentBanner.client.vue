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
        class="fixed inset-x-0 bottom-0 z-50 p-3 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:p-5"
      >
        <div class="mx-auto w-full rounded-xl border border-default bg-default/75 p-4 shadow-xl ring-1 ring-default backdrop-blur-md sm:mx-0 sm:w-[22rem]">
          <div class="flex items-start gap-2.5">
            <UIcon
              name="i-lucide-cookie"
              class="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div class="space-y-1">
              <h2 class="text-sm font-semibold text-highlighted">
                {{ t('cookies.bannerTitle') }}
              </h2>
              <p class="text-xs leading-5 text-muted">
                {{ t('cookies.bannerDescription') }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <ULink
              :to="localePath('/cookies')"
              class="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              {{ t('cookies.readPolicy') }}
              <UIcon
                name="i-lucide-arrow-right"
                class="size-3.5"
              />
            </ULink>
            <UButton
              :label="t('cookies.understand')"
              color="primary"
              size="sm"
              :aria-label="t('cookies.acknowledgeLabel')"
              @click="acknowledgeNotice"
            />
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
