<script setup lang="ts">
const props = defineProps<{
  icon?: string
  title?: string
  /** Photo from the media library, as its path (what Studio's picker writes). */
  image?: string
  /** Short description of the photo, for screen readers and search engines. */
  altText?: string
}>()

const img = computed(() => resolveContentImage(props.image, props.altText))
</script>

<template>
  <UPageSection
    :icon="icon"
    :title="title"
    orientation="horizontal"
    reverse
  >
    <template #description>
      <div class="cafe-dropcap space-y-4 text-left text-lg leading-8 text-pretty text-muted">
        <slot />
      </div>
    </template>

    <NuxtImg
      v-if="img"
      :src="img.src"
      :alt="img.alt"
      format="webp"
      sizes="sm:100vw md:50vw lg:460px"
      class="aspect-[2/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/15 ring-1 ring-default"
      placeholder
    />
  </UPageSection>
</template>
