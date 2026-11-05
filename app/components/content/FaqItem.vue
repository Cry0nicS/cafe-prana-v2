<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <details class="group px-6 py-5">
    <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-serif text-lg font-medium text-highlighted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
      {{ label }}
      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180"
      />
    </summary>
    <div class="mt-3 leading-7 text-muted">
      <slot />
    </div>
  </details>
</template>
