<script setup lang="ts">
const { footer, global } = useAppConfig()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UFooter
    class="z-10 border-t border-default bg-default"
    :ui="{ left: 'text-muted text-xs', right: 'gap-1' }"
  >
    <template #left>
      <div class="flex flex-col gap-1">
        <span>{{ footer.credits }}</span>
        <span>{{ t('footer.description') || global.description }}</span>
        <ULink
          :to="localePath('/cookies')"
          class="text-xs text-muted underline-offset-4 hover:text-highlighted hover:underline"
        >
          {{ t('footer.cookiePolicy') }}
        </ULink>
      </div>
    </template>

    <template #right>
      <UButton
        v-for="(link, index) of footer.links"
        :key="index"
        v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
      />
    </template>
  </UFooter>
</template>
