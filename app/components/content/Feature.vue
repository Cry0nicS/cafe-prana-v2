<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <UPageFeature
    :icon="icon"
    :title="title"
    :description="description"
  />
</template>
