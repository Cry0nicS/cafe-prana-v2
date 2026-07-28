<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <details class="group p-4">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-highlighted">
      {{ label }}
      <UIcon
        name="i-lucide-chevron-down"
        class="size-5 shrink-0 transition-transform group-open:rotate-180"
      />
    </summary>
    <div class="mt-3 leading-7 text-muted">
      <slot />
    </div>
  </details>
</template>
