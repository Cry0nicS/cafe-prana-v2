<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  image?: { src?: string, alt?: string }
}>()
</script>

<template>
  <UPageSection
    :icon="icon"
    :title="title"
    orientation="horizontal"
    reverse
  >
    <template #description>
      <div class="cafe-dropcap space-y-4 text-left leading-7 text-muted">
        <slot />
      </div>
    </template>

    <NuxtImg
      v-if="image?.src"
      :src="image.src"
      :alt="image.alt"
      format="webp"
      sizes="sm:100vw md:50vw lg:460px"
      class="aspect-[2/3] w-full rounded-2xl object-cover shadow-lg ring-1 ring-default"
      placeholder
    />
  </UPageSection>
</template>
