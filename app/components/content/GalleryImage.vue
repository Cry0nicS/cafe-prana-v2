<script setup lang="ts">
defineProps<{
  src?: string
  alt?: string
}>()
</script>

<template>
  <div class="w-4/5 shrink-0 snap-start sm:w-1/2 lg:w-1/3">
    <NuxtImg
      v-if="src"
      :src="src"
      :alt="alt"
      format="webp"
      sizes="sm:80vw md:50vw lg:360px"
      class="aspect-[4/5] w-full rounded-lg object-cover ring-1 ring-default"
      placeholder
    />
  </div>
</template>
