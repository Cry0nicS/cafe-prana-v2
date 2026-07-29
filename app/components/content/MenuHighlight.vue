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
    class="bg-elevated/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
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
