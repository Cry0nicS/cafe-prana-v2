<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const links = computed(() => [
  {
    label: t('home.menu.explore'),
    to: localePath('/menu'),
    icon: 'i-lucide-utensils',
    color: 'primary' as const,
    size: 'xl' as const
  },
  {
    label: t('home.menu.book'),
    to: localePath('/reservations'),
    icon: 'i-lucide-calendar-check',
    color: 'neutral' as const,
    variant: 'outline' as const,
    size: 'xl' as const
  }
])
</script>

<template>
  <div class="-mx-4 border-y border-default bg-muted/40 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <UPageSection
      id="menu"
      :icon="icon"
      :title="title"
      :description="description"
    >
      <UPageGrid class="gap-6 lg:grid-cols-2">
        <slot />
      </UPageGrid>

      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <UButton
          v-for="link in links"
          :key="link.label"
          v-bind="link"
          class="justify-center"
        />
      </div>
    </UPageSection>
  </div>
</template>
