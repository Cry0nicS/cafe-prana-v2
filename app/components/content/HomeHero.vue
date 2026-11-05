<script setup lang="ts">
const props = defineProps<{
  headline?: string
  title?: string
  description?: string
  /** Photo from the media library, as its path (what Studio's picker writes). */
  image?: string
  /** Short description of the photo, for screen readers and search engines. */
  altText?: string
}>()

const img = computed(() => resolveContentImage(props.image, props.altText))

const { t } = useI18n()

// While an event is coming up the homepage leads with it instead of the
// welcome hero. Only `title` carries over into the poster; `headline`,
// `description` and `image` belong to the welcome hero alone.
const { data: nextEvent } = await useNextEvent()

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
  <EventsNextEventHero
    v-if="nextEvent"
    :title="title"
    :event="nextEvent"
  />
  <!--
    `horizontal` sets the side-by-side grid at `lg`; the container classes
    undo that at `lg` and apply it at `xl`, so smaller screens stack.
  -->
  <UPageHero
    v-else
    :headline="headline"
    :title="title"
    :description="description"
    :links="links"
    orientation="horizontal"
    :ui="{
      container: 'py-12 sm:py-16 lg:py-24 lg:flex lg:items-stretch xl:grid xl:grid-cols-2 xl:items-center',
      headline: 'font-mono text-xs uppercase tracking-[0.24em] text-primary',
      title: 'max-w-2xl text-left font-serif text-5xl font-medium tracking-tight sm:text-6xl',
      description: 'max-w-xl text-left text-lg text-muted',
      links: 'justify-start'
    }"
  >
    <div
      v-if="img"
      class="relative xl:p-8"
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
        :src="img.src"
        :alt="img.alt"
        format="webp"
        sizes="100vw xl:560px"
        class="relative z-10 aspect-[16/11] w-full rounded-2xl object-cover shadow-xl ring-1 ring-default"
        fetchpriority="high"
        :preload="{ fetchPriority: 'high' }"
      />
    </div>
  </UPageHero>
</template>
