<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="group cafe-surface flex h-full gap-4 p-6 transition duration-300 ease-out hover:bg-elevated/70">
    <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition duration-300 group-hover:bg-primary group-hover:text-inverted">
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-5"
      />
    </span>
    <div class="min-w-0 space-y-1">
      <h3 class="font-serif text-lg leading-snug font-medium text-highlighted">
        {{ title }}
      </h3>
      <p class="text-sm leading-6 text-muted">
        {{ description }}
      </p>
    </div>
  </div>
</template>
