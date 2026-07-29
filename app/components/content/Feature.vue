<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="group flex h-full gap-4 rounded-xl border border-default bg-elevated/50 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-[var(--cafe-spark)]/35 transition group-hover:bg-primary/15">
      <UIcon
        v-if="icon"
        :name="icon"
        class="size-5"
      />
    </span>
    <div class="min-w-0 space-y-1">
      <h3 class="font-medium leading-tight text-highlighted">
        {{ title }}
      </h3>
      <p class="text-sm leading-6 text-muted">
        {{ description }}
      </p>
    </div>
  </div>
</template>
