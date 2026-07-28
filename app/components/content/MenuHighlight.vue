<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  image?: { src?: string, alt?: string }
}>()
</script>

<template>
  <UPageCard
    :title="title"
    :description="description"
    orientation="horizontal"
    reverse
    class="bg-muted/50"
    :ui="{ root: 'overflow-hidden', body: 'flex flex-col justify-center' }"
  >
    <NuxtImg
      v-if="image?.src"
      :src="image.src"
      :alt="image.alt"
      format="webp"
      sizes="sm:100vw md:360px lg:260px"
      class="aspect-[4/3] w-full rounded-lg object-cover"
      placeholder
    />
  </UPageCard>
</template>
