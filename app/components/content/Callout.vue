<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
}>()
</script>

<template>
  <div class="my-5 flex gap-3 rounded-lg border border-default bg-muted/40 p-4">
    <UIcon
      v-if="icon"
      :name="icon"
      class="mt-0.5 size-5 shrink-0 text-primary"
    />
    <div class="min-w-0 space-y-2 text-sm leading-6 text-muted">
      <p
        v-if="title"
        class="font-medium text-highlighted"
      >
        {{ title }}
      </p>
      <slot />
    </div>
  </div>
</template>
