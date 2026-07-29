<script setup lang="ts">
defineProps<{
  icon?: string
  headline?: string
  title?: string
  description?: string
  image?: { src?: string, alt?: string }
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const links = computed(() => [
  {
    label: t('home.events.explore'),
    to: localePath('/events'),
    icon: 'i-lucide-party-popper',
    color: 'primary' as const,
    size: 'xl' as const
  },
  {
    label: t('home.events.reserve'),
    to: localePath('/reservations'),
    icon: 'i-lucide-calendar-check',
    color: 'neutral' as const,
    variant: 'outline' as const,
    size: 'xl' as const
  }
])
</script>

<template>
  <UPageSection>
    <div class="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <p
          v-if="headline"
          class="cafe-eyebrow"
        >
          {{ headline }}
        </p>
        <div class="mt-3 flex items-center gap-2">
          <UIcon
            v-if="icon"
            :name="icon"
            class="size-6 text-primary"
          />
          <h2 class="font-serif text-3xl font-medium tracking-tight text-highlighted sm:text-4xl">
            {{ title }}
          </h2>
        </div>
        <p
          v-if="description"
          class="mt-4 text-muted"
        >
          {{ description }}
        </p>

        <div class="mt-6 space-y-4">
          <slot />
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <UButton
            v-for="link in links"
            :key="link.label"
            v-bind="link"
            class="justify-center"
          />
        </div>
      </div>

      <NuxtImg
        v-if="image?.src"
        :src="image.src"
        :alt="image.alt"
        format="webp"
        sizes="sm:100vw md:50vw lg:540px"
        class="aspect-[4/3] w-full rounded-lg object-cover shadow-lg ring-1 ring-default"
        placeholder
      />
    </div>
  </UPageSection>
</template>
