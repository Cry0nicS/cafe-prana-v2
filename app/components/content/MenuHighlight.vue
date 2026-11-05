<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  /** Photo from the media library, as its path (what Studio's picker writes). */
  image?: string
  /** Short description of the photo, for screen readers and search engines. */
  altText?: string
}>()

const img = computed(() => resolveContentImage(props.image, props.altText))
</script>

<template>
  <UPageCard
    :title="title"
    :description="description"
    orientation="horizontal"
    reverse
    class="bg-elevated/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    :ui="{ root: 'overflow-hidden', body: 'flex flex-col justify-center' }"
  >
    <NuxtImg
      v-if="img"
      :src="img.src"
      :alt="img.alt"
      format="webp"
      sizes="sm:100vw md:360px lg:260px"
      class="aspect-[4/3] w-full rounded-lg object-cover"
      placeholder
    />
  </UPageCard>
</template>
