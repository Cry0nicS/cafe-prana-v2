<script setup lang="ts">
defineProps<{
  headline?: string
  title?: string
  description?: string
  image?: { src?: string, alt?: string }
}>()

const { t } = useI18n()

const links = computed(() => [
  {
    label: t('home.hero.menu'),
    to: '#menu',
    icon: 'i-lucide-sparkles',
    color: 'primary' as const,
    size: 'xl' as const
  },
  {
    label: t('home.hero.directions'),
    to: '#directions',
    icon: 'i-lucide-map',
    color: 'neutral' as const,
    variant: 'outline' as const,
    size: 'xl' as const
  }
])
</script>

<template>
  <UPageHero
    :headline="headline"
    :title="title"
    :description="description"
    :links="links"
    orientation="horizontal"
    :ui="{
      container: 'py-12 sm:py-16 lg:py-24',
      headline: 'font-mono text-xs uppercase tracking-[0.24em] text-primary',
      title: 'max-w-2xl text-left font-serif text-5xl font-medium tracking-tight sm:text-6xl',
      description: 'max-w-xl text-left text-lg text-muted',
      links: 'justify-start'
    }"
  >
    <div
      v-if="image?.src"
      class="relative p-6 sm:p-8"
    >
      <div
        class="cafe-aura"
        aria-hidden="true"
      />
      <!--
        This is the LCP element, so it intentionally differs from the other
        images on the site:
        - No `placeholder`. NuxtImg drops `srcset`/`sizes` from the server-
          rendered markup while a placeholder is showing, so the real image
          would only start downloading after hydration.
        - `preload` emits a `<link rel="preload">` with the responsive
          `imagesrcset`, so the browser starts fetching it during head parsing.
        Sizing is handled by the `aspect-[16/11]` class, so no width/height
        attributes: those feed IPX modifiers and would crop the source.
      -->
      <NuxtImg
        :src="image.src"
        :alt="image.alt"
        format="webp"
        sizes="sm:100vw md:50vw lg:560px"
        class="relative z-10 aspect-[16/11] w-full rounded-2xl object-cover shadow-xl ring-1 ring-default"
        fetchpriority="high"
        :preload="{ fetchPriority: 'high' }"
      />
    </div>
  </UPageHero>
</template>
