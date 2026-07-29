<script setup lang="ts">
import { CAFE_CONTACT_MAILTO } from '#shared/utils/constants'

const { footer, global } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const footerLinks = computed(() => [
  ...footer.links,
  {
    'icon': 'i-lucide-mail',
    'to': CAFE_CONTACT_MAILTO,
    'aria-label': 'Email Cafe Prana'
  }
])
</script>

<template>
  <UFooter
    class="z-10 border-t border-default bg-default"
    :ui="{ left: 'text-muted text-xs', right: 'gap-1' }"
  >
    <template #left>
      <div class="flex flex-col gap-2">
        <span class="font-mono tracking-tight">{{ footer.credits }}</span>
        <span>{{ t('footer.description') || global.description }}</span>
        <nav class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ULink
            :to="localePath('/imprint')"
            class="text-xs text-muted underline-offset-4 hover:text-highlighted hover:underline"
          >
            {{ t('footer.imprint') }}
          </ULink>
          <ULink
            :to="localePath('/privacy')"
            class="text-xs text-muted underline-offset-4 hover:text-highlighted hover:underline"
          >
            {{ t('footer.privacy') }}
          </ULink>
          <ULink
            :to="localePath('/cookies')"
            class="text-xs text-muted underline-offset-4 hover:text-highlighted hover:underline"
          >
            {{ t('footer.cookiePolicy') }}
          </ULink>
        </nav>
      </div>
    </template>

    <template #right>
      <UButton
        v-for="(link, index) of footerLinks"
        :key="index"
        v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
      />
    </template>
  </UFooter>
</template>
