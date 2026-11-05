<script setup lang="ts">
// The Upcoming / Past switch over the events list, each with its count. A pill
// slides behind the chosen side.
export type EventTimeTab = 'upcoming' | 'past'

const model = defineModel<EventTimeTab>({ required: true })

defineProps<{
  upcoming: number
  past: number
  // The id of the list this switch controls, for assistive tech.
  controls: string
}>()

const { t } = useI18n()
const tabs = ['upcoming', 'past'] as const

// Arrow keys move between the two tabs, as in any tablist.
const tabRefs = useTemplateRef<HTMLButtonElement[]>('tab')
const step = () => {
  model.value = model.value === 'upcoming' ? 'past' : 'upcoming'
  tabRefs.value?.[tabs.indexOf(model.value)]?.focus()
}
</script>

<template>
  <div
    role="tablist"
    class="relative grid grid-cols-2 rounded-full bg-elevated/80 p-1 ring-1 ring-default backdrop-blur"
    @keydown.left.prevent="step"
    @keydown.right.prevent="step"
  >
    <span
      aria-hidden="true"
      class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-default shadow-sm ring-1 ring-default transition-transform duration-300 ease-[cubic-bezier(.3,.7,.2,1)] motion-reduce:transition-none"
      :class="model === 'past' ? 'translate-x-full' : 'translate-x-0'"
    />
    <button
      v-for="key in tabs"
      :id="`${controls}-tab-${key}`"
      :key="key"
      ref="tab"
      role="tab"
      type="button"
      :aria-selected="model === key"
      :aria-controls="controls"
      :tabindex="model === key ? 0 : -1"
      class="relative z-10 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary"
      :class="model === key ? 'text-highlighted' : 'text-muted hover:text-highlighted'"
      @click="model = key"
    >
      {{ t(`event.${key}`) }}
      <span
        class="min-w-6 rounded-full px-1.5 py-0.5 text-center font-mono text-xs transition-colors duration-200"
        :class="model === key ? 'bg-primary text-inverted' : 'bg-accented text-muted'"
      >
        {{ key === 'upcoming' ? upcoming : past }}
      </span>
    </button>
  </div>
</template>
