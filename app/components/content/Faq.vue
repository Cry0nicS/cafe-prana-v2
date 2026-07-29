<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="-mx-4 border-y border-default bg-muted/40 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <UPageSection
      :icon="icon"
      :title="title"
      :description="description"
      orientation="horizontal"
    >
      <div class="divide-y divide-default rounded-lg border border-default bg-elevated/60">
        <slot />
      </div>
    </UPageSection>
  </div>
</template>
