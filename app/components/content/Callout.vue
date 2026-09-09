<script setup lang="ts">
// The one box in the palette. Nuxt UI ships four (note / tip / warning /
// caution) and this replaces all of them, because "which of the four?" is a
// question the owner should never have to answer - she picks a tone instead,
// and the tones are the cafe's own colours rather than a docs-site blue.
type CalloutColor = 'neutral' | 'positive' | 'caution'

const props = defineProps<{
  icon?: string
  title?: string
  color?: CalloutColor
}>()

// The tone is on the element as `data-tone` as well as in its classes: it is
// the stable, readable contract for what this box is, and it is what a test can
// assert without pinning a Tailwind class that a Nuxt UI upgrade may move.
const tone = computed(() => {
  switch (props.color) {
    case 'positive':
      return {
        name: 'positive',
        box: 'border-primary/30 bg-primary/8',
        icon: 'text-primary',
        title: 'text-highlighted'
      }
    case 'caution':
      return {
        name: 'caution',
        box: 'border-secondary/35 bg-secondary/8',
        icon: 'text-secondary',
        title: 'text-highlighted'
      }
    default:
      return {
        name: 'neutral',
        box: 'border-default bg-muted/40',
        icon: 'text-primary',
        title: 'text-highlighted'
      }
  }
})
</script>

<template>
  <div
    class="my-6 flex gap-3 rounded-xl border p-4"
    :class="tone.box"
    :data-tone="tone.name"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="mt-0.5 size-5 shrink-0"
      :class="tone.icon"
    />
    <div class="min-w-0 space-y-2 text-[0.95rem] leading-7 text-muted">
      <p
        v-if="title"
        class="font-medium"
        :class="tone.title"
      >
        {{ title }}
      </p>
      <slot />
    </div>
  </div>
</template>
