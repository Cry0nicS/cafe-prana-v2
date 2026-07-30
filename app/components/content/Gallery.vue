<script setup lang="ts">
type GalleryImg = { src: string, alt: string }

const props = defineProps<{
  icon?: string
  headline?: string
  title?: string
  description?: string
  images?: GalleryImg[]
}>()

const items = computed(() => props.images ?? [])
const active = ref<GalleryImg | null>(null)
</script>

<template>
  <UPageSection
    :icon="icon"
    :headline="headline"
    :title="title"
    :description="description"
  >
    <UCarousel
      v-slot="{ item }"
      :items="items"
      :arrows="items.length > 1"
      :dots="items.length > 1"
      loop
      wheel-gestures
      :ui="{
        item: 'basis-4/5 sm:basis-1/2 lg:basis-1/3',
        container: 'py-1',
        dot: 'data-[state=active]:bg-primary'
      }"
    >
      <button
        type="button"
        class="block w-full overflow-hidden rounded-xl ring-1 ring-default transition duration-300 hover:ring-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cafe-spark)]"
        :aria-label="`${item.alt} — view larger`"
        @click="active = item"
      >
        <NuxtImg
          :src="item.src"
          :alt="item.alt"
          format="webp"
          sizes="sm:80vw md:50vw lg:360px"
          class="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
          placeholder
        />
      </button>
    </UCarousel>

    <UModal
      :open="!!active"
      :title="active?.alt"
      :ui="{ content: 'max-w-3xl', header: 'sr-only' }"
      @update:open="(value) => { if (!value) active = null }"
    >
      <template #body>
        <!--
          Deliberately a plain <img> on the original file rather than <NuxtImg>.
          The `ipxStatic` provider only bakes variants for images that render
          during prerender, and this one sits behind `v-if="active"`, so its
          IPX URLs would never be generated and would 404 on click.
          The lightbox wants the full-resolution image anyway.
        -->
        <img
          v-if="active"
          :src="active.src"
          :alt="active.alt"
          loading="lazy"
          decoding="async"
          class="mx-auto max-h-[80vh] w-full rounded-lg object-contain"
        >
      </template>
    </UModal>
  </UPageSection>
</template>
