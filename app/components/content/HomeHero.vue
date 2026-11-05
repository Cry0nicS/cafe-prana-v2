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
    color: 'primary' as const
  },
  {
    label: t('home.hero.directions'),
    to: '#directions',
    icon: 'i-lucide-map',
    color: 'neutral' as const,
    variant: 'outline' as const
  }
])
</script>

<template>
  <EventsNextEventHero
    v-if="nextEvent"
    :title="title"
    :event="nextEvent"
  />
  <PageHeading
    v-else
    :headline="headline"
    :title="title ?? ''"
    :description="description"
    :links="links"
    split="xl"
  >
    <template
      v-if="img"
      #aside
    >
      <div class="relative">
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
          Sizing is handled by the `aspect-[4/3]` class, so no width/height
          attributes: those feed IPX modifiers and would crop the source.
        -->
        <NuxtImg
          :src="img.src"
          :alt="img.alt"
          format="webp"
          sizes="100vw xl:560px"
          class="relative z-10 aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/15 ring-1 ring-default"
          fetchpriority="high"
          :preload="{ fetchPriority: 'high' }"
        />
      </div>
    </template>
  </PageHeading>
</template>
